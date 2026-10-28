import { timingSafeEqual } from 'node:crypto';
import { requireAdmin, database, required, failure } from '../../../lib/server.mjs';
import { drainMail } from '../../../lib/mail.mjs';
export async function POST(req) {
  try { const { db } = await requireAdmin(req); return Response.json(await drainMail(db)); } catch (error) { return failure(error); }
}
export async function GET(req) {
  try {
    const actual = Buffer.from(req.headers.get('authorization') || '');
    const expected = Buffer.from(`Bearer ${required('CRON_SECRET')}`);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return Response.json(await drainMail(database()));
  } catch (error) { return failure(error); }
}
