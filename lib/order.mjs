// Existing catalog amounts; verify state/provider fees before production approval.
export const stateFees = {
  Alabama: { "Trip Permit": 20, "Fuel Permit": 20 },
  Florida: { "Trip Permit": 30, "Fuel Permit": 45 },
  Kentucky: { "Trip Permit": 40, "Fuel Permit": 40 },
  Missouri: { "Trip Permit": 10, "Fuel Permit": 10 },
  Tennessee: { "Trip Permit": 30, "Fuel Permit": 30 },
  Virginia: { "Trip Permit": 15, "Fuel Permit": 20 },
};

export const sharedFields = [
  ["companyName", "Carrier Legal / Company Name"], ["usdot", "USDOT Number"],
  ["mcNumber", "MC Number (if applicable)"], ["vin", "VIN"],
  ["plateNumber", "Truck Plate Number"], ["plateState", "Plate State"],
  ["unitNumber", "Unit Number"], ["registeredWeight", "Registered Gross Weight (lb)"],
  ["registrationJurisdiction", "Registration Jurisdiction"],
  ["vehicleYearMake", "Truck Year / Make"], ["irpStatus", "IRP Status (yes / no / unsure)"],
  ["iftaStatus", "IFTA Status (yes / no / unsure)"],
  ["contactName", "Contact Name"], ["phoneNumber", "Phone Number"],
  ["email", "Email for Permit Delivery"],
];
export const permitFields = ["Beginning Travel Date", "Effective Time", "Time Zone", "Route / Entry and Exit", "Additional Notes"];
const optional = new Set(["mcNumber", "unitNumber"]);
const clean = (value) => typeof value === "string" ? value.trim().slice(0, 2000) : "";

export function prepareOrder(body) {
  const customer = Object.fromEntries(sharedFields.map(([key]) => [key, clean(body[key])]));
  for (const [key, label] of sharedFields) {
    if (!optional.has(key) && !customer[key]) throw new Error(`Please enter ${label}.`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new Error("Please enter a valid delivery email.");
  if (!/^\d{1,8}$/.test(customer.usdot)) throw new Error("Please enter a numeric USDOT number.");
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(customer.vin)) throw new Error("Please enter a valid 17-character VIN.");
  if (!Array.isArray(body.orderItems) || !body.orderItems.length || body.orderItems.length > 50) throw new Error("Add between 1 and 50 permits.");
  const serviceFee = body.rush === true ? 50 : 35;
  const orderItems = body.orderItems.map((item) => {
    const stateFee = stateFees[item.state]?.[item.permitType];
    if (!Number.isFinite(stateFee)) throw new Error(`${item.state || "Selected state"}: this permit requires a reviewed quote before payment. Email movingforwardpermitting@gmail.com.`);
    const details = Object.fromEntries(permitFields.map((field) => [field, clean(item.details?.[field])]));
    for (const field of permitFields.filter((f) => f !== "Additional Notes")) {
      if (!details[field]) throw new Error(`Please enter ${field} for ${item.state} ${item.permitType}.`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(details["Beginning Travel Date"]) || Number.isNaN(Date.parse(details["Beginning Travel Date"]))) throw new Error("Please enter a valid travel date.");
    return { state: item.state, permitType: item.permitType, stateFee, serviceFee, subtotal: stateFee + serviceFee, details, customer };
  });
  return { customer, orderItems, serviceFee, rush: body.rush === true, total: orderItems.reduce((sum, item) => sum + item.subtotal, 0) };
}
