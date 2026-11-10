import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

async function mailModule(){
  const context=vm.createContext({console});
  const mod=new vm.SourceTextModule(readFileSync(new URL('../lib/mail.mjs',import.meta.url),'utf8'),{context});
  await mod.link(name=>{
    const exports=name==='resend'?{Resend:class{}}:name==='./server.mjs'?
      {required:key=>key==='ADMIN_ALERT_EMAIL'?'admin@example.test':'not-a-secret',siteUrl:()=> 'https://movingforwardpermits.com'}:null;
    assert.ok(exports,'Unexpected import '+name);
    return new vm.SyntheticModule(Object.keys(exports),function(){
      for(const [k,v] of Object.entries(exports))this.setExport(k,v);
    },{context});
  });
  await mod.evaluate();
  return mod.namespace;
}
test('phone review notification queues a single admin-only message with safe escaped details',async()=>{
 const mail=await mailModule();
 const received=new Map();
 const db={from(table){assert.equal(table,'permit_mail_queue');return {upsert:async(row,options)=>{
   assert.equal(options.onConflict,'message_key');
   assert.equal(options.ignoreDuplicates,true);
   if(!received.has(row.message_key))received.set(row.message_key,row);
   return {error:null};
 }}}};
 const order={order_number:'00000000-0000-0000-0000-000000000001',
    company_name:'Demo <script>alert(1)</script>',
    processing_type:'Rush',
    order_items:[{state:'Arizona',permitType:'Trip Permit'},{state:'Kansas',permitType:'Fuel Permit'}]};
 await mail.phoneReviewMail(db,order);
 await mail.phoneReviewMail(db,order);
 assert.equal(received.size,1);
 const item=[...received.values()][0];
 assert.equal(item.recipient,'admin@example.test');
 assert.match(item.subject,/Phone order ready for review/);
 assert.ok(item.message_key.startsWith('phone-review-admin-'));
 assert.match(item.html,/Arizona/);
 assert.match(item.html,/Kansas/);
 assert.match(item.html,/&lt;script&gt;/);
 assert.doesNotMatch(item.html,/<script>/);
 assert.match(item.html,/No payment has been requested/);
});
