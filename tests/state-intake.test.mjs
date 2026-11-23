import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareOrder,sharedFields,inquiryStates} from '../lib/order.mjs';
import {permitIntakeRule,extraPermitFields} from '../lib/permit-requirements.mjs';
const customer=Object.fromEntries(sharedFields.map(([key])=>[key,'Example']));
Object.assign(customer,{usdot:'1234567',vin:'1M8GDM9AXKP042788',email:'example@example.com',registeredWeight:'80000',axles:'5',irpStatus:'no',iftaStatus:'no',phoneNumber:'2055550100'});
const make=(state,permitType,details)=>({...customer,orderItems:[{state,permitType,details}]});
const start={'Beginning Travel Date':'2026-11-20'};
test('trip intake for Kansas, Arkansas and Iowa requires no clock time',()=>{
 for(const state of ['Kansas','Arkansas','Iowa']){
   const result=prepareOrder(make(state,'Trip Permit',start));
   assert.equal(result.orderItems[0].details['Effective Time'],'');
   assert.equal(result.orderItems[0].details['Time Zone'],'');
 }
});
test('optional clock time may be supplied and is validated',()=>{
 const r=prepareOrder(make('Arkansas','Trip Permit',{...start,'Effective Time':'14:30'}));
 assert.equal(r.orderItems[0].details['Effective Time'],'14:30');
 assert.throws(()=>prepareOrder(make('Arkansas','Trip Permit',{...start,'Effective Time':'99:00'})),/effective time/);
});
test('Maine needs dates and exposes the registration and lease reminders',()=>{
 assert.throws(()=>prepareOrder(make('Maine','Trip Permit',start)),/Trip End Date/);
 const d={...start,'Trip End Date':'2026-11-22','Maine Registration Copy Status':'Will request'};
 const r=prepareOrder(make('Maine','Trip Permit',d));
 assert.equal(r.orderItems[0].details['Maine Registration Copy Status'],'Will request');
 assert.ok(permitIntakeRule('Maine','Trip Permit').documentReminder.includes('registration'));
});
test('Arizona requires route and in-state miles but not clock time',()=>{
 assert.throws(()=>prepareOrder(make('Arizona','Trip Permit',start)),/Route/);
 const d={...start,'Route / Entry and Exit':'I-10 from California border to Tucson','Arizona Miles':'150'};
 const r=prepareOrder(make('Arizona','Trip Permit',d));
 assert.equal(r.orderItems[0].details['Arizona Miles'],'150');
 assert.throws(()=>prepareOrder(make('Arizona','Trip Permit',{...d,'Arizona Miles':'0'})),/miles/);
});
test('Kansas fuel has 24/72-hour duration selection',()=>{
 assert.ok(extraPermitFields('Kansas','Fuel Permit').some(f=>f.key==='Kansas Fuel Duration'));
 assert.throws(()=>prepareOrder(make('Kansas','Fuel Permit',start)),/Kansas Fuel Duration/);
 assert.equal(prepareOrder(make('Kansas','Fuel Permit',{...start,'Kansas Fuel Duration':'72 hours'})).orderItems[0].details['Kansas Fuel Duration'],'72 hours');
});
test('unsupported fuel issuance is explicitly blocked for configured Arkansas and Mississippi process',()=>{
 assert.throws(()=>prepareOrder(make('Arkansas','Fuel Permit',start)),/not currently offered/);
 assert.throws(()=>prepareOrder(make('Mississippi','Fuel Permit',start)),/not currently offered/);
});

