# Moving Forward launch setup

## Current state

The draft implements request → reviewed quote → secure Stripe checkout → verified payment → manual state purchase → reviewed permit delivery. Payments default to disabled. Publishing the code alone does not configure the database, admin account, mail provider, or payment webhook.

Stripe does not need to be connected to ChatGPT. Christie can perform all Stripe account and secret configuration directly in Stripe and Vercel. Never paste keys into chat or commit them to GitHub.

## Configure a preview first

1. Confirm the Vercel project is `moving-forward-permits` under `moving-forward-s-projects`, with the GitHub repository `movingforwardpermitting/moving-forward-permits`. Approve team access if requested by Vercel.
2. Resume the existing Supabase project and inspect its existing `permit_orders` schema. Back up the database before changes. Prefer a separate preview project for test data; do not silently provision paid resources.
3. Review `supabase/migrations/20261028000549_order_workflow.sql` against the actual existing schema. The migration adds workflow columns, unique order/request/session IDs, restricted mail queue and request limits, and a private permit bucket. It revokes public/ordinary authenticated access to orders. Deploy and migrate in a coordinated maintenance window because the old site used anonymous database access.
4. Apply the migration to the preview database, run advisors, and test that anon and ordinary authenticated users cannot read/write order tables or execute workflow functions. Check all existing Storage policies for unintended access to the `issued-permits` bucket.
5. In Supabase Authentication, create Christie's admin user through the dashboard; she sets her own unique password. Add only that Auth user UUID to Vercel `ADMIN_USER_IDS`. Public signup alone must never confer admin access. The old client-side password is removed from the draft; stop using it and replace it anywhere it was reused.
6. Set the required environment variables from `.env.example` in Vercel Preview. Keep `SUPABASE_SERVICE_ROLE_KEY`, Stripe keys, webhook signing secret, Resend key, `CRON_SECRET` and `RATE_LIMIT_SALT` server-only. Use a different database and Stripe test credentials from Production. Do not print secret values.
7. Set `SITE_URL` to the exact preview HTTPS origin. This controls checkout URLs, email links and request-origin validation.
8. Configure a verified Resend sending domain and `MAIL_FROM`; `onboarding@resend.dev` is not a production sending identity. `ADMIN_ALERT_EMAIL` should be the verified business inbox. Check provider rejection/limits and test actual mail delivery.

## Stripe setup — Christie can do this privately

1. Sign in directly at https://dashboard.stripe.com/ . Confirm the business account and payout bank details are yours. Do not share those details with ChatGPT.
2. Use a Stripe sandbox/test environment for Preview. Set `STRIPE_MODE=test`. Enter the test secret key directly in the Preview `STRIPE_SECRET_KEY` field in Vercel.
3. In Stripe's webhook/event-destination setup, register the exact preview URL followed by `/api/stripe-webhook`. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.expired`.
4. Enter that endpoint's signing secret directly into Preview `STRIPE_WEBHOOK_SECRET` in Vercel. Redeploy after configuration changes. The endpoint is signature protected; Stripe must be able to reach it. Do not disable all preview protection; arrange endpoint-specific access or use a dedicated public test deployment if necessary.
5. Set `PAYMENTS_ENABLED=true` only for the test environment when ready to run the test. Submit a clearly identified test request, review a complete fee quote, and approve a payment-link email to your own test mailbox. Complete checkout with Stripe's documented test payment methods, never a real card.
6. Verify the same order becomes paid from a signed webhook with matching session, currency, amount and quote revision. Verify replayed events do not reset progress or duplicate payment updates. Verify cancelled/expired checkout stays unpaid and can be reviewed again. No Stripe account access by ChatGPT is needed for these steps.
7. Only after the full test succeeds, set distinct live credentials in Production, `STRIPE_MODE=live`, the production webhook signing secret, and `SITE_URL=https://movingforwardpermits.com`. Keep payments disabled until production configuration is verified, then enable and redeploy. A real charge requires separate concrete approval; test success is not a claim that money was collected.

## Operational verification before launch

