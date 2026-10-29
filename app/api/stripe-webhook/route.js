import { database, stripeClient, required } from '../../../lib/server.mjs';
import { verifyPayment } from '../../../lib/quote.mjs';
import { paidMail, tryDrainMail } from '../../../lib/mail.mjs';
export const runtime = 'nodejs';
export async function POST(req) {
  let event;
  try { event = stripeClient().webhooks.constructEvent(await req.text(), req.headers.get('stripe-signature'), required('STRIPE_WEBHOOK_SECRET')); }
  catch { return Response.json({ error: 'Invalid webhook signature or configuration.' }, { status: 400 }); }
  if (event.livemode !== (required('STRIPE_MODE') === 'live')) return Response.json({ error: 'Unexpected payment mode.' }, { status: 400 });
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.expired'].includes(event.type)) return Response.json({ received: true });
  try {
    const session = event.data.object;
    if (!session.metadata?.order_id) return Response.json({ received: true });
    const db = database();
    const result = await db.from('permit_orders').select('*').eq('order_number', session.metadata.order_id).single();
    if (result.error || !result.data) throw new Error('Order not found');
    let order = result.data;
    if (session.id !== order.stripe_session_id || session.metadata.quote_revision !== order.quote_revision) throw new Error('Session mismatch');
    if (event.type === 'checkout.session.expired') {
      const result = await db.from('permit_orders').update({ order_status: 'pending_review', payment_status: 'expired', stripe_session_id: null, stripe_checkout_url: null }).eq('order_number', order.order_number).eq('stripe_session_id', session.id).eq('payment_status', 'pending');
      if (result.error) throw new Error('Expiry update failed');
    } else if (session.payment_status === 'paid') {
      if (!verifyPayment(order, session)) throw new Error('Payment does not match approved amount');
      if (order.payment_status !== 'paid') {
        const result = await db.from('permit_orders').update({ payment_status: 'paid', order_status: 'paid', stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id, paid_at: new Date().toISOString() }).eq('order_number', order.order_number).eq('stripe_session_id', session.id).eq('payment_status', 'pending').select('*').single();
        if (result.error) throw new Error('Payment update failed');
        order = result.data;
      }
      // Unique queue keys allow Stripe retries to repair partial notification failures.
      await paidMail(db, order);
      await tryDrainMail(db);
    }
    return Response.json({ received: true });
  } catch { console.error('Stripe event processing failed'); return Response.json({ error: 'Event processing failed; retry required.' }, { status: 500 }); }
}
