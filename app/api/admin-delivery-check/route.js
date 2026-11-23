import { randomUUID } from 'node:crypto';
import { requireAdmin, failure, required } from '../../../lib/server.mjs';

// Admin-only, non-customer test. No order status changes, Stripe actions, or emails.
function testPdf() {
  const stream = 'BT /F1 16 Tf 30 80 Td (TEST ONLY - NOT A VALID PERMIT) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 340 160] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i+1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const startXref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10,'0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf8');
}

export async function POST(req) {
  try {
    const { db } = await requireAdmin(req);
    const bucket = 'issued-permits';
    const info = await db.storage.getBucket(bucket);
    if (info.error || info.data?.public !== false) {
      return Response.json({ error: 'Private permit storage is not ready.' }, { status: 502 });
    }

    const path = `__admin-delivery-check__/${randomUUID()}.pdf`;
    const pdf = testPdf();
    let uploaded = false;
    let stage = 'upload';
    let issue = '';
    try {
      const saved = await db.storage.from(bucket).upload(path, pdf, {
        contentType: 'application/pdf', upsert: false, cacheControl: '0'
      });
      if (saved.error) throw new Error('Upload failed');
      uploaded = true;

      stage = 'signed_download_link';
      const signed = await db.storage.from(bucket).createSignedUrl(path, 60);
      if (signed.error || !signed.data?.signedUrl) throw new Error('Signed link failed');

      stage = 'download';
      const url = new URL(signed.data.signedUrl);
      if (url.protocol !== 'https:' || url.origin !== new URL(required('NEXT_PUBLIC_SUPABASE_URL')).origin)
        throw new Error('Unexpected download host');
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error('Download failed');
      const downloaded = Buffer.from(await response.arrayBuffer());
      if (!downloaded.equals(pdf)) throw new Error('Downloaded PDF differs');
    } catch {
      issue = stage;
    } finally {
      if (uploaded) {
        const removed = await db.storage.from(bucket).remove([path]);
        if (removed.error) issue = 'cleanup';
      }
    }
    if (issue) {
      console.error('Permit delivery readiness test failed at', issue);
      return Response.json({
        error: `Delivery readiness check failed at ${issue}. No customer email or state order was generated.`
      }, { status: 502 });
    }
    return Response.json({
      success: true,
      message: 'Private PDF upload, temporary signed download link, download verification and cleanup passed. No customer emails, permit orders or payments were generated. Actual issued-permit delivery still requires a legitimate paid order.'
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return failure(error);
  }
}
