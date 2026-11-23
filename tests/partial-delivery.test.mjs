import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

async function routeWithMocks({paid=true,mode='live',status='processing',existing=false}={}) {
  let uploaded=0,mail=0,queued=0,removed=0;
  const order={order_number:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    payment_status:paid?'paid':'pending',order_status:status,contact_email:'driver@example.com',
    quote:{stripeMode:mode},order_items:[{state:'Georgia',permitType:'Trip Permit'}]};
  const db={
    from(table){
      if(table==='permit_orders')return {select(){return this;},eq(){return this;},single:async()=>({data:order})};
      if(table==='permit_item_deliveries')return {select(){return this;},eq(){return this;},maybeSingle:async()=>({data:existing?{item_index:0}:null})};
      throw Error('unexpected table');
    },
    storage:{from:()=>({
      upload:async()=>{uploaded++;return {error:null}},
      createSignedUrl:async()=>({data:{signedUrl:'https://example.com/private.pdf'}}),
      remove:async()=>{removed++;return {error:null}},
    })},
    rpc:async(name,args)=>{
      assert.equal(name,'queue_permit_item_delivery');
      assert.equal(args.p_index,0);
      assert.equal(args.p_state,'Georgia');
      queued++;
      return {data:true};
    },
  };
  const source=readFileSync(new URL('../app/api/admin-item-delivery/route.js',import.meta.url),'utf8');
  const ctx=vm.createContext({Response,Request,FormData,File,Buffer,URL,console,process:{env:{}}});
  const mod=new vm.SourceTextModule(source,{context:ctx});
  const mocks={
    'node:crypto':{randomUUID:()=> 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'},
    '../../../lib/server.mjs':{
      requireAdmin:async()=>({db,user:{id:'admin-id'}}),
      badRequest:msg=>Object.assign(new Error(msg),{status:400}),
      failure:e=>Response.json({error:e.message},{status:e.status||503}),
    },
    '../../../lib/mail.mjs':{html:x=>String(x),tryDrainMail:async()=>{mail++;return {sent:1}}},
  };
  await mod.link(name=>{
    assert.ok(mocks[name],name);
    const exports=mocks[name];
    return new vm.SyntheticModule(Object.keys(exports),function(){
      for(const [key,value] of Object.entries(exports))this.setExport(key,value);
    },{context:ctx});
  });
  await mod.evaluate();
  const form=new FormData();
  form.set('orderNumber',order.order_number);
  form.set('itemIndex','0');
  form.set('reviewConfirmed','true');
  form.append('permits',new File([new Uint8Array([37,80,68,70,45,49,46,52])],'permit.pdf',{type:'application/pdf'}));
  return {run:()=>mod.namespace.POST(new Request('https://example.invalid/api/admin-item-delivery',{method:'POST',body:form})),stats:()=>({uploaded,queued,mail,removed})};
}
test('refuses unpaid orders before upload or email',async()=>{
  const x=await routeWithMocks({paid:false});const result=await x.run();
  assert.equal(result.status,400);assert.deepEqual(x.stats(),{uploaded:0,queued:0,mail:0,removed:0});
});
test('refuses sandbox test orders even when marked paid',async()=>{
  const x=await routeWithMocks({mode:'test'});const result=await x.run();
  assert.equal(result.status,400);assert.equal(x.stats().uploaded,0);
});
test('rejects duplicate uploads for an already delivered item',async()=>{
  const x=await routeWithMocks({existing:true});const result=await x.run();
  assert.equal(result.status,400);assert.equal(x.stats().queued,0);
});
test('uploads only selected item and queues one email for the customer',async()=>{
  const x=await routeWithMocks();const result=await x.run();
  assert.equal(result.status,200);
  assert.deepEqual(x.stats(),{uploaded:1,queued:1,mail:1,removed:0});
});
test('schema restricts table and RPC to service role and locks parent order',()=>{
  const sql=readFileSync(new URL('../supabase/migrations/20261123190000_partial_permit_delivery.sql',import.meta.url),'utf8');
  assert.match(sql,/enable row level security/);
  assert.match(sql,/revoke all on public\.permit_item_deliveries from public, anon, authenticated/);
  assert.match(sql,/for update/);
  assert.match(sql,/unique\(order_number,item_index\)/);
  assert.match(sql,/payment_status <> 'paid'/);
  assert.match(sql,/mark_permit_item_delivery_sent/);
});
