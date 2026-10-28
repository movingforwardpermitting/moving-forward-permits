// Isolated tests: no live database, email, or payment calls.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {prepareOrder,sharedFields,permitFields} from '../lib/order.mjs';
import {reviewedQuote,verifyPayment} from '../lib/quote.mjs';
const customer=Object.fromEntries(sharedFields.map(([key])=>[key,'Example']));
Object.assign(customer,{usdot:'1234567',vin:'1M8GDM9AXKP042788',email:'example@example.com',registeredWeight:'80000',axles:'5',irpStatus:'no',iftaStatus:'no',phoneNumber:'2055550100'});
const details=Object.fromEntries(permitFields.map(field=>[field,'Example']));
Object.assign(details,{'Beginning Travel Date':'2026-11-01','Trip End Date':'2026-11-02','Effective Time':'08:00','Time Zone':'America/Chicago'});
const item={state:'Georgia',permitType:'Trip Permit',details,stateFee:0};
const input=(extra={})=>({...customer,orderItems:[item,item],total:1,...extra});
const order=(extra={})=>({order_number:'order-1',payment_status:'not_requested',processing_type:'Standard',order_items:prepareOrder(input()).orderItems,...extra});
const line=(extra={})=>({stateCents:3000,otherCents:0,source:'https://dor.georgia.gov/georgia-trucking-portal-faqs',verifiedOn:'2026-10-27',...extra});
const quote=(extra={})=>({reviewConfirmed:true,lines:[line(),line()],...extra});

test('intake stores unknown-fee states without charging or trusting client prices',()=>{
 const result=prepareOrder(input({orderItems:[{...item,state:'Kentucky'}]}));
 assert.equal(result.orderItems[0].state,'Kentucky');assert.equal(result.total,undefined);assert.equal(result.orderItems[0].stateFee,undefined);
});
test('intake retains carrier, vehicle, email and travel details',()=>{const r=prepareOrder(input());assert.equal(r.customer.email,customer.email);assert.equal(r.orderItems[0].details['Trip End Date'],'2026-11-02');assert.equal(r.customer.businessAddress,'Example');});
test('intake rejects impossible dates, invalid zones and unsupported states',()=>{
 assert.throws(()=>prepareOrder(input({orderItems:[{...item,details:{...details,'Beginning Travel Date':'2026-02-31'}}]})),/dates/);
 assert.throws(()=>prepareOrder(input({orderItems:[{...item,details:{...details,'Time Zone':'Nowhere'}}]})),/zone/);
 assert.throws(()=>prepareOrder(input({orderItems:[{...item,state:'Not a state'}]})),/supported/);
});
test('required contact and weight validation',()=>{assert.throws(()=>prepareOrder(input({email:'bad'})),/email/);assert.throws(()=>prepareOrder(input({registeredWeight:'abc'})),/weight/);});
test('reviewed standard fee is per permit; client totals ignored',()=>{const r=reviewedQuote(order(),quote({total:1}));assert.equal(r.totalCents,13000);assert.equal(r.serviceCount,2);});
test('rush replaces standard per permit',()=>{assert.equal(reviewedQuote(order({processing_type:'Rush'}),quote()).totalCents,16000);});
test('blank fees do not silently become zero',()=>{assert.throws(()=>reviewedQuote(order(),quote({lines:[line({otherCents:''}),line()]})),/explicitly/);});
test('no quote without explicit review, every line and fee sources',()=>{
 assert.throws(()=>reviewedQuote(order(),quote({reviewConfirmed:false})),/Confirm/);
 assert.throws(()=>reviewedQuote(order(),quote({lines:[line()]})),/every/);
 assert.throws(()=>reviewedQuote(order(),quote({lines:[line({source:''}),line()]})),/source/);
});
test('single state combination and separate permits have explicit service counts',()=>{
 const combined=order({order_items:[{...item,permitType:'Trip + Fuel Permit'}]});
 assert.throws(()=>reviewedQuote(combined,{reviewConfirmed:true,lines:[line()]}),/combination/);
 assert.equal(reviewedQuote(combined,{reviewConfirmed:true,lines:[line({serviceCount:1,combinationTreatment:'State-issued combination'})]}).totalCents,6500);
 assert.equal(reviewedQuote(combined,{reviewConfirmed:true,lines:[line({serviceCount:2,combinationTreatment:'Two separate permits'})]}).totalCents,10000);
});
test('paid orders cannot be quoted again',()=>assert.throws(()=>reviewedQuote(order({payment_status:'paid'}),quote()),/already paid/));
test('payment must match order, currency, paid status, approved amount and session',()=>{
 const o=order({quote:{totalCents:13000},stripe_session_id:'cs_test'}),s={payment_status:'paid',currency:'usd',amount_total:13000,metadata:{order_id:'order-1'},id:'cs_test'};
 assert.ok(verifyPayment(o,s));for(const change of [{payment_status:'unpaid'},{currency:'eur'},{amount_total:1},{metadata:{order_id:'other'}},{id:'other'}])assert.equal(verifyPayment(o,{...s,...change}),false);
});
async function moduleWithMocks(path,mocks,env={}){
 const context=vm.createContext({Response,Request,Buffer,URL,console:{error(){}},process:{env}});
 const mod=new vm.SourceTextModule(readFileSync(new URL(path,import.meta.url),'utf8'),{context});
 await mod.link(name=>{assert.ok(mocks[name],`Unexpected external dependency ${name}`);const exports=mocks[name];return new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v]of Object.entries(exports))this.setExport(k,v);},{context});});await mod.evaluate();return mod.namespace;
}
test('admin auth fails closed without a token and does not create a DB client',async()=>{
 let calls=0;const server=await moduleWithMocks('../lib/server.mjs',{'@supabase/supabase-js':{createClient(){calls++;throw Error('Unexpected DB access');}},stripe:{default:class{}}});
 await assert.rejects(()=>server.requireAdmin(new Request('https://example.invalid')),e=>e.status===401);assert.equal(calls,0);
});
test('admin auth verifies with Supabase and restricts to approved user IDs',async()=>{
 const server=await moduleWithMocks('../lib/server.mjs',{'@supabase/supabase-js':{createClient:()=>({auth:{getUser:async token=>({data:{user:{id:token}}})}})},stripe:{default:class{}}},{NEXT_PUBLIC_SUPABASE_URL:'https://example.invalid',SUPABASE_SERVICE_ROLE_KEY:'test-not-real',ADMIN_USER_IDS:'approved'});
 await assert.rejects(()=>server.requireAdmin(new Request('https://example.invalid',{headers:{authorization:'Bearer other'}})),e=>e.status===403);
 assert.equal((await server.requireAdmin(new Request('https://example.invalid',{headers:{authorization:'Bearer approved'}}))).user.id,'approved');
});
test('forged webhook signatures cannot reach the database',async()=>{
 let calls=0;const route=await moduleWithMocks('../app/api/stripe-webhook/route.js',{'../../../lib/server.mjs':{database(){calls++;throw Error();},stripeClient:()=>({webhooks:{constructEvent(){throw Error('bad signature');}}}),required:()=> 'test'},'../../../lib/quote.mjs':{verifyPayment},'../../../lib/mail.mjs':{paidMail:async()=>{},tryDrainMail:async()=>{}}});
 assert.equal((await route.POST(new Request('https://example.invalid',{method:'POST',body:'forged'}))).status,400);assert.equal(calls,0);
});

