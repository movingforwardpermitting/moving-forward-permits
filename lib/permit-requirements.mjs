// Phone intake rules based on published state applications and permit instructions.
// These rules help collect information. Always confirm the final issuing portal's current fields.
export const permitIntakeRules = {
  Alabama: {
    required:['Beginning Travel Date'],
    optional:['Trip End Date','Effective Time','Time Zone','Route / Entry and Exit'],
    note:'Alabama self-issued trip/fuel/combination entry screen requests a taxpayer identification number (TIN), USDOT number and email. Do not enter TIN/SSN into this inquiry form. Verify the correct portal and remaining vehicle fields before issuing.',
    url:'https://amcmod.mvtrip.alabama.gov/ALMcsWeb/SelfIssuedPermitController?isNonAMCSystem=Y',
    documentReminder:'Confirm the responsible taxpayer ID is available for secure entry directly into the state portal; do not store it in permit notes.'
  },
  Georgia: {
    required:['Beginning Travel Date','Georgia Safety USDOT','Georgia Unladen Weight'],
    optional:['Trip End Date','Effective Time','Time Zone','Route / Entry and Exit'],
    note:'Georgia published Trip Permit User Guide specifically asks for Safety USDOT, VIN confirmation, vehicle year/make/registration state, unladen weight and insurance details. Leased operators may have separate USDOT/TIN requirements. Confirm any remaining live portal fields before issuance.',
    url:'https://cmv.dor.ga.gov/GAEnterprise/Content/OpenFiles/Help/TripPermit%20Help.htm?Content=Request+Trip+Permit+User',
    documentReminder:'Have carrier insurance details and any leased-operator identification available. Enter TIN only through a secure authorized state channel.'
  },
  Kentucky: {
    required:['Beginning Travel Date','Kentucky Safety USDOT'],
    optional:['Trip End Date','Effective Time','Time Zone','Route / Entry and Exit'],
    note:'Kentucky temporary permit portal begins with the USDOT responsible for safety. KYU weight-distance tax is separate from IRP trip and fuel coverage; check KYU obligations for vehicles at or above 60,000 lb. Later portal fields are not fully mapped.',
    url:'https://apps.transportation.ky.gov/motorcarrierpermits/PermitManagement.aspx',
    documentReminder:'Confirm carrier safety USDOT, active authority, and whether KYU weight-distance credentials are needed.'
  },
  Mississippi: {
    required:['Beginning Travel Date'],
    optional:['Trip End Date','Effective Time','Time Zone','Route / Entry and Exit'],
    note:'Mississippi trip registration permits route through MDOT ExpressPass. Its exact temporary trip entry fields still need verification. Fuel permits are not offered through the configured Mississippi process.',
    url:'https://permits.mdot.ms.gov/',
    documentReminder:'Verify the correct temporary registration product and permit validity with MDOT before quoting.'
  },
  Missouri: {
    required:['Beginning Travel Date','Effective Time','Missouri Model Year','Missouri Vehicle Body Type'],
    optional:['Trip End Date','Time Zone','Route / Entry and Exit'],
    note:'MoDOT Carrier Express instructions show effective date/time, vehicle make, VIN, model year, license/registration state, and delivery email; the guide also references vehicle body type. Check self-issued permit type and current portal fields before purchase.',
    url:'https://www.modot.org/sites/default/files/documents/EXTERNALUSERSIRPPROCESS72HOURPERMIT_0.pdf',
    documentReminder:'Have the vehicle VIN, plate and jurisdiction, make, model year, body type, USDOT, and customer email ready.'
  },
  Tennessee: {
    required:['Beginning Travel Date'],
    optional:['Trip End Date','Effective Time','Time Zone','Route / Entry and Exit'],
    note:'Tennessee currently publishes a state-listed contractor route for trip/fuel permits. Exact fields depend on the contractor/issuing form and are not fully verified; confirm product, supplier access, date/time and fees before quoting.',
    url:'https://revenue.support.tn.gov/hc/en-us/articles/360060950171-MC-IRP-17-How-to-Obtain-a-Tennessee-Trip-and-Fuel-Use-Permit',
    documentReminder:'Confirm an authorized issuer and their current trip/fuel ordering form; do not assume direct state self-issuance.'
  },
  Virginia: {
    required:['Beginning Travel Date','Virginia Plate Expiration Date','Virginia Vehicle Model','Virginia Lease Status'],
    optional:['Trip End Date','Effective Time','Time Zone','Route / Entry and Exit'],
    note:'Virginia official trip permit instructions request applicant contact, vehicle VIN, unit number, year/make/model, plate/jurisdiction/expiration and lessor name if leased. Tax identification is also requested by the issuing agency and must be handled securely.',
    url:'https://www.dmv.virginia.gov/businesses/motor-carriers/trip-permits/apply',
    documentReminder:'Have current plate expiration, vehicle model, unit number and lessor name if leased. Never put FEIN/SSN into general notes.'
  },
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
// Public launch offering is deliberately limited to the state portals this
// operator has established access to. Extend only after verifying fulfillment.
export const launchPermitTypes = {
  Arizona:['Trip Permit'],
  Arkansas:['Trip Permit'],
  Iowa:['Trip Permit'],
  Kansas:['Trip Permit','Fuel Permit'],
  Maine:['Trip Permit']
};
export const launchStates = Object.keys(launchPermitTypes);
export function launchTypesFor(state) { return launchPermitTypes[state] || []; }
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
  if(state==='Georgia') fields.push(
    {key:'Georgia Safety USDOT',label:'USDOT responsible for vehicle safety',inputType:'text',required:true},
    {key:'Georgia Unladen Weight',label:'Truck unladen weight (lb)',inputType:'number',required:true},
    {key:'Georgia Insurance Information Ready',label:'Insurance details available for state portal',inputType:'select',options:['Available for secure entry','Need to request'],required:false}
  );
  if(state==='Kentucky') fields.push(
    {key:'Kentucky Safety USDOT',label:'USDOT responsible for safety (Kentucky portal)',inputType:'text',required:true},
    {key:'Kentucky KYU Status',label:'Kentucky weight-distance (KYU) credential status',inputType:'select',options:['Active','Not active','Not sure','Not applicable'],required:false}
  );
  if(state==='Missouri') fields.push(
    {key:'Missouri Model Year',label:'Vehicle model year',inputType:'number',required:true},
    {key:'Missouri Vehicle Body Type',label:'Vehicle body type',inputType:'text',required:true}
  );
  if(state==='Virginia') fields.push(
    {key:'Virginia Plate Expiration Date',label:'License plate expiration date',inputType:'date',required:true},
    {key:'Virginia Vehicle Model',label:'Vehicle model',inputType:'text',required:true},
    {key:'Virginia Lease Status',label:'Is the vehicle leased?',inputType:'select',options:['Not leased','Leased'],required:true},
    {key:'Virginia Lessor Name',label:'Lessor name (required if leased)',inputType:'text',required:false}
  );
  if(state==='Arizona')fields.push({key:'Arizona Miles',label:'Miles traveling inside Arizona',inputType:'number',required:true});
  if(state==='Kansas'&&permitType==='Fuel Permit')
    fields.push({key:'Kansas Fuel Duration',label:'Kansas temporary fuel permit duration',inputType:'select',options:['24 hours','72 hours'],required:true});
  if(state==='Maine')fields.push(
    {key:'Maine Registration Copy Status',label:'Valid vehicle registration copy',inputType:'select',options:['Will request','Received'],required:false},
    {key:'Maine Lease Agreement Status',label:'Lease agreement (if leased)',inputType:'select',options:['Not applicable','Will request','Received'],required:false}
  );
  return fields;
}
export const additionalPermitFieldKeys=[
  'Arizona Miles','Kansas Fuel Duration','Maine Registration Copy Status','Maine Lease Agreement Status',
  'Georgia Safety USDOT','Georgia Unladen Weight','Georgia Insurance Information Ready',
  'Kentucky Safety USDOT','Kentucky KYU Status',
  'Missouri Model Year','Missouri Vehicle Body Type',
  'Virginia Plate Expiration Date','Virginia Vehicle Model','Virginia Lease Status','Virginia Lessor Name'
];
export function validatePermitDetails(state,permitType,details) {
  const rule=permitIntakeRule(state,permitType);
  if(rule.unsupported)throw new Error('This permit type is not currently offered through the configured '+state+' process. Select another permit type or discuss an alternate method.');
  for(const field of rule.required)if(!String(details[field]||'').trim())throw new Error('Enter '+field+' for '+state+' '+permitType+'.');
  if(state==='Arizona' && (!Number.isFinite(Number(details['Arizona Miles'])) || Number(details['Arizona Miles'])<=0))
    throw new Error('Enter the miles traveling inside Arizona for the '+permitType+'.');
  if(state==='Kansas'&&permitType==='Fuel Permit'&&!['24 hours','72 hours'].includes(details['Kansas Fuel Duration']))
    throw new Error('Select the 24-hour or 72-hour Kansas fuel permit.');
  if(state==='Georgia'){
    if(!/^\\d{1,8}$/.test(String(details['Georgia Safety USDOT']||'')))
      throw new Error('Enter the USDOT responsible for safety for Georgia.');
    if(!/^\\d{1,6}$/.test(String(details['Georgia Unladen Weight']||'')) || Number(details['Georgia Unladen Weight'])<=0)
      throw new Error('Enter a valid unladen truck weight for Georgia.');
  }
  if(state==='Kentucky'&&!/^\\d{1,8}$/.test(String(details['Kentucky Safety USDOT']||'')))
    throw new Error('Enter the USDOT responsible for safety for Kentucky.');
  if(state==='Missouri' && (!/^\\d{4}$/.test(String(details['Missouri Model Year']||'')) ||
     Number(details['Missouri Model Year'])<1980 || Number(details['Missouri Model Year'])>new Date().getFullYear()+2))
    throw new Error('Enter a valid Missouri model year.');
  if(state==='Virginia'){
    if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(String(details['Virginia Plate Expiration Date']||'')) ||
       Number.isNaN(Date.parse(details['Virginia Plate Expiration Date'])))
      throw new Error('Enter a valid Virginia plate expiration date.');
    if(details['Virginia Lease Status']==='Leased'&&!String(details['Virginia Lessor Name']||'').trim())
      throw new Error('Enter the Virginia lessor name for a leased vehicle.');
  }
}
