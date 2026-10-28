import Stripe from 'stripe';
import { database, required } from '../../../lib/server.mjs';
import { verifyPayment } from '../../../lib/quote.mjs';
import { paidMail, tryDrainMail } from '../../../lib/mail.mjs';
export const runtime = 'nodejs';
// Public callback for the preview's sandbox checkout. It never creates charges
// and does not use or change the business's live Stripe API key.
export async function POST(req) {
  let event;
  try {
    event = Stripe.webhooks.constructEvent(await req.text(), req.headers.get('stripe-signature'), required('STRIPE_SANDBOX_WEBHOOK_SECRET'));
  } catch { return Response.json({ error: 'Invalid sandbox webhook signature or configuration.' }, { status: 400 }); }
  if (event.livemode !== false) return Response.json({ error: 'Sandbox events only.' }, { status: 400 });
  if (!['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired'].includes(event.type)) return Response.json({ received: true });
  const session = event.data.object;
  if (!session.metadata?.order_id) return Response.json({ received: true });
  try {
    const db = database();
    const found = await db.from('permit_orders').select('*').eq('order_number',session.metadata.order_id).single();
    if (found.error || !found.data) throw new Error('Order not found');
    let order = found.data;
    if (order.quote?.stripeMode !== 'test' || session.metadata.stripe_mode !== 'test') return Response.json({ error: 'Order is not a sandbox quote.' }, { status: 400 });
    // Ignore stale, correctly signed events from an expired/replaced quote.
    if (session.id !== order.stripe_session_id || session.metadata.quote_revision !== order.quote_revision) return Response.json({ received: true, ignored: true });
    if (event.type === 'checkout.session.expired') {
      const expired = await db.from('permit_orders').update({order_status:'pending_review',payment_status:'expired',stripe_session_id:null,stripe_checkout_url:null}).eq('order_number',order.order_number).eq('stripe_session_id',session.id).eq('payment_status','pending');
      if (expired.error) throw new Error('Expiry update failed');
    } else if (session.payment_status === 'paid') {
      if (!verifyPayment(order,session)) throw new Error('Payment amount mismatch');
      if (order.payment_status !== 'paid') {
        const saved = await db.from('permit_orders').update({payment_status:'paid',order_status:'paid',stripe_payment_intent:typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id,paid_at:new Date().toISOString()}).eq('order_number',order.order_number).eq('stripe_session_id',session.id).eq('payment_status','pending').select('*').single();
        if (saved.error) throw new Error('Payment update failed');
        order = saved.data;
      }
      await paidMail(db,order);
      await tryDrainMail(db);
    }
    return Response.json({received:true});
  } catch { console.error('Sandbox event processing failed'); return Response.json({error:'Event processing failed; retry required.'},{status:500}); }
}