async function webhookHarness(session, existingOrder) {
 let state={...existingOrder}, updates=0, mailCalls=0;
 const db={from:()=>{let mode='read',patch={};const q={select(){return q;},eq(){return q;},update(value){mode='update';patch=value;return q;},async single(){if(mode==='update'){updates++;state={...state,...patch};}return {data:{...state},error:null};}};return q;}};
 const route=await moduleWithMocks('../app/api/stripe-webhook/route.js',{'../../../lib/server.mjs':{database:()=>db,stripeClient:()=>({webhooks:{constructEvent:()=>({type:'checkout.session.completed',livemode:false,data:{object:session}})}}),required:()=> 'test'},'../../../lib/quote.mjs':{verifyPayment},'../../../lib/mail.mjs':{paidMail:async()=>{mailCalls++;},tryDrainMail:async()=>{}}});
 return {post:()=>route.POST(new Request('https://example.invalid',{method:'POST',body:'signed-test'})),get:()=>({state,updates,mailCalls})};
}
test('replayed paid webhook does not update payment twice',async()=>{
 const session={id:'cs_test',metadata:{order_id:'order-1',quote_revision:'rev1'},payment_status:'paid',currency:'usd',amount_total:13000,payment_intent:'pi_test'};
 const h=await webhookHarness(session,order({quote:{totalCents:13000},quote_revision:'rev1',stripe_session_id:'cs_test',payment_status:'pending'}));
 assert.equal((await h.post()).status,200);assert.equal((await h.post()).status,200);assert.equal(h.get().updates,1);assert.equal(h.get().state.payment_status,'paid');
});
test('signed but wrong-amount webhook never marks order paid',async()=>{
 const session={id:'cs_test',metadata:{order_id:'order-1',quote_revision:'rev1'},payment_status:'paid',currency:'usd',amount_total:1};
 const h=await webhookHarness(session,order({quote:{totalCents:13000},quote_revision:'rev1',stripe_session_id:'cs_test',payment_status:'pending'}));
 assert.equal((await h.post()).status,500);assert.equal(h.get().updates,0);assert.equal(h.get().mailCalls,0);
});

