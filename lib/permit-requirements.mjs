// Phone intake rules based on published state applications and permit instructions.
// These rules help collect information. Always confirm the final issuing portal's current fields.
export const permitIntakeRules = {
  Arizona: {
    required: ['Beginning Travel Date','Route / Entry and Exit','Arizona Miles'],
    optional: ['Trip End Date','Effective Time','Time Zone'],
    note: 'Commercial single-trip application requires effective date, route/origin/destination, and Arizona mileage. Pricing varies by axles and distance. No universal start time is requested on the state PDF.',
    url: 'https://azdot.gov/sites/default/files/media/2022/08/96-0192-SingleTripPermitApp.pdf',
    documentReminder: 'Have current registration/IRP and IFTA credentials available; the portal may ask for credential identifiers.'
  },
  Arkansas: {
    required: ['Beginning Travel Date'],
    optional: ['Trip End Date','Route / Entry and Exit','Effective Time','Time Zone'],
    note: 'IRP trip permit is valid 72 hours. The correct IRP application is accessed through Arkansas DFA/MyDMV, not the oversize/overweight ARPARS portal.',
    url: 'https://ardot.gov/divisions/internal-audit/motor-fuel-audit-section/which-permit/',
    documentReminder: 'When the carrier lacks IFTA, obtain Arkansas qualifying fuel-purchase receipts or follow the weigh-station permit procedure; do not charge for a standard online fuel permit here.'
  },
  Iowa: {
    required: ['Beginning Travel Date'],
    optional: ['Trip End Date','Route / Entry and Exit','Effective Time','Time Zone'],
    note: 'Registration trip is a 72-hour permit; fuel trip is one trip within 72 hours. Collect a start date, and verify any additional information asked by the IAPS issuing portal.',
    url: 'https://iowadot.gov/motor-carriers/how-do-i-get-oversize-overweight-permits/permit-types'
  },
  Kansas: {
    required: ['Beginning Travel Date'],
    optional: ['Trip End Date','Route / Entry and Exit','Effective Time','Time Zone'],
    note: 'Interstate IRP trip and IFTA fuel are separate products. For a Kansas fuel permit select either 24 or 72 hours; prices differ.',
    url: 'https://www.ksrevenue.gov/faqs-motorfuel.html',
    byType: {
      'Fuel Permit': {required:['Beginning Travel Date','Kansas Fuel Duration']}
    }
  },
  Maine: {
    required:['Beginning Travel Date','Trip End Date'],
    optional:['Route / Entry and Exit','Effective Time','Time Zone'],
    note:'Official MV-208 asks for effective and expiration dates; not a start clock time. The valid vehicle registration copy is required, and a lease agreement is required when the carrier is leased to another.',
    url:'https://www.maine.gov/sos/sites/maine.gov.sos/files/inline-files/MV-208-72-Hour-IRP-IFTA-Trip-Permit-Application.pdf',
    documentReminder:'Ask the customer to provide a clear copy of valid vehicle registration. If leased, obtain the lease agreement. Email issuance waives the $3 fax fee.',
    additional:['Maine Registration Copy Status','Maine Lease Agreement Status']
  }
};
const knownUnsupported = {
  Arkansas: new Set(['Fuel Permit','Trip + Fuel Permit']),
  Mississippi: new Set(['Fuel Permit','Trip + Fuel Permit'])
};
export function permitIntakeRule(state,permitType) {
  const base=permitIntakeRules[state] || null;
  const special=base?.byType?.[permitType] || {};
  return {
    required:special.required||base?.required||['Beginning Travel Date'],
    optional:base?.optional||['Trip End Date','Route / Entry and Exit','Effective Time','Time Zone'],
    additional:base?.additional||[],
    note:base?.note||'State-specific portal requirements have not been fully mapped yet. Collect the requested travel date and confirm additional information in the issuing portal.',
    url:base?.url||null,
    documentReminder:base?.documentReminder||null,
    unsupported:knownUnsupported[state]?.has(permitType)===true
  };
}
export function extraPermitFields(state,permitType) {
  const fields=[];
  if(state==='Arizona')fields.push({key:'Arizona Miles',label:'Miles traveling inside Arizona',inputType:'number',required:true});
  if(state==='Kansas'&&permitType==='Fuel Permit')
    fields.push({key:'Kansas Fuel Duration',label:'Kansas temporary fuel permit duration',inputType:'select',options:['24 hours','72 hours'],required:true});
  if(state==='Maine')fields.push(
    {key:'Maine Registration Copy Status',label:'Valid vehicle registration copy',inputType:'select',options:['Will request','Received'],required:false},
    {key:'Maine Lease Agreement Status',label:'Lease agreement (if leased)',inputType:'select',options:['Not applicable','Will request','Received'],required:false}
  );
  return fields;
}
export const additionalPermitFieldKeys=['Arizona Miles','Kansas Fuel Duration','Maine Registration Copy Status','Maine Lease Agreement Status'];
export function validatePermitDetails(state,permitType,details) {
  const rule=permitIntakeRule(state,permitType);
  if(rule.unsupported)throw new Error('This permit type is not currently offered through the configured '+state+' process. Select another permit type or discuss an alternate method.');
  for(const field of rule.required)if(!String(details[field]||'').trim())throw new Error('Enter '+field+' for '+state+' '+permitType+'.');
  if(state==='Arizona' && (!Number.isFinite(Number(details['Arizona Miles'])) || Number(details['Arizona Miles'])<=0))
    throw new Error('Enter the miles traveling inside Arizona for the '+permitType+'.');
  if(state==='Kansas'&&permitType==='Fuel Permit'&&!['24 hours','72 hours'].includes(details['Kansas Fuel Duration']))
    throw new Error('Select the 24-hour or 72-hour Kansas fuel permit.');
}