test('nationwide inquiry includes all 50 states including locations not in phone permit roster',()=>{
  assert.equal(inquiryStates.length,50);
  for(const state of ['California','North Dakota','Hawaii','New York','Alabama']){
    assert.ok(inquiryStates.includes(state));
    const result=prepareOrder(make(state,'Trip Permit',start),{inquiry:true});
    assert.equal(result.orderItems[0].state,state);
  }
});
test('any state can request fuel help even if state issuance method is unconfirmed',()=>{
  assert.equal(prepareOrder(make('Arkansas','Fuel Permit',start),{inquiry:true}).orderItems[0].permitType,'Fuel Permit');
  assert.equal(prepareOrder(make('Mississippi','Trip + Fuel Permit',start),{inquiry:true}).orderItems[0].permitType,'Trip + Fuel Permit');
  assert.throws(()=>prepareOrder(make('Arkansas','Fuel Permit',start)),/not currently offered/);
});
test('public inquiry requires only beginning date at inquiry stage, not permit portal details',()=>{
  assert.equal(prepareOrder(make('Maine','Trip Permit',start),{inquiry:true}).orderItems[0].details['Trip End Date'],'');
  assert.equal(prepareOrder(make('Arizona','Trip Permit',start),{inquiry:true}).orderItems[0].details['Arizona Miles'],'');
  assert.equal(prepareOrder(make('Kansas','Fuel Permit',start),{inquiry:true}).orderItems[0].details['Kansas Fuel Duration'],'');
});
test('nationwide inquiry rejects invalid state, invalid optional effective time, and missing travel date',()=>{
  assert.throws(()=>prepareOrder(make('Atlantis','Trip Permit',start),{inquiry:true}),/supported state/);
  assert.throws(()=>prepareOrder(make('Alabama','Trip Permit',{'Effective Time':'10:00'}),{inquiry:true}),/travel dates/);
  assert.throws(()=>prepareOrder(make('Alabama','Trip Permit',{...start,'Effective Time':'25:30'}),{inquiry:true}),/effective time/);
});

test('Georgia adds safety USDOT and unladen weight from official trip portal',()=>{
 assert.throws(()=>prepareOrder(make('Georgia','Trip Permit',start)),/Georgia Safety USDOT/);
 const details={...start,'Georgia Safety USDOT':'1234567','Georgia Unladen Weight':'17500'};
 const result=prepareOrder(make('Georgia','Trip Permit',details));
 assert.equal(result.orderItems[0].details['Georgia Unladen Weight'],'17500');
 assert.throws(()=>prepareOrder(make('Georgia','Trip Permit',{...details,'Georgia Unladen Weight':'0'})),/unladen/);
});
test('Kentucky temporary permits request safety USDOT and flag KYU checks',()=>{
 assert.throws(()=>prepareOrder(make('Kentucky','Trip Permit',start)),/Kentucky Safety USDOT/);
 const result=prepareOrder(make('Kentucky','Trip Permit',{...start,'Kentucky Safety USDOT':'1234567','Kentucky KYU Status':'Not sure'}));
 assert.equal(result.orderItems[0].details['Kentucky KYU Status'],'Not sure');
});
test('Missouri temporary permits require effective time and vehicle descriptors',()=>{
 assert.throws(()=>prepareOrder(make('Missouri','Trip Permit',start)),/Effective Time/);
 const fields={...start,'Effective Time':'11:00','Missouri Model Year':'2020','Missouri Vehicle Body Type':'Straight truck'};
 assert.equal(prepareOrder(make('Missouri','Trip Permit',fields)).orderItems[0].details['Missouri Model Year'],'2020');
});
test('Virginia leased permits require lessor information',()=>{
 const fields={...start,'Virginia Plate Expiration Date':'2027-10-31','Virginia Vehicle Model':'Cascadia','Virginia Lease Status':'Leased'};
 assert.throws(()=>prepareOrder(make('Virginia','Trip Permit',fields)),/lessor/);
 assert.equal(prepareOrder(make('Virginia','Trip Permit',{...fields,'Virginia Lessor Name':'Owner Transport LLC'})).orderItems[0].details['Virginia Lease Status'],'Leased');
});
test('public inquiry can save partial state portal information without pretending all fields verified',()=>{
 const r=prepareOrder(make('Georgia','Trip Permit',start),{inquiry:true});
 assert.equal(r.orderItems[0].details['Georgia Safety USDOT'],'');
});
