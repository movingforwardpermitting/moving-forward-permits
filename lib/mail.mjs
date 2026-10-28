import { Resend } from 'resend';
import { required, siteUrl } from './server.mjs';
export const html = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function queueMail(db, key, to, subject, content) {
  const { error } = await db.from('permit_mail_queue').upsert({ message_key: key, recipient: to, subject, html: content }, { onConflict: 'message_key', ignoreDuplicates: true });
  if (error) throw new Error('Notification queue unavailable');
}
export async function intakeMail(db, order) {
  await queueMail(db, `intake-admin-${order.order_number}`, required('ADMIN_ALERT_EMAIL'), `New request ${order.order_number}`, `<p>A new permit request is ready for review.</p><p><a href="${html(siteUrl())}/admin">Open admin dashboard</a></p><p>Payment has not been requested.</p>`);
  await queueMail(db, `intake-customer-${order.order_number}`, order.contact_email, `Request received — ${order.order_number}`, `<p>We received your permit request, reference ${html(order.order_number)}.</p><p>We will review your vehicle, travel details and total fees before sending a secure payment link. No payment has been collected. A request or payment receipt is not a permit or authority to travel.</p><p>Questions? Reply to this email.</p>`);
}
export async function paidMail(db, order) {
  await queueMail(db, `paid-admin-${order.order_number}`, required('ADMIN_ALERT_EMAIL'), `Paid order ${order.order_number}`, `<p>Payment is confirmed. Review and obtain the state permits for ${html(order.order_number)}.</p><p><a href="${html(siteUrl())}/admin">Open admin dashboard</a></p>`);
  await queueMail(db, `paid-customer-${order.order_number}`, order.contact_email, `Payment confirmed — ${order.order_number}`, `<p>Your payment for ${html(order.order_number)} is confirmed. We will process your reviewed request and send your permits separately.</p><p>This acknowledgment is not a permit. Do not travel until you have the required permits and have checked their vehicle details and validity.</p>`);
}
export async function drainMail(db) {
  const resend = new Resend(required('RESEND_API_KEY'));
  const { data: messages, error } = await db.rpc('claim_permit_mail', { batch_size: 15 });
  if (error) throw new Error('Notification queue unavailable');
  let sent = 0, failed = 0;
  for (const message of messages || []) {
    try {
      const result = await resend.emails.send({ from: required('MAIL_FROM'), to: message.recipient, replyTo: required('ADMIN_ALERT_EMAIL'), subject: message.subject, html: message.html }, { idempotencyKey: message.message_key });
      if (result.error || !result.data?.id) throw new Error('Email provider rejected message');
      if (message.message_key.startsWith('delivery-')) {
        const { error: deliveryError } = await db.from('permit_orders').update({ order_status: 'delivery_sent', delivery_sent_at: new Date().toISOString() }).eq('order_number', message.message_key.slice(9)).eq('order_status', 'delivery_queued');
        if (deliveryError) throw new Error('Delivery evidence update failed');
      }
      const { error: saveError } = await db.from('permit_mail_queue').update({ sent_at: new Date().toISOString(), provider_id: result.data.id, last_error: null }).eq('id', message.id).eq('locked_until', message.locked_until);
      if (saveError) throw new Error('Email delivery evidence not saved');
      sent++;
    } catch {
      failed++;
      await db.from('permit_mail_queue').update({ locked_until: new Date(Date.now() + 300000).toISOString(), last_error: 'Delivery failed; retry required' }).eq('id', message.id).eq('locked_until', message.locked_until);
    }
  }
  return { sent, failed };
}

export async function tryDrainMail(db) { try { return await drainMail(db); } catch { return { sent: 0, failed: 1 }; } }
