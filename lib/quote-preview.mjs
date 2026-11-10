// Reference amounts are government-published base fees, not final customer charges.
// A quote cannot be approved until the operator confirms state and provider fees.
export const permitFeeReferences = {
  Arkansas: {
    'Trip Permit': {
      feeCents: 3300,
      source: 'https://www.arkleg.state.ar.us/Home/FTPDocument?path=%2FBLR+Publications%2FFiscal+Service+Division%5CA.++Tax+Information+-+Annual+Revenue+Reports+++AND++Tax+Handbook-Summary+of+Taxes%2F2024+Tax+Handbook.pdf',
      note: 'Published Arkansas 72-hour IRP trip fee, $33. Confirm final portal and transaction fees.'
    }
  },
  Kansas: {
    'Trip Permit': {
      feeCents: 2600,
      source: 'https://www.ksrevenue.gov/pdf/ar04complete.pdf',
      note: 'Published Kansas interstate 72-hour trip fee, $26. Confirm current portal price and any vendor fees.'
    }
  },
  Arizona: {
    'Trip Permit': {
      source: 'https://azdot.gov/mvd/services/enforcement/commercial-vehicle-permits/general-permit-information/single-trip-permits',
      note: 'Variable. Arizona registration fees depend on distance and axle count. Other motor-carrier charges may apply; verify the specific vehicle and route.'
    }
  }
};
export function initialQuoteLines(items,existingLines=[],today='') {
  return (items||[]).map((item,i)=>{
    const existing=existingLines?.[i];
    const ref=permitFeeReferences[item.state]?.[item.permitType];
    return {
      stateCents: existing?.stateCents ?? ref?.feeCents ?? '',
      otherCents: existing?.otherCents ?? '',
      source: existing?.source || ref?.source || '',
      verifiedOn: existing?.verifiedOn || today,
      serviceCount: existing?.serviceCount || 1,
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
