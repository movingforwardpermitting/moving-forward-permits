import { requireAdmin, jsonBody, badRequest, failure } from '../../../lib/server.mjs';
import { quotePreview } from '../../../lib/quote-preview.mjs';
// Save unapproved fee work to the existing order, never marking it reviewed or paid.
export async function POST(req) {
  try {
    const { db, user }=await requireAdmin(req);
    const body=await jsonBody(req);
    if (!/^[a-f0-9-]{36}$/i.test(String(body.orderNumber||''))) throw badRequest('Invalid order number.');
    if (!Array.isArray(body.lines)||body.lines.length>20) throw badRequest('Invalid quote lines.');
    const found=await db.from('permit_orders').select('*').eq('order_number',body.orderNumber).single();
    if(found.error||!found.data)throw badRequest('Order not found.');
    const order=found.data;
    if(!['pending_review','missing_information'].includes(order.order_status) || !['not_requested','expired'].includes(order.payment_status))
      throw badRequest('This order cannot be edited after a payment request or payment.');
    if(body.lines.length!==(order.order_items||[]).length)throw badRequest('Include all permit lines.');
    // Explicitly bound values, disallow very large or arbitrary objects.
    const clean=body.lines.map((line)=>{
      const money=(v)=>v===''||v===null||v===undefined?'':Number(v);
      const stateCents=money(line?.stateCents),otherCents=money(line?.otherCents);
      if([stateCents,otherCents].some(v=>v!==''&&(!Number.isSafeInteger(v)||v<0||v>10000000)))throw badRequest('Invalid fee amount.');
      const source=String(line?.source||'').slice(0,1000);
      const verifiedOn=String(line?.verifiedOn||'').slice(0,30);
      return {stateCents,otherCents,source,verifiedOn,
        serviceCount:line?.serviceCount===2?2:1,
        combinationTreatment:String(line?.combinationTreatment||'').slice(0,500)};
    });
    const preview=quotePreview(clean,order.order_items,order.processing_type);
    const quote={draft:true,lines:clean,partialTotalCents:preview.serviceCents+preview.knownStateCents+preview.knownProviderCents,
      lastEditedBy:user.id,lastEditedAt:new Date().toISOString()};
    const saved=await db.from('permit_orders').update({quote})
      .eq('order_number',order.order_number).in('order_status',['pending_review','missing_information'])
      .in('payment_status',['not_requested','expired']).select('order_number,quote,order_status').maybeSingle();
    if(saved.error || !saved.data) throw badRequest('Order changed. Reload before saving your quote.');
    return Response.json({saved:true,at:quote.lastEditedAt,ready:preview.ready,pending:preview.pending},
      {headers:{'Cache-Control':'no-store'}});
  }catch(error){return failure(error);}
}
