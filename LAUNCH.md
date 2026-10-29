# Moving Forward launch status

Updated October 29, 2026.

## Verified
- Supabase workflow migrations applied; admin login restricted to Christie's verified Auth user.
- Public reads and updates blocked; private PDF storage and service-only workflow functions.
- Resend domain verified; Christie confirmed inbox delivery.
- Sandbox checkout simulated $1, matching signed callback marked fixture 978c55ce-608d-42dd-bdcd-24d63bb4ed47 paid, and both test notifications accepted. Christie confirmed receipt. No real money or permit.
- 23 isolated tests passed; preview production build passed.
- Production STRIPE_WEBHOOK_SECRET exists; value entered privately by Christie and never read by the agent.

## Release
Deploy reviewed workflow tree from bcb986299e0786cce27d0548f98a2e1504c90a6c, retaining public sandbox callback.
Production SITE_URL is https://movingforwardpermits.com and STRIPE_MODE is live.
PAYMENTS_ENABLED remains false until live credentials and signed live callback are verified.
Live destination URL: https://movingforwardpermits.com/api/stripe-webhook
Events: checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.expired.
Use Your account / Snapshot. Keep sandbox destination and secret separate.
Do not read/decrypt Stripe secrets. Christie verifies live account, payout details and live key privately.
After new intake production deployment is READY, revoke remaining legacy anon INSERT on permit_orders and verify permissions.

## Operator workflow
Request -> reviewed quote -> Stripe payment -> verified paid -> manual state purchase -> reviewed PDF delivery.
State and mandatory provider fees must be explicitly verified from official portals for each order. Unknown fees never become zero.
Standard service fee $35 per permit; rush $50 replaces $35. Combination issuance count requires explicit review.
Do not submit invented trucking details to state portals. Sandbox fixtures are never real permit orders.
No permit purchase or real charge without concrete authorization.

## Remaining launch verification
- Confirm live account/key and signed destination delivery before enabling payment requests.
- Exercise new intake and operator quote with identified test data; verify expiry/cancellation.
- Exercise PDF delivery with clearly marked test document, never claiming an issued permit.
- Check mobile/desktop intake and production admin sign-in.
- Refunds, disputes, active quote changes and expired download links require manual support.
- Immediate mail retries run during workflow actions; admin retry available; daily cron is fallback.

## Recovery
Previous production commit: 488b89d47bfbb3e0ff06b140cfbb3520b1e97764.
Code rollback does not reverse database permission changes; do not restore legacy anonymous DB access.
Disable PAYMENTS_ENABLED and redeploy to stop new payment requests.
Secrets stay in Vercel; source and lockfile remain in GitHub.
