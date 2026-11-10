// Research fee references automatically populate known government base fees.
// Research figures remain provisional until the operator verifies actual portal charges.
import { permitFeeReferences, feeReference } from './permit-fee-catalog.mjs';
export { permitFeeReferences, feeReference };
export function initialQuoteLines(items,existingLines=[]) {
  return (items||[]).map((item,i)=>{
    const existing=existingLines?.[i];
    const ref=feeReference(item.state,item.permitType);
    return {
      stateCents:existing?.stateCents ?? (ref?.status==='fixed' ? ref.feeCents : ''),
      otherCents:existing?.otherCents ?? '',
      source:existing?.source || ref?.source || '',
      // Never autofill a verification date: this means the operator checked the current portal.
      verifiedOn:existing?.verifiedOn || '',
      serviceCount:existing?.serviceCount || 1,
      combinationTreatment:existing?.combinationTreatment || ''
    };
  });
}
const validCents=value => Number.isSafeInteger(Number(value)) && Number(value)>=0 && value!=='' && value!==null && value!==undefined;
export function quotePreview(lines,items,processingType) {
  const serviceUnit = processingType==='Rush' ? 5000 : 3500;
  const serviceCents = (lines||[]).reduce((sum,line,index)=>
    sum+serviceUnit*(items?.[index]?.permitType==='Trip + Fuel Permit' ? Number(line.serviceCount||1) : 1),0);
  const knownStateCents=(lines||[]).reduce((sum,line)=>sum+(validCents(line.stateCents)?Number(line.stateCents):0),0);
  const knownProviderCents=(lines||[]).reduce((sum,line)=>sum+(validCents(line.otherCents)?Number(line.otherCents):0),0);
  const pending=[];
  (items||[]).forEach((item,index)=>{
    const line=lines?.[index];
    const name=item.state+' '+item.permitType;
    if(!line || !validCents(line.stateCents)) pending.push(name+': state fee');
    if(!line || !validCents(line.otherCents)) pending.push(name+': provider/portal fee (enter confirmed 0 if none)');
    if(!line || !/^https:\/\//.test(String(line.source||''))) pending.push(name+': official fee source');
    if(!line || !/^\d{4}-\d{2}-\d{2}$/.test(String(line.verifiedOn||''))) pending.push(name+': verification date');
    if(item.permitType==='Trip + Fuel Permit' && !(line?.combinationTreatment||'').trim()) pending.push(name+': combined permit treatment');
  });
  return {
    ready:items?.length>0 && lines?.length===items.length && pending.length===0,
    serviceCents,knownStateCents,knownProviderCents,pending,
    totalCents:items?.length>0 && lines?.length===items.length && pending.length===0 ?
      serviceCents+knownStateCents+knownProviderCents:null
  };
}
