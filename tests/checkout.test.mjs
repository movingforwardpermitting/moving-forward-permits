// Run: node --experimental-vm-modules --test tests/checkout.test.mjs
// All external services are simulated. No network, payments, orders, or emails.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as order from '../lib/order.mjs';

const customer = Object.fromEntries(order.sharedFields.map(([key]) => [key, 'Example']));
Object.assign(customer, { usdot: '1234567', vin: '1M8GDM9AXKP042788', email: 'example@example.com' });
const details = Object.fromEntries(order.permitFields.map((field) => [field, 'Example']));
details['Beginning Travel Date'] = '2026-11-01';
const item = { state: 'Alabama', permitType: 'Trip Permit', stateFee: 0, details };
const payload = (extra = {}) => ({ ...customer, orderItems: [item, item], total: 1, ...extra });

async function handler({ storageError = false, stripeError = false } = {}) {
  const calls = { inserts: [], emails: [], sessions: [] };
  const context = vm.createContext({ Response, console: { log() {}, error() {} }, process: { env: {} } });
  const fake = (exports) => new vm.SyntheticModule(Object.keys(exports), function () {
    for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
  }, { context });
  const modules = {
    '../../../lib/order.mjs': fake(order),
    stripe: fake({ default: class { constructor() { this.checkout = { sessions: { create: async (data) => {
      calls.sessions.push(data);
      if (stripeError) throw new Error('Simulated Stripe failure');
      return { id: 'cs_test_example', url: 'https://example.invalid/test-checkout' };
    } } }; } } }),
    '@supabase/supabase-js': fake({ createClient: () => ({ from: () => ({ insert: async (data) => {
      calls.inserts.push(data);
      return { error: storageError ? { message: 'Simulated storage failure' } : null };
    } }) }) }),
    resend: fake({ Resend: class { constructor() { this.emails = { send: async (data) => {
      calls.emails.push(data); return { data: { id: 'email_test' }, error: null };
    } }; } } }),
  };
  const source = readFileSync(new URL('../app/api/create-checkout-session/route.js', import.meta.url), 'utf8');
  const module = new vm.SourceTextModule(source, { context });
  await module.link((name) => {
    assert.ok(modules[name], `Unexpected external dependency: ${name}`);
    return modules[name];
  });
  await module.evaluate();
  return { calls, post: (body) => module.namespace.POST({ json: async () => body }) };
}

test('standard service is per permit; client totals and fees cannot set Stripe amount', async () => {
  const { post, calls } = await handler();
  const response = await post(payload());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).url, 'https://example.invalid/test-checkout');
  assert.deepEqual(Array.from(calls.sessions[0].line_items, (line) => line.price_data.unit_amount), [5500, 5500]);
  assert.equal(calls.inserts[0][0].total, 110);
  assert.equal(calls.inserts[0][0].order_items[0].customer.email, customer.email);
  assert.equal(calls.inserts[0][0].order_items[0].details['Beginning Travel Date'], '2026-11-01');
  assert.match(calls.emails[0].subject, /Payment Not Confirmed/);
});
test('rush replaces standard and is charged per permit', () => {
  assert.equal(order.prepareOrder(payload({ rush: true })).total, 140);
});
test('unknown state fees cannot create an order, email or checkout', async () => {
  const { post, calls } = await handler();
  assert.equal((await post(payload({ orderItems: [{ ...item, state: 'Georgia' }] }))).status, 400);
  assert.equal(calls.inserts.length + calls.emails.length + calls.sessions.length, 0);
});
test('combination pricing requires review', () => {
  assert.throws(() => order.prepareOrder(payload({ orderItems: [{ ...item, permitType: 'Trip + Fuel Permit' }] })), /reviewed quote/);
});
test('missing travel details and invalid contact details are rejected', () => {
  assert.throws(() => order.prepareOrder(payload({ orderItems: [{ ...item, details: {} }] })), /Travel Date/);
  assert.throws(() => order.prepareOrder(payload({ email: 'invalid' })), /email/);
});
test('failed storage prevents email and Stripe checkout', async () => {
  const { post, calls } = await handler({ storageError: true });
  assert.equal((await post(payload())).status, 503);
  assert.equal(calls.emails.length + calls.sessions.length, 0);
});
test('Stripe failure returns an error and never claims payment', async () => {
  const { post, calls } = await handler({ stripeError: true });
  assert.equal((await post(payload())).status, 500);
  assert.equal(calls.inserts[0][0].payment_status, 'pending');
});
test('customer content is escaped in email HTML', async () => {
  const { post, calls } = await handler();
  await post(payload({ companyName: '<img src=x onerror=alert(1)>' }));
  assert.ok(!calls.emails[0].html.includes('<img'));
  assert.ok(calls.emails[0].html.includes('&lt;img'));
});
