import test from 'node:test';
import assert from 'node:assert/strict';
import {knownDurationHours,suggestedExpirationDate,applySuggestedExpiration} from '../lib/permit-duration.mjs';
test('Maine 72-hour trip suggests end date three days after effective date',()=>{
  const d={'Beginning Travel Date':'2026-11-10'};
  assert.equal(knownDurationHours('Maine','Trip Permit',d),72);
  assert.equal(suggestedExpirationDate('Maine','Trip Permit',d).date,'2026-11-13');
});
test('selecting a new start date recalculates only previously auto-filled end dates',()=>{
  const prior={'Beginning Travel Date':'2026-11-10','Trip End Date':'2026-11-13'};
  const next={...prior,'Beginning Travel Date':'2026-11-12'};
  assert.equal(applySuggestedExpiration('Maine','Trip Permit',prior,next)['Trip End Date'],'2026-11-15');
  assert.equal(applySuggestedExpiration('Maine','Trip Permit',{...prior,'Trip End Date':'2026-11-11'}, {...next,'Trip End Date':'2026-11-11'})['Trip End Date'],'2026-11-11');
});
test('ambiguous duration stays blank; clearly stated 96-hour Arizona fuel suggests a date',()=>{
  assert.equal(suggestedExpirationDate('Alabama','Trip Permit',{'Beginning Travel Date':'2026-11-10'}),null);
  assert.equal(suggestedExpirationDate('Kansas','Fuel Permit',{'Beginning Travel Date':'2026-11-10'}),null);
  assert.equal(suggestedExpirationDate('Arizona','Fuel Permit',{'Beginning Travel Date':'2026-11-10'}).date,'2026-11-14');
});
test('Kansas fuel 24- and 72-hour selections change suggested end dates',()=>{
  assert.equal(suggestedExpirationDate('Kansas','Fuel Permit',{'Beginning Travel Date':'2026-11-10','Kansas Fuel Duration':'24 hours'}).date,'2026-11-11');
  assert.equal(suggestedExpirationDate('Kansas','Fuel Permit',{'Beginning Travel Date':'2026-11-10','Kansas Fuel Duration':'72 hours'}).date,'2026-11-13');
});
test('date arithmetic crosses month and leap year boundaries',()=>{
  assert.equal(suggestedExpirationDate('Maine','Trip Permit',{'Beginning Travel Date':'2028-02-28'}).date,'2028-03-02');
  assert.equal(suggestedExpirationDate('Maine','Trip Permit',{'Beginning Travel Date':'2026-02-30'}),null);
});
