import test from 'node:test';
import assert from 'node:assert/strict';
import { initialQuoteLines, quotePreview, permitFeeReferences } from '../lib/quote-preview.mjs';
const items=[{state:'Arizona',permitType:'Trip Permit'},{state:'Kansas',permitType:'Trip Permit'},{state:'Arkansas',permitType:'Trip Permit'}];
test('three-state draft is not a final quote when all state/provider fees are missing',()=>{
  const lines=initialQuoteLines(items);
  const result=quotePreview(lines,items,'Standard');
  assert.equal(result.serviceCents,10500);
  assert.equal(result.knownStateCents,5900);
  assert.equal(result.totalCents,null);
  assert.equal(result.ready,false);
  assert.ok(result.pending.some(s=>s.includes('Arizona')&&s.includes('state fee')));
});
test('fixed fees autofill from the state/type reference catalog but require review',()=>{
  const lines=initialQuoteLines(items);
  assert.equal(lines[1].stateCents,2600);
  assert.equal(lines[2].stateCents,3300);
  assert.equal(permitFeeReferences.Kansas['Trip Permit'].feeCents,2600);
  assert.equal(permitFeeReferences.Arkansas['Trip Permit'].feeCents,3300);
  assert.equal(permitFeeReferences.Arizona['Trip Permit'].feeCents,undefined);
  assert.equal(lines[0].stateCents,'');
  assert.equal(lines[0].verifiedOn,'');
  assert.equal(lines[1].verifiedOn,'');
  assert.equal(lines[1].otherCents,'');
});
test('known state fees are partial subtotal, never total due while Arizona unresolved',()=>{
  const lines=initialQuoteLines(items);
  lines[1].stateCents=2600;lines[2].stateCents=3300;
  const result=quotePreview(lines,items,'Standard');
  assert.equal(result.knownStateCents,5900);
  assert.equal(result.serviceCents,10500);
  assert.equal(result.totalCents,null);
  assert.equal(result.ready,false);
});
test('explicitly verified fees and source dates create a complete preview',()=>{
  const lines=initialQuoteLines(items);
  lines.forEach((l,i)=>{l.stateCents=[4000,2600,3300][i];l.otherCents=0;l.source='https://example.gov/permit';l.verifiedOn='2026-11-10';});
  const result=quotePreview(lines,items,'Standard');
  assert.equal(result.ready,true);
  assert.equal(result.totalCents,20400);
});
test('rush fee is a replacement, not an addition',()=>{
  const lines=initialQuoteLines(items);
  const result=quotePreview(lines,items,'Rush');
  assert.equal(result.serviceCents,15000);
});
test('provider fees must be explicitly verified even if zero',()=>{
  const lines=initialQuoteLines(items);
  lines.forEach(l=>{l.stateCents=1000;l.source='https://example.gov/permit';l.verifiedOn='2026-11-10';});
  assert.equal(quotePreview(lines,items,'Standard').ready,false);
  lines.forEach(l=>{l.otherCents=0;});
  assert.equal(quotePreview(lines,items,'Standard').ready,true);
});

test('fifty-state researched catalog is available but conditional costs stay blank',()=>{
  assert.equal(Object.keys(permitFeeReferences).length,50);
  const count=Object.values(permitFeeReferences).reduce((sum,states)=>sum+Number(!!states['Trip Permit'])+Number(!!states['Fuel Permit']),0);
  assert.equal(count,100);
  assert.equal(initialQuoteLines([{state:'Arizona',permitType:'Fuel Permit'}])[0].stateCents,'');
  assert.equal(initialQuoteLines([{state:'Kansas',permitType:'Fuel Permit'}])[0].stateCents,'');
  assert.equal(initialQuoteLines([{state:'Connecticut',permitType:'Fuel Permit'}])[0].stateCents,'');
  assert.equal(initialQuoteLines([{state:'Mississippi',permitType:'Fuel Permit'}])[0].stateCents,'');
});
test('selection automatically chooses the correct state-and-type fee without carrying over a previous item',()=>{
 const selections=[
  {state:'Alabama',permitType:'Trip Permit'},
  {state:'Alabama',permitType:'Fuel Permit'},
  {state:'Maine',permitType:'Fuel Permit'},
  {state:'Arkansas',permitType:'Trip Permit'},
  {state:'Missouri',permitType:'Trip + Fuel Permit'},
 ];
 const amounts=initialQuoteLines(selections).map(l=>l.stateCents);
 assert.deepEqual(amounts,[2000,2000,5000,3300,2000]);
});
