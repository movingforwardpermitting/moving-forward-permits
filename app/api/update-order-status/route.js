import { requireAdmin, jsonBody, badRequest, failure } from '../../../lib/server.mjs';
export async function POST(req) {
  try {
    const { db, user } = await requireAdmin(req);
    const body = await jsonBody(req);
    const transitions = { pending_review: ['missing_information', 'cancelled'], missing_information: ['pending_review', 'cancelled'], paid: ['processing', 'blocked'], processing: ['issued', 'blocked'], blocked: ['processing'] };
    const { data: order, error } = await db.from('permit_orders').select('*').eq('order_number', body.orderNumber).single();
    if (error || !order) throw badRequest('Order not found.');
    if (!transitions[order.order_status]?.includes(body.status)) throw badRequest('This status change is not allowed.');
    if (['processing', 'issued'].includes(body.status) && order.payment_status !== 'paid') throw badRequest('Payment must be verified first.');
    const result = await db.from('permit_orders').update({ order_status: body.status, last_updated_by: user.id, updated_at: new Date().toISOString() }).eq('order_number', body.orderNumber).eq('order_status', order.order_status).select('order_number');
    if (result.error || result.data?.length !== 1) throw badRequest('Order changed. Refresh and try again.');
    return Response.json({ success: true });
  } catch (error) { return failure(error); }
}
