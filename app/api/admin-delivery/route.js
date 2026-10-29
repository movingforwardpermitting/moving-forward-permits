import { randomUUID } from 'node:crypto';
import { requireAdmin, badRequest, failure } from '../../../lib/server.mjs';
import { html, tryDrainMail } from '../../../lib/mail.mjs';
export async function POST(req) {
  try {
    const { db, user } = await requireAdmin(req);
    const form = await req.formData();
    const orderNumber = form.get('orderNumber');
    const files = form.getAll('permits');
    if (form.get('reviewConfirmed') !== 'true') throw badRequest('Review carrier, vehicle, permit type and validity before sending.');
    if (!files.length || files.length > 20) throw badRequest('Attach the issued permits (up to 20 PDF files).');
    if (files.reduce((sum, file) => sum + (file.size || 0), 0) > 3500000) throw badRequest('Combined files must be smaller than 3.5 MB. Contact support for larger permits.');
    for (const file of files) {
      if (typeof file === 'string' || file.type !== 'application/pdf' || file.size > 5 * 1024 * 1024 || file.size === 0) throw badRequest('Each permit must be a PDF up to 5 MB.');
      if (!(await file.slice(0, 5).text()).startsWith('%PDF-')) throw badRequest('Invalid PDF file.');
    }
    const result = await db.from('permit_orders').select('*').eq('order_number', orderNumber).single();
    const order = result.data;
    if (result.error || !order || order.payment_status !== 'paid' || order.order_status !== 'issued') throw badRequest('Only paid, issued orders can be delivered.');
    const batch = randomUUID();
    const links = [];
    for (let index = 0; index < files.length; index++) {
      const path = `${order.order_number}/${batch}/permit-${index + 1}.pdf`;
      const { error } = await db.storage.from('issued-permits').upload(path, files[index], { contentType: 'application/pdf', upsert: false });
      if (error) throw new Error('Permit upload failed');
      const signed = await db.storage.from('issued-permits').createSignedUrl(path, 7 * 86400);
      if (signed.error) throw new Error('Permit link creation failed');
      links.push({ path, url: signed.data.signedUrl });
    }
    const content = `<p>Your issued permits for ${html(order.order_number)} are ready:</p><ul>${links.map((link, i) => `<li><a href="${html(link.url)}">Download permit ${i + 1}</a></li>`).join('')}</ul><p>Links expire in seven days. Save the PDFs and verify carrier, vehicle and validity details before travel. Follow the permit's carry/printing instructions. Contact us immediately if anything is incorrect.</p>`;
    const queued = await db.rpc('queue_permit_delivery', { p_order: orderNumber, p_files: links.map(link => link.path), p_admin: user.id, p_recipient: order.contact_email, p_subject: `Your permits — ${order.order_number}`, p_html: content });
    if (queued.error) {
      await db.storage.from('issued-permits').remove(links.map(link => link.path));
      throw badRequest('Delivery could not be queued. Refresh the order before retrying.');
    }
    await tryDrainMail(db);
    return Response.json({ success: true, message: 'Delivery queued. Check notification status for provider acceptance.' });
  } catch (error) { return failure(error); }
}
