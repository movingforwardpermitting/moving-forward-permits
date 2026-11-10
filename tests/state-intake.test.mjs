import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareOrder,sharedFields} from '../lib/order.mjs';
import {permitIntakeRule,extraPermitFields} from '../lib/permit-requirements.mjs';
const customer=Object.fromEntries(sharedFields.map(([key])=>[key,'Example']));
Object.assign(customer,{usdot:'1234567',vin:'1M8GDM9AXKP042788',email:'example@example.com',registeredWeight:'80000',axles:'5',irpStatus:'no',iftaStatus:'no',phoneNumber:'2055550100'});
const make=(state,permitType,details)=>({...customer,orderItems:[{state,permitType,details}]});
const start={'Beginning Travel Date':'2026-11-20'};
test('trip intake for Kansas, Arkansas, Iowa and Georgia requires no clock time',()=>{
 for(const state of ['Kansas','Arkansas','Iowa','Georgia']){
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
