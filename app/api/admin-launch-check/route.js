import { requireAdmin, required, siteUrl, stripeClient, failure } from '../../../lib/server.mjs';
// Read-only diagnostics; never disclose credentials, emails, or payment account IDs.
export async function GET(req) {
  try {
    const {db}=await requireAdmin(req);
    const mode=required('STRIPE_MODE');
    const checks=[];
    const check=(name,pass,detail)=>checks.push({name,pass,detail});
    const configured=[
      'SUPABASE_SERVICE_ROLE_KEY','NEXT_PUBLIC_SUPABASE_URL','ADMIN_USER_IDS',
      'STRIPE_WEBHOOK_SECRET','RESEND_API_KEY','MAIL_FROM','ADMIN_ALERT_EMAIL'
    ];
    for(const name of configured)check(name,Boolean(process.env[name]?.trim()),
      process.env[name]?.trim()?'Configured':'Missing');
    const root=siteUrl();
    check('Site URL',root.startsWith('https://'),new URL(root).hostname);
    check('Stripe mode',mode==='test'||mode==='live',mode);
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim() || '';
    check('Stripe secret key matches mode', Boolean(stripeKey) && stripeKey.includes('_'+mode+'_'),
      stripeKey ? (stripeKey.includes('_'+mode+'_') ? 'Matches configured '+mode+' mode' : 'Mismatch: configure a '+mode+' secret key') : 'Missing Stripe secret key');
    check('Payment link feature',process.env.PAYMENTS_ENABLED==='true',
      process.env.PAYMENTS_ENABLED==='true'?'Enabled':'Disabled');
    try {
      const account=await stripeClient().accounts.retrieve();
      check('Stripe API read-only connection',Boolean(account?.id),'Account connection confirmed ('+mode+' mode)');
      check('Stripe card payment capability',account?.capabilities?.card_payments==='active',
        account?.capabilities?.card_payments||'Not reported');
    } catch (error) {
      const reason = error?.message === 'Stripe mode and key do not match'
        ? 'Secret key does not match live/test mode'
        : error?.type === 'StripeAuthenticationError'
          ? 'Stripe rejected the API credentials'
          : 'Could not verify account; check credentials and account activation';
      check('Stripe API read-only connection',false,reason);
    }
    const {data,error}=await db.storage.getBucket('issued-permits');
    check('Private permit storage',!error&&data?.public===false,
      !error&&data?.public===false?'Private bucket available':'Storage missing or exposed');
    const mail=await db.from('permit_mail_queue').select('id',{head:true,count:'exact'});
    check('Email queue database',!mail.error,mail.error?'Unable to query queue':'Available');
    return Response.json({checks,ready:checks.every(c=>c.pass),
      caution:'This is a configuration diagnostic, not proof of successful live payment, webhook delivery, or email acceptance.'},
      {headers:{'Cache-Control':'no-store'}});
  }catch(error){return failure(error);}
}
