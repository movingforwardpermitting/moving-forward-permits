// Calendar-date suggestion only. An issued state permit controls its actual validity.
// 24h/72h/96h/120h periods use the same clock time on the indicated following date
// for ordinary dates. DST transitions can change that; verify the final state timestamp.
import { feeReference } from './permit-fee-catalog.mjs';

function validIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(value + 'T00:00:00.000Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10)===value;
}
export function knownDurationHours(state,permitType,details={}) {
  if (state === 'Kansas' && permitType === 'Fuel Permit') {
    return details['Kansas Fuel Duration'] === '24 hours' ? 24 :
      details['Kansas Fuel Duration'] === '72 hours' ? 72 : null;
  }
  const source=feeReference(state,permitType);
  const value=source?.duration?.trim() || '';
  // Only unambiguous, continuous hourly durations. Do not assume that '10 days'
  // means 10 full 24-hour blocks or that the last date isn't inclusive.
  const match=value.match(/^(24|48|72|96|120) hours$/);
  if (match) return Number(match[1]);
  if (state==='Iowa' && permitType==='Fuel Permit' && value==='1 trip / 72 hours') return 72;
  return null;
}
export function suggestedExpirationDate(state,permitType,details={}) {
  const effectiveDate=details['Beginning Travel Date'];
  const hours=knownDurationHours(state,permitType,details);
  if(!validIsoDate(effectiveDate) || !hours) return null;
  const date=new Date(effectiveDate+'T00:00:00.000Z');
  date.setUTCDate(date.getUTCDate()+hours/24);
  return {date:date.toISOString().slice(0,10),hours,
    notice:'Suggested expiration date only. The issuing portal/permit decides the exact start and expiration times, and travel may end earlier.'};
}
export function applySuggestedExpiration(state,permitType,previousDetails,updatedDetails) {
  const previous=suggestedExpirationDate(state,permitType,previousDetails)?.date;
  const next=suggestedExpirationDate(state,permitType,updatedDetails)?.date;
  if(!previousDetails['Trip End Date'] || previousDetails['Trip End Date']===previous) {
    return {...updatedDetails,'Trip End Date':next||''};
  }
  return updatedDetails; // Never overwrite a driver-confirmed, manually adjusted date.
}