- Desktop/mobile request submission, validation, repeated-submit deduplication, rate limit and visible order reference.
- Request data saved and recoverable; no payment requested until an authorized admin reviews all fees and requirements.
- Admin APIs reject missing/invalid tokens and unapproved users before accessing orders.
- Every quote line has an explicit state fee, explicit mandatory provider/portal fee (including verified zero), source URL/date, and applicable service fee. Standard is $35 per permit; rush is $50 replacing $35. State-issued combinations require explicit issuance/count treatment. Unknown fees never become zero.
- Actual state eligibility/duration/document requirements still need order-level confirmation. Collect POA and sensitive identifiers securely when required. Do not use invented trucking details in a real state application.
- Payment-link notification, test checkout, verified webhook, exact saved order/payment association, payment acknowledgment and admin alert.
- Mark processing only after payment confirmation. Mark issued only after the actual state permit exists. Review all PDFs against approved carrier, VIN, state, type and validity before clicking delivery.
- Upload issued PDFs (combined <3.5 MB per delivery), queue delivery atomically, and verify provider acceptance. Private signed download links expire after seven days. Provider acceptance does not prove inbox delivery or customer receipt.
- Notification failures stay visible and retryable. Immediate sending is attempted on each workflow action. The daily cron is a fallback; for faster unattended retries configure a supported higher-frequency schedule after checking the Vercel plan. The admin retry button is available without changing plans. Resend idempotency is provider-window bounded; after prolonged failures review before retrying old messages.
- Refunds, disputes, permit corrections, quote changes while an unpaid link is active, and resend after a download expires currently require manual operator/support handling. Do not silently change a price after issuing its payment link. Expired sessions return the request to review.
- Legacy orders missing contact/travel information need fresh intake before a payment request.

## Release and recovery

Run `npm ci`, `npm test`, `npm run build`. Inspect the protected Vercel preview through authorized access. Publish only after schema/configuration and live integration checks pass. Do not deploy an old branch against the newly restricted database.

No migration is claimed applied until confirmed by the database. No account is claimed configured until verified. Preserve a database backup and deployment rollback target; a code rollback does not undo database permission changes. Disable `PAYMENTS_ENABLED` if payment processing needs to stop, then redeploy.

## Account checks performed during preparation

- Supabase project `xfcfwevjxkefuqiuscjt` was inactive, resumed successfully, and is now ACTIVE_HEALTHY. Its existing table schema was inspected; no customer rows were read. The table summary reported zero rows.
- Business admin user matching `movingforwardpermitting@gmail.com` does not yet exist in Supabase Auth. Account setup remains required.
- Applied `restrict_legacy_order_access` to revoke public/ordinary-user reads and updates while retaining the old intake INSERT permission until deployment. Verification confirmed those reads/updates are false and server access remains true. The workflow migration was subsequently applied after Vercel access was approved; see the latest status below.
- Vercel account is connected but the existing project's team grant is pending. Project/env inspection returned 403 and provided a time-limited team authorization link. No decrypted environment values or Stripe secrets were requested.
- Sixteen isolated tests and the production build passed. Full database, email, payment and delivery integration tests are still pending. No live charge, state application, or customer email was created.

## Latest configuration progress

Vercel team access is now confirmed. Read the configured variable names without decrypting values. Set SITE_URL for preview and production, PAYMENTS_ENABLED=false, test/live mode labels for the respective environments, and generated private cron/rate-limit secrets. Existing Stripe credentials were not read or changed.

Applied the additive order_workflow migration to the existing database while preserving old-form INSERT access for the transition. Delivery queue/state and rate-limit assertions passed inside a transaction that was fully rolled back. Verified public reads/updates remain blocked, workflow RPC is not public, and the PDF bucket is private. Security advisors report only informational RLS-with-no-policy findings for the deliberately server-only mail queue and rate-limit tables.

Outstanding private setup: server Supabase key entered directly in Vercel, Christie’s Supabase Auth admin account and allowed UUID, verified Resend sender, and Stripe test webhook configuration performed by Christie. Do not enable payments or merge/publish the workflow until actual end-to-end tests pass. Once the new workflow is deployed, revoke the remaining legacy anon INSERT grant.
