// Government base fees only. All requests require a reviewed quote before payment.
export const stateFees = {
  Alabama: { 'Trip Permit': 20, 'Fuel Permit': 20 },
  Florida: { 'Trip Permit': 30, 'Fuel Permit': 45 },
  Georgia: { 'Trip Permit': 30, 'Fuel Permit': 16 },
  Mississippi: { 'Trip Permit': 25 },
  Missouri: { 'Trip Permit': 10, 'Fuel Permit': 10 },
  Texas: { 'Trip Permit': 25, 'Fuel Permit': 50 },
  Virginia: { 'Trip Permit': 15, 'Fuel Permit': 20 },
};
export const supportedStates = ['Alabama','Florida','Georgia','Kentucky','Mississippi','Missouri','Tennessee','Texas','Virginia'];
export const sharedFields = [
  ['companyName','Carrier Legal / Company Name'], ['usdot','USDOT Number (if assigned)'],
  ['mcNumber','MC Number (if applicable)'], ['businessAddress','Carrier Physical Business Address'],
  ['ownerNameAddress','Vehicle Owner / Lessee Name and Address'],
  ['vin','VIN'], ['plateNumber','Truck Plate Number'], ['plateState','Plate State'],
  ['unitNumber','Unit Number'], ['registeredWeight','Registered Gross Weight (lb)'],
  ['axles','Number of Axles'], ['registrationJurisdiction','Registration Jurisdiction'],
  ['vehicleYearMake','Truck Year / Make'], ['irpStatus','IRP Status (yes / no / unsure)'],
  ['iftaStatus','IFTA Status (yes / no / unsure)'], ['contactName','Contact Name'],
  ['phoneNumber','Phone Number'], ['email','Email for Permit Delivery'],
];
export const permitFields = ['Beginning Travel Date','Effective Time','Time Zone','Trip End Date','Route / Entry and Exit','Additional Notes'];
const optional = new Set(['mcNumber','unitNumber','usdot']);
const clean = (value) => typeof value === 'string' ? value.trim().slice(0,2000) : '';
function validDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value; }
export function prepareOrder(body) {
  if (!body || typeof body !== 'object') throw new Error('Please complete the request form.');
  const customer = Object.fromEntries(sharedFields.map(([key])=>[key,clean(body[key])]));
  for (const [key,label] of sharedFields) if (!optional.has(key) && !customer[key]) throw new Error(`Please enter ${label}.`);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new Error('Please enter a valid delivery email.');
  customer.email = customer.email.toLowerCase();
  if (customer.usdot && !/^\d{1,8}$/.test(customer.usdot)) throw new Error('Please enter a numeric USDOT number.');
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(customer.vin)) throw new Error('Please enter a valid 17-character VIN.');
  customer.vin = customer.vin.toUpperCase();
  if (!/^\d{1,6}$/.test(customer.registeredWeight) || Number(customer.registeredWeight) <= 0) throw new Error('Enter registered gross weight in pounds.');
  if (!/^\d{1,2}$/.test(customer.axles) || Number(customer.axles) < 2) throw new Error('Enter the number of axles.');
  if (customer.phoneNumber.replace(/\D/g,'').length < 10) throw new Error('Enter a valid contact phone number.');
  for (const key of ['irpStatus','iftaStatus']) if (!['yes','no','unsure'].includes(customer[key].toLowerCase())) throw new Error('Enter yes, no, or unsure for IRP and IFTA status.');
  if (!Array.isArray(body.orderItems) || !body.orderItems.length || body.orderItems.length > 20) throw new Error('Add between 1 and 20 permit requests.');
  const orderItems = body.orderItems.map((item)=>{
    if (!item || !supportedStates.includes(item.state) || !['Trip Permit','Fuel Permit','Trip + Fuel Permit'].includes(item.permitType)) throw new Error('Select a supported state and permit type.');
    const details = Object.fromEntries(permitFields.map((field)=>[field,clean(item.details?.[field])]));
    for (const field of permitFields.filter((f)=>f!=='Additional Notes')) if (!details[field]) throw new Error(`Enter ${field} for ${item.state} ${item.permitType}.`);
    if (!validDate(details['Beginning Travel Date']) || !validDate(details['Trip End Date']) || details['Trip End Date'] < details['Beginning Travel Date']) throw new Error('Enter valid start and end travel dates.');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(details['Effective Time'])) throw new Error('Enter a valid effective time.');
    try { new Intl.DateTimeFormat('en-US',{timeZone:details['Time Zone']}).format(); } catch { throw new Error('Enter a time zone such as America/Chicago.'); }
    return { state:item.state, permitType:item.permitType, details };
  });
  return { customer,orderItems,rush:body.rush===true };
}
