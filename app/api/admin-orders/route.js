import { requireAdmin, failure } from '../../../lib/server.mjs';
export async function GET(req) {
  try {
    const { db } = await requireAdmin(req);
    const { data, error } = await db.from('permit_orders').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw new Error('Order read failed');
    const itemDelivery = await db.from('permit_item_deliveries')
      .select('order_number,item_index,state,permit_type,delivery_status,created_at,sent_at')
      .in('order_number',data.map(order=>order.order_number).filter(Boolean));
    if (itemDelivery.error) throw new Error('Individual permit delivery data unavailable');
    const notifications = await db.from('permit_mail_queue').select('id,subject,sent_at,last_error,attempts').is('sent_at', null).order('created_at', { ascending: false }).limit(30);
    if (notifications.error) throw new Error('Notification read failed');
    return Response.json({ orders: data.map(order=>({...order,itemDeliveries:(itemDelivery.data||[]).filter(item=>item.order_number===order.order_number)})), pendingNotifications: notifications.data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}
