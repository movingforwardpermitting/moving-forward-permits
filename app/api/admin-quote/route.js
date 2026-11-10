import { randomUUID } from 'node:crypto';
import { requireAdmin, jsonBody, badRequest, failure, siteUrl, stripeClient, required } from '../../../lib/server.mjs';
import { reviewedQuote } from '../../../lib/quote.mjs';
import { queueMail, html, tryDrainMail } from '../../../lib/mail.mjs';
export async function POST(req) {
  let stage = 'validation';
  try {
    const { db, user } = await requireAdmin(req);
    if (process.env.PAYMENTS_ENABLED !== 'true') throw Object.assign(new Error('Payments are not enabled yet. Complete payment setup and testing first.'), { status: 409 });
    const body = await jsonBody(req);
    const result = await db.from('permit_orders').select('*').eq('order_number', body.orderNumber).single();
    if (result.error || !result.data) throw badRequest('Order not found.');
    let order = result.data;
    if (!['not_requested','expired','pending'].includes(order.payment_status)) throw badRequest('This order is not eligible for a new payment request.');
    if (order.customer_details?.paymentPreference === 'phone_card') throw badRequest('Phone-card collection requires a separate verified Stripe Dashboard payment workflow. This order cannot be sent an automatic payment link until its preference is changed. Never type card details into the admin form.');
    if (!order.contact_email) throw badRequest('This legacy order has no verified delivery contact. Collect fresh intake before requesting payment.');
    if (order.order_status === 'payment_requested') {
      if (!order.stripe_checkout_url) throw badRequest('Payment request is being prepared. Refresh shortly.');
    } else {
      if (!['pending_review', 'missing_information', 'quote_preparing'].includes(order.order_status)) throw badRequest('Order is not ready for a payment request.');
      if (order.order_status !== 'quote_preparing') {
        let quote;
        try { quote = { ...reviewedQuote(order, body), stripeMode: required('STRIPE_MODE'), reviewUrl: siteUrl() }; } catch (error) { throw badRequest(error.message); }
        const saved = await db.from('permit_orders').update({ quote, total: quote.totalCents / 100, order_status: 'quote_preparing', quote_revision: randomUUID(), approved_by: user.id, approved_at: new Date().toISOString() }).eq('order_number', order.order_number).eq('order_status', order.order_status).select('*').single();
        if (saved.error) throw badRequest('Order changed. Refresh and try again.');
        order = saved.data;
      }
      stage = 'create_stripe_checkout';
      const session = await stripeClient().checkout.sessions.create({
        mode: 'payment', payment_method_types: ['card'], customer_email: order.contact_email,
        client_reference_id: order.order_number, metadata: { order_id: order.order_number, quote_revision: order.quote_revision, stripe_mode: order.quote.stripeMode },
        line_items: order.quote.lines.map((line) => ({ price_data: { currency: 'usd', unit_amount: line.stateCents + line.otherCents + line.serviceCents, product_data: { name: `${line.state} ${line.permitType}`, description: `State $${(line.stateCents / 100).toFixed(2)} + provider $${(line.otherCents / 100).toFixed(2)} + service $${(line.serviceCents / 100).toFixed(2)}` } }, quantity: 1 })),
        success_url: `${siteUrl()}/order-success`, cancel_url: `${siteUrl()}/?payment=cancelled`,
      }, { idempotencyKey: `quote-${order.order_number}-${order.quote_revision}` });
      stage = 'save_stripe_checkout';
      const saved = await db.from('permit_orders').update({ stripe_session_id: session.id, stripe_checkout_url: session.url, order_status: 'payment_requested', payment_status: 'pending' }).eq('order_number', order.order_number).eq('quote_revision', order.quote_revision).eq('order_status', 'quote_preparing').select('*').single();
      if (saved.error) throw new Error('Payment link storage failed; retry this same quote');
      order = saved.data;
    }
    const breakdown = order.quote.lines.map((line) => `<li>${html(line.state)} ${html(line.permitType)}: state $${(line.stateCents / 100).toFixed(2)}, provider $${(line.otherCents / 100).toFixed(2)}, service $${(line.serviceCents / 100).toFixed(2)}</li>`).join('');
    stage = 'queue_quote_email';
    await queueMail(db, `quote-${order.order_number}-${order.quote_revision}`, order.contact_email, `Reviewed permit quote — ${order.order_number}`, `<p>Your reviewed quote for ${html(order.order_number)}:</p><ul>${breakdown}</ul><p>Total: $${(order.quote.totalCents / 100).toFixed(2)}</p><p><a href="${html(order.stripe_checkout_url)}">Review and pay securely with Stripe</a></p><p>This link expires in 24 hours. Payment does not itself authorize travel. Permits are issued separately after processing.</p>`);
    await tryDrainMail(db);
    return Response.json({ url: order.stripe_checkout_url, totalCents: order.quote.totalCents });
  } catch (error) {
    // Expose only a fixed failure stage and Stripe's documented error code,
    // never keys, provider messages, or customer details.
    const code = typeof error?.code === 'string' && /^[a-zA-Z0-9_]{1,80}$/.test(error.code) ? error.code : '';
    const type = typeof error?.type === 'string' && /^Stripe[A-Za-z]+Error$/.test(error.type) ? error.type : '';
    const mismatch = error?.message === 'Stripe mode and key do not match';
    console.error('Quote workflow error', {stage, code:code||null, type:type||null, keyModeMismatch:mismatch});
    if (stage === 'create_stripe_checkout') {
      const explanation = mismatch
        ? 'Stripe live/test mode does not match its configured secret key.'
        : `Stripe could not create the payment link.${code ? ' Stripe error code: '+code+'.' : ''}`;
      return Response.json({error:`${explanation} Run Launch Diagnostics in the Admin Center to check the live Stripe account. No payment email was queued.`},
        {status:502,headers:{'Cache-Control':'no-store'}});
    }
    if (stage === 'save_stripe_checkout') {
      return Response.json({error:'Stripe checkout was attempted, but the payment link could not be saved to the order. The quote can be resumed without duplicating the attempt.'},
        {status:502,headers:{'Cache-Control':'no-store'}});
    }
    if (stage === 'queue_quote_email') {
      return Response.json({error:'The checkout link was saved, but the customer email could not be queued. Use Retry quote notification in the Admin Center.'},
        {status:502,headers:{'Cache-Control':'no-store'}});
    }
    return failure(error);
  }
}
