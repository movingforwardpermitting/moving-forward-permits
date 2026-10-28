import { randomUUID, createHash } from 'node:crypto';
import { prepareOrder } from '../../../lib/order.mjs';
import { database, jsonBody, badRequest, failure, required, siteUrl } from '../../../lib/server.mjs';
import { intakeMail, tryDrainMail } from '../../../lib/mail.mjs';

// Retains the existing URL; initial requests now require review before payment.
export async function POST(req) {
  try {
    const origin = req.headers.get('origin');
    if (origin && origin !== siteUrl()) throw Object.assign(new Error('Request origin not allowed.'), { status: 403 });
    const input = await jsonBody(req);
    if (input.website) throw badRequest('Unable to accept this request.');
    let prepared;
    try { prepared = prepareOrder(input); } catch (error) { throw badRequest(error.message); }
    if (!/^[a-f0-9-]{36}$/i.test(input.requestKey || '')) throw badRequest('Please refresh the page and try again.');
    const db = database();
    const ip = req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    for (const value of [`ip:${ip}`, `email:${prepared.customer.email}`]) {
      const rateKey = createHash('sha256').update(required('RATE_LIMIT_SALT')).update(value).digest('hex');
      const rate = await db.rpc('allow_permit_request', { request_hash: rateKey });
      if (rate.error) throw new Error('Request limits unavailable');
      if (!rate.data) throw Object.assign(new Error('Too many requests. Please contact us for help.'), { status: 429 });
    }
    const fingerprint = createHash('sha256').update(JSON.stringify(prepared)).digest('hex');
    const record = {
      order_number: randomUUID(), request_key: input.requestKey, request_fingerprint: fingerprint,
      company_name: prepared.customer.companyName, usdot: prepared.customer.usdot,
      mc_number: prepared.customer.mcNumber || null, vin: prepared.customer.vin,
      plate_number: prepared.customer.plateNumber, phone_number: prepared.customer.phoneNumber,
      contact_email: prepared.customer.email, customer_details: prepared.customer,
      permit_type: prepared.orderItems[0].permitType, permit_state: prepared.orderItems[0].state,
      processing_type: prepared.rush ? 'Rush' : 'Standard', total: 0,
      order_items: prepared.orderItems, order_status: 'pending_review', payment_status: 'not_requested',
    };
    const { data: inserted, error } = await db.from('permit_orders').insert(record).select('*').single();
    let order = inserted;
    if (error?.code === '23505') {
      const existing = await db.from('permit_orders').select('*').eq('request_key', input.requestKey).single();
      if (existing.error || existing.data?.request_fingerprint !== fingerprint) throw badRequest('This request changed. Refresh before submitting a new request.');
      order = existing.data;
    } else if (error) throw new Error('Order storage unavailable');
    await intakeMail(db, order);
    await tryDrainMail(db);
    return Response.json({ orderNumber: order.order_number, message: 'Request received. We will review the fees and send a secure payment link.' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}
