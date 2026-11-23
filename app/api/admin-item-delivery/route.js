import { randomUUID } from 'node:crypto';
import { requireAdmin, badRequest, failure } from '../../../lib/server.mjs';
import { html, tryDrainMail } from '../../../lib/mail.mjs';

const LIMIT = 3500000;
export async function POST(req) {
  try {
    const { db, user } = await requireAdmin(req);
    const form = await req.formData();
    const orderNumber = String(form.get('orderNumber') || '');
    const indexText = String(form.get('itemIndex') || '');
    const index = Number(indexText);
    const files = form.getAll('permits');
    if (!/^[a-f0-9-]{36}$/i.test(orderNumber)) throw badRequest('Invalid order reference.');
    if (!/^\d{1,2}$/.test(indexText) || !Number.isSafeInteger(index)) throw badRequest('Select one permit item to deliver.');
    if (form.get('reviewConfirmed') !== 'true') throw badRequest('Review every uploaded permit against the carrier, VIN, state, type, and validity dates.');
    if (!files.length || files.length > 20) throw badRequest('Select 1–20 issued PDF files for this permit item.');
    if (files.reduce((sum, f) => sum + (f.size || 0), 0) > LIMIT) throw badRequest('Combined PDF files must be smaller than 3.5 MB.');
    for (const file of files) {
      if (typeof file === 'string' || file.type !== 'application/pdf' || file.size === 0 || file.size > LIMIT ||
          !(await file.slice(0,5).text()).startsWith('%PDF-'))
        throw badRequest('Only valid PDF files are allowed.');
    }
    const found = await db.from('permit_orders').select('*').eq('order_number',orderNumber).single();
    const order = found.data;
    if (found.error || !order || order.payment_status !== 'paid' ||
        order.quote?.stripeMode !== 'live' ||
        !['processing','issued','partially_delivered','delivery_queued'].includes(order.order_status))
      throw badRequest('Only paid live orders in processing can release permits.');
    if (!Array.isArray(order.order_items) || index >= order.order_items.length)
      throw badRequest('This permit item is not part of the order.');
    if (!order.contact_email) throw badRequest('A verified customer email is required.');
    const item = order.order_items[index];
    const existing = await db.from('permit_item_deliveries').select('item_index').eq('order_number',orderNumber).eq('item_index',index).maybeSingle();
    if (existing.error) throw new Error('Permit delivery records are unavailable.');
    if (existing.data) throw badRequest('This permit has already been submitted for delivery. Refresh the order to see its status.');
    const paths = [], links = [];
    const batch = randomUUID();
    try {
      for (let i=0;i<files.length;i++) {
        const path = `${orderNumber}/item-${index}/${batch}/permit-${i+1}.pdf`;
        const uploaded = await db.storage.from('issued-permits').upload(path,files[i],{contentType:'application/pdf',upsert:false});
        if (uploaded.error) throw new Error('Private permit upload failed.');
        paths.push(path);
        const signed = await db.storage.from('issued-permits').createSignedUrl(path,7*86400);
        if (signed.error || !signed.data?.signedUrl) throw new Error('Secure download link creation failed.');
        links.push(signed.data.signedUrl);
      }
      const otherCount = order.order_items.length - (index+1);
      const subject = `Your ${item.state} ${item.permitType} is ready — ${orderNumber}`;
      const message = `<p>Your issued ${html(item.state)} ${html(item.permitType)} for order ${html(orderNumber)} is ready.</p><ul>${links.map((url,i)=>`<li><a href="${html(url)}">Download issued permit ${i+1}</a></li>`).join('')}</ul><p>Other requested permits may still be processing. You will receive a separate email as each becomes available.</p><p>These secure download links expire in seven days. Save the PDFs and check the carrier, vehicle, effective dates and printing/carry requirements. Do not travel without every permit required for your route.</p>`;
      const queued = await db.rpc('queue_permit_item_delivery',{
        p_order:orderNumber,p_index:index,p_state:item.state,p_type:item.permitType,
        p_files:paths,p_admin:user.id,p_recipient:order.contact_email,p_subject:subject,p_html:message
      });
      if (queued.error || queued.data !== true) throw badRequest('Delivery could not be queued. Refresh the order and check the item status before retrying.');
    } catch (error) {
      if (paths.length) {
        const cleanup = await db.storage.from('issued-permits').remove(paths);
        if (cleanup.error) console.error('Partial permit delivery cleanup failed');
      }
      throw error;
    }
    const mail = await tryDrainMail(db);
    return Response.json({
      success:true,notificationAccepted:mail.sent>0,
      message:'Permit saved and customer email queued. Check the item delivery status for email-provider acceptance; the remaining states stay open.'
    },{headers:{'Cache-Control':'no-store'}});
  } catch (error) { return failure(error); }
}
