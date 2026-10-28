> Historical verification findings. The subsequent launch implementation addresses several code issues below. See [LAUNCH.md](LAUNCH.md) for the current implementation, account checks, applied permission fix and remaining launch gates. The full workflow is not live yet.

# Permit website verification — October 27, 2026

Status: NOT ready for production approval. Draft PR #1 remains unmerged.

## Results

- Local Next.js production build passed.
- Eight isolated checkout tests passed using simulated Supabase, Stripe and Resend; no network calls or live orders, payments or emails.
- Vercel reports the draft deployment Ready. Fetching the preview leads to Vercel login; full UI/integration verification is blocked by access protection.
- Production homepage responds HTTP 200 and does not include the draft delivery-email field. Draft is not on the live domain.
- No Stripe webhook/payment confirmation route is present in this repository. Orders are inserted as pending before checkout. Cannot confirm payment or payout account ownership from GitHub.
- Admin API routes lack server-side authentication. Admin password is embedded in client code. Do not rely on the page login for data protection. Rotate the exposed password and replace client gating with server authentication; verify database policies separately. No customer orders were inspected. A production endpoint check was rejected by automatic approval review because it could retrieve private customer data; it was not retried.
- Live Supabase insert/read-back, Resend delivery, Stripe test-mode completion, signed webhook processing, and payout ownership were not verified.
- Resend send() error responses are not checked, so an email failure can be silent; no alert delivery guarantee.
- Intake is improved but not state-complete: for example, Florida requires carrier/owner addresses, Missouri's form includes an agent power of attorney. Sensitive identifiers should be handled through a suitable secure workflow.

## Official fee review

Amounts below are government base charges, NOT confirmed all-in checkout prices. Never substitute zero for an unresolved portal/provider charge. Standard service is $35 per separately issued permit; rush replaces it with $50. State-issued combination products need Christie's service-fee decision.

| State | Trip base | Fuel base | Findings / source |
| --- | --- | --- | --- |
| Alabama | $20 / up to 7 days | $20 / up to 7 days | $40 state combination. Official rule: https://admincode.legislature.state.al.us/api/rule/810-5-1-.470 ; portal linked by revenue agency: https://www.revenue.alabama.gov/faqs/where-can-i-get-a-trip-fuel-combination-permit/ . Portal final charges not verified. |
| Florida | $30 / 10 days | $45 / 10 days | https://www.flsenate.gov/Laws/Statutes/2026/320.0715 and https://flsenate.gov/Laws/Statutes/2026/Chapter207/All . State-linked ordering portal https://vendorservices.flhsmv.gov/IcfsPermits . Final portal transaction not verified (fetch blocked). |
| Georgia | $30 / 72 hours | $16 / 10 days | https://dor.georgia.gov/georgia-trucking-portal-faqs ; https://dor.georgia.gov/motor-fuel-rules-georgia-interstate-motor-carriers . Fuel page mentions permitting-service processing fees. State ordering application linked from https://dor.georgia.gov/trucking-portal-permits . Draft currently blocks Georgia payment because catalog entry is absent. |
| Kentucky | Pending | Pending | Could verify official purchase link from https://drive.ky.gov/motor-carriers/pages/default.aspx to https://apps.transportation.ky.gov/MotorCarrierPermits/PermitManagement.aspx , but portal timed out. Existing $40/$40 catalog entries are NOT verified. Kentucky may also require KYU weight-distance review, which is a distinct credential. |
| Mississippi | $25 / 72 hours | Pending | Trip confirmed in official IRP manual, printed page 17: https://www.dor.ms.gov/sites/default/files/business/IRP%20Manual.pdf . Fuel eligibility/fee unresolved. Both remain blocked in draft catalog. |
| Missouri | $10 / 72 hours | $10 / 72 hours | $20 state combination. Official application https://www.modot.org/sites/default/files/documents/72HourTripFuelPermit-%20OTR.pdf . Agency guide https://www.modot.org/UsingMCE . Form requires power of attorney for a permit service. Final portal charges not verified. |
| Tennessee | $30 indicated | $30 indicated | Official indexed pages https://www.tn.gov/revenue/motor-carrier/international-registration-plan.html and https://www.tn.gov/safety/tnhp/cvemain/temporary-fuel-use-permits.html say plus wire-service fees. Full pages returned 403; therefore provisional, not a completed fee verification. Contractor charges unresolved. Current draft omits these extra costs. |
| Texas | $25 / 72 hours | $50 / one entry, up to 20 days | Trip ALSO has mandatory $4.75 processing/handling and possible payment surcharge: https://www.txdmv.gov/motorists/register-your-vehicle/temporary-registration . Fuel: https://comptroller.texas.gov/taxes/fuels/trip-permits.php . Return entry needs a second fuel permit; no more than five entries per calendar year under this option. Both remain blocked in draft catalog. |
| Virginia | $15 | $20 | $35 state combination. Official fee page https://www.dmv.virginia.gov/businesses/motor-carriers/trip-permits/fee-con-forms . Any intermediary service charge must be confirmed for the chosen channel. |

## Required before merge / publishing

1. Protect both admin API routes on the server and verify Supabase access policies; rotate the exposed admin password.
2. Match saved order IDs to Stripe checkout sessions; add signature-verified, idempotent payment confirmation before marking paid. Confirm the intended Stripe account in an authorized session.
3. Complete state portal/provider fee checks. Remove or block unverified Kentucky prices and Tennessee totals until contractor fees are known. Add Georgia and other supported prices only with a complete charge model; retain quote guards where unresolved.
4. Confirm treatment of single state-issued combination permits and finish required state-specific intake.
5. In an authorized test environment, verify order save/read-back, Stripe test checkout/webhook and actual email delivery, then inspect the Vercel preview on mobile and desktop.