test('email test cannot send before admin authentication',async()=>{
 let sends=0;const route=await moduleWithMocks('../app/api/admin-email-test/route.js',{'node:crypto':{randomUUID:()=> 'test-id'},resend:{Resend:class{constructor(){this.emails={send:async()=>{sends++;return {data:{id:'test'}};}};}}},'../../../lib/server.mjs':{requireAdmin:async()=>{throw Object.assign(new Error('Unauthorized'),{status:401});},required:()=> 'test',failure:e=>Response.json({error:e.message},{status:e.status||503})}});
 assert.equal((await route.POST(new Request('https://example.invalid',{method:'POST'}))).status,401);assert.equal(sends,0);
});
test('email test recipient is the verified admin; provider errors are not success',async()=>{
 let recipient;
 const route=await moduleWithMocks('../app/api/admin-email-test/route.js',{'node:crypto':{randomUUID:()=> 'test-id'},resend:{Resend:class{constructor(){this.emails={send:async msg=>{recipient=msg.to;return {error:{message:'rejected'},data:null};}};}}},'../../../lib/server.mjs':{requireAdmin:async()=>({db:{rpc:async()=>({data:true})},user:{id:'admin',email:'admin@example.invalid',email_confirmed_at:'2026-10-27'}}),required:()=> 'test',failure:e=>Response.json({error:e.message},{status:e.status||503})}});
 const response=await route.POST(new Request('https://example.invalid',{method:'POST',body:JSON.stringify({to:'other@example.invalid'})}));assert.equal(response.status,502);assert.equal(recipient,'admin@example.invalid');
});

async function sandboxHarness({ valid=true, live=false, mode='test', amount=13000 }={}) {
 let updates=0, mails=0;
 const session={id:'cs_test',metadata:{order_id:'order-1',quote_revision:'rev1',stripe_mode:'test'},payment_status:'paid',currency:'usd',amount_total:amount};
 let state=order({quote:{totalCents:13000,stripeMode:mode},quote_revision:'rev1',stripe_session_id:'cs_test',payment_status:'pending'});
 const db={from:()=>{let patch;const q={select(){return q;},eq(){return q;},update(value){patch=value;return q;},async single(){if(patch){updates++;state={...state,...patch};}return {data:{...state}};}};return q;}};
 const route=await moduleWithMocks('../app/api/stripe-sandbox-webhook/route.js',{'stripe':{default:{webhooks:{constructEvent(){if(!valid)throw Error('bad signature');return {type:'checkout.session.completed',livemode:live,data:{object:session}};}}}},'../../../lib/server.mjs':{database:()=>db,required:()=> 'test-secret'},'../../../lib/quote.mjs':{verifyPayment},'../../../lib/mail.mjs':{paidMail:async()=>{mails++;},tryDrainMail:async()=>{}}});
 return {post:()=>route.POST(new Request('https://example.invalid',{method:'POST',body:'test-only'})),get:()=>({updates,mails,state})};
}
test('public sandbox callback rejects invalid signatures and live events',async()=>{for(const config of [{valid:false},{live:true}]){const h=await sandboxHarness(config);assert.equal((await h.post()).status,400);assert.equal(h.get().updates,0);}});
test('sandbox callback cannot update a live or untagged quote',async()=>{const h=await sandboxHarness({mode:'live'});assert.equal((await h.post()).status,400);assert.equal(h.get().updates,0);assert.equal(h.get().mails,0);});
test('sandbox callback confirms matching payment and safely handles retries',async()=>{const h=await sandboxHarness();assert.equal((await h.post()).status,200);assert.equal((await h.post()).status,200);assert.equal(h.get().updates,1);assert.equal(h.get().state.payment_status,'paid');});
test('sandbox callback rejects wrong payment amounts',async()=>{const h=await sandboxHarness({amount:1});assert.equal((await h.post()).status,500);assert.equal(h.get().updates,0);assert.equal(h.get().mails,0);});
