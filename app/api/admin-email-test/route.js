import { randomUUID } from 'node:crypto';
import { Resend } from 'resend';
import { requireAdmin, required, failure } from '../../../lib/server.mjs';
export async function POST(req) {
  try {
    const { db, user } = await requireAdmin(req);
    if (!user.email || !user.email_confirmed_at) return Response.json({ error: 'Confirm your admin email before testing delivery.' }, { status: 400 });
    const rate = await db.rpc('allow_permit_request', { request_hash: `admin-email-test-${user.id}` });
    if (rate.error) throw new Error('Test rate limit unavailable');
    if (!rate.data) return Response.json({ error: 'Test email limit reached. Try again later.' }, { status: 429 });
    const result = await new Resend(required('RESEND_API_KEY')).emails.send({
      from: required('MAIL_FROM'), to: user.email, replyTo: required('ADMIN_ALERT_EMAIL'),
      subject: 'Moving Forward — email setup test',
      text: 'Your Moving Forward Permitting Services website can send email through Resend. This is a test only. No permit order or payment was created. Reply to this message to contact the business inbox.',
    }, { idempotencyKey: `admin-email-test-${randomUUID()}` });
    if (result.error || !result.data?.id) return Response.json({ error: 'Resend did not accept the test email. Check the verified domain, sending key permissions and sender settings.' }, { status: 502 });
    return Response.json({ message: `Resend accepted a test email to ${user.email}. Check your inbox and spam folder to confirm receipt.` });
  } catch (error) { return failure(error); }
}
