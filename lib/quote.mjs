export function reviewedQuote(order, input) {
  if (order.payment_status === 'paid') throw new Error('This order is already paid.');
  if (input.reviewConfirmed !== true) throw new Error('Confirm requirements, eligibility, dates and fees before requesting payment.');
  if (!Array.isArray(input.lines) || input.lines.length !== order.order_items.length) throw new Error('Quote must include every permit request.');
  const unitService = order.processing_type === 'Rush' ? 5000 : 3500;
  let serviceCount = 0;
  const lines = input.lines.map((line, index) => {
    const requested = order.order_items[index];
    const combination = requested.permitType === 'Trip + Fuel Permit';
    const count = combination ? Number(line.serviceCount) : 1;
    if (![1, 2].includes(count) || (combination && !line.combinationTreatment?.trim())) throw new Error('Confirm combination issuance and service-fee treatment.');
    if (line.stateCents === '' || line.stateCents == null || line.otherCents === '' || line.otherCents == null) throw new Error('Enter state and provider fees explicitly; use 0 only when verified.');
    const stateCents = Number(line.stateCents), otherCents = Number(line.otherCents);
    if (![stateCents, otherCents].every((n) => Number.isSafeInteger(n) && n >= 0 && n <= 10000000)) throw new Error('Enter verified state/provider amounts in cents, including an explicit zero if none.');
    const source = String(line.source || '').trim();
    if (!/^https:\/\//.test(source) || !/^\d{4}-\d{2}-\d{2}$/.test(line.verifiedOn || '')) throw new Error('Each line needs a verified source URL and date.');
    serviceCount += count;
    return { state: requested.state, permitType: requested.permitType, stateCents, otherCents, serviceCents: unitService * count, serviceCount: count, source, verifiedOn: line.verifiedOn, combinationTreatment: combination ? line.combinationTreatment.trim().slice(0, 500) : null };
  });
  const totalCents = lines.reduce((sum, line) => sum + line.stateCents + line.otherCents + line.serviceCents, 0);
  if (totalCents <= 0 || totalCents > 10000000) throw new Error('Quote total is outside supported limits.');
  return { lines, totalCents, serviceCount, currency: 'usd' };
}
export function verifyPayment(order, session) {
  return session.payment_status === 'paid' && session.currency === 'usd' && session.amount_total === order.quote?.totalCents && session.metadata?.order_id === order.order_number && session.id === order.stripe_session_id;
}
