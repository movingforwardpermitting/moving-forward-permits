import { randomUUID } from 'node:crypto';
import { requireAdmin, required, stripeClient, siteUrl, failure } from '../../../lib/server.mjs';
// Admin-only integration fixture. No carrier credentials, state applications,
// real customers or real money are involved.
export async function POST(req) {
  try {
    const { db, user } = await requireAdmin(req);
    if (required('STRIPE_MODE') !== 'test' || process.env.PAYMENTS_ENABLED !== 'true') return Response.json({ error: 'Sandbox testing is not enabled in this environment.' }, { status: 409 });
    if (!user.email || !user.email_confirmed_at) return Response.json({ error: 'A verified admin email is required.' }, { status: 400 });
    const limit = await db.rpc('allow_permit_request', { request_hash: `sandbox-checkout-${user.id}` });
    if (limit.error) throw new Error('Test rate limit unavailable');
    if (!limit.data) return Response.json({ error: 'Test limit reached. Try again later.' }, { status: 429 });
    const orderNumber = randomUUID(), revision = randomUUID();
    const line = { state: 'Sandbox', permitType: 'Integration test — no permit', stateCents: 0, otherCents: 0, serviceCents: 100, serviceCount: 1 };
    const order = { order_number: orderNumber, company_name: 'SANDBOX TEST — DO NOT PROCESS', contact_email: user.email,
      customer_details: { contactName: 'Administrator test', email: user.email, testOnly: true },
      order_items: [{ state: line.state, permitType: line.permitType, details: { 'Additional Notes': 'Simulation only. No actual vehicle, permit, or state fee.' } }],
      permit_state: line.state, permit_type: line.permitType, processing_type: 'Standard',
      quote: { stripeMode: 'test', totalCents: 100, currency: 'usd', lines: [line], reviewUrl: siteUrl(), testFixture: true },
      quote_revision: revision, approved_by: user.id, approved_at: new Date().toISOString(),
      payment_status: 'pending', order_status: 'quote_preparing', total: 1 };
    const inserted = await db.from('permit_orders').insert(order);
    if (inserted.error) throw new Error('Unable to save sandbox test');
    const session = await stripeClient().checkout.sessions.create({ mode: 'payment', payment_method_types: ['card'], customer_email: user.email,
      client_reference_id: orderNumber, metadata: { order_id: orderNumber, quote_revision: revision, stripe_mode: 'test' },
      line_items: [{ price_data: { currency: 'usd', unit_amount: 100, product_data: { name: 'Moving Forward — sandbox integration test', description: 'Simulation only. No real charge and no state permit.' } }, quantity: 1 }],
      success_url: `${siteUrl()}/order-success`, cancel_url: `${siteUrl()}/admin`,
    }, { idempotencyKey: `sandbox-fixture-${orderNumber}` });
    if (session.livemode !== false) throw new Error('Unexpected live checkout');
    const saved = await db.from('permit_orders').update({ stripe_session_id: session.id, stripe_checkout_url: session.url, order_status: 'payment_requested' }).eq('order_number', orderNumber);
    if (saved.error) throw new Error('Unable to save sandbox checkout');
    return Response.json({ url: session.url, orderNumber });
  } catch (error) { return failure(error); }
}
