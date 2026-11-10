import { randomUUID } from 'node:crypto';
import { requireAdmin, jsonBody, badRequest, failure } from '../../../lib/server.mjs';
import { sharedFields, permitFields, supportedStates, prepareOrder } from '../../../lib/order.mjs';

const types = ['Trip Permit', 'Fuel Permit', 'Trip + Fuel Permit'];
const short = value => typeof value === 'string' ? value.trim().slice(0, 2000) : '';
const uuid = value => typeof value === 'string' && /^[a-f0-9-]{36}$/i.test(value);
function cardLike(value) {
  const candidates = String(value).match(/(?:\d[\s-]?){13,19}/g) || [];
  return candidates.some(candidate => {
    const digits = candidate.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0, double = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = Number(digits[i]);
      if (double) { n *= 2; if (n > 9) n -= 9; }
      sum += n; double = !double;
    }
    return sum % 10 === 0;
  });
}
function sanitize(body) {
  const customer = Object.fromEntries(sharedFields.map(([name]) => [name, short(body.customer?.[name])]));
  if (!Array.isArray(body.items) || body.items.length > 20) throw badRequest('Select up to 20 permits.');
  const items = body.items.map(item => {
    if (!supportedStates.includes(item?.state) || !types.includes(item?.permitType))
      throw badRequest('Choose a supported state and permit type.');
    return { state:item.state, permitType:item.permitType,
      details:Object.fromEntries(permitFields.map(name => [name, short(item.details?.[name])])) };
  });
  const paymentPreference = body.paymentPreference === 'phone_card' ? 'phone_card' : 'payment_link';
  const values = [...Object.values(customer), ...items.flatMap(item=>Object.values(item.details))];
  if (values.some(cardLike)) throw badRequest('Never enter card numbers in order details. Use the secure Stripe payment screen.');
  return { customer, items, paymentPreference, rush:body.rush===true };
}
export async function GET(req) {
  try {
    const { db } = await requireAdmin(req);
    const id = new URL(req.url).searchParams.get('orderNumber');
    if (!uuid(id)) throw badRequest('Enter a valid order number.');
    const result = await db.from('permit_orders').select('*').eq('order_number',id).single();
    if (result.error || !result.data || result.data.customer_details?.intakeChannel !== 'phone')
      throw badRequest('Phone order not found.');
    return Response.json({ order: result.data }, {headers:{'Cache-Control':'no-store'}});
  } catch(error) { return failure(error); }
}
export async function POST(req) {
  try {
    const { db, user } = await requireAdmin(req);
    const body = await jsonBody(req);
    if (body.action === 'create') {
      const result = await db.from('permit_orders').insert({
        order_number:randomUUID(), company_name:'Phone order — details pending',
        order_status:'draft', payment_status:'not_requested', processing_type:'Standard',
        customer_details:{intakeChannel:'phone',paymentPreference:'payment_link'},
        order_items:[],total:0,last_updated_by:user.id,updated_at:new Date().toISOString()
      }).select('*').single();
      if (result.error) throw new Error('Could not save the new phone order.');
      return Response.json({order:result.data});
    }
    if (!uuid(body.orderNumber)) throw badRequest('Invalid order number.');
    const current = await db.from('permit_orders').select('*').eq('order_number',body.orderNumber).single();
    if (current.error || !current.data || current.data.customer_details?.intakeChannel !== 'phone')
      throw badRequest('Phone order not found.');
    if (current.data.order_status !== 'draft') throw badRequest('This phone order is no longer a draft.');
    const draft = sanitize(body);
    let customer = draft.customer, items = draft.items;
    if (body.action === 'finalize') {
      const prepared = prepareOrder({...customer,orderItems:items,rush:draft.rush});
      customer = prepared.customer; items = prepared.orderItems;
    } else if (body.action !== 'save') throw badRequest('Unsupported order action.');
    const update = {
      company_name:customer.companyName || 'Phone order — details pending',
      usdot:customer.usdot||null,mc_number:customer.mcNumber||null,
      vin:customer.vin||null,plate_number:customer.plateNumber||null,
      phone_number:customer.phoneNumber||null,contact_email:customer.email||null,
      permit_type:items[0]?.permitType||null,permit_state:items[0]?.state||null,
      processing_type:draft.rush?'Rush':'Standard',order_items:items,
      customer_details:{...customer,intakeChannel:'phone',paymentPreference:draft.paymentPreference},
      updated_at:new Date().toISOString(),last_updated_by:user.id,
      ...(body.action === 'finalize' ? {order_status:'pending_review'} : {}),
    };
    if (body.version !== current.data.updated_at)
      throw Object.assign(new Error('This order changed in another tab. Reload before saving to prevent overwriting information.'),{status:409});
    const result = await db.from('permit_orders').update(update)
      .eq('order_number',body.orderNumber).eq('order_status','draft').eq('updated_at',body.version)
      .select('*').maybeSingle();
    if (result.error || !result.data) throw Object.assign(new Error('Save conflict. Reload the phone order and review the information.'),{status:409});
    return Response.json({order:result.data},{headers:{'Cache-Control':'no-store'}});
  } catch(error) { return failure(error); }
}
