'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { sharedFields, permitFields, supportedStates } from '../../../lib/order.mjs';
let client;
const auth = () => client ||= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {auth:{persistSession:false,autoRefreshToken:true}});
const emptyCustomer = Object.fromEntries(sharedFields.map(([key])=>[key,'']));
const newItem = () => ({id:crypto.randomUUID(),state:'Arkansas',permitType:'Trip Permit',details:Object.fromEntries(permitFields.map(f=>[f,f==='Time Zone'?'America/Chicago':'']))});
const format = d => d ? new Date(d).toLocaleString() : '';
function normalize(order) {
  return {
    customer:{...emptyCustomer,...Object.fromEntries(Object.entries(order.customer_details||{}).filter(([key])=>key in emptyCustomer))},
    items:(order.order_items||[]).map(item=>({...item,id:crypto.randomUUID(),details:{...Object.fromEntries(permitFields.map(f=>[f,''])),...item.details}})),
    rush:order.processing_type==='Rush',
    paymentPreference:order.customer_details?.paymentPreference==='phone_card'?'phone_card':'payment_link'
  };
}
export default function PhoneOrder() {
  const [session,setSession]=useState(null),[email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [order,setOrder]=useState(null),[form,setForm]=useState(null),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
  const [ready,setReady]=useState(false);
  const inflight=useRef(false), lastSaved=useRef(''), current=useRef(null);
  const id=typeof window==='undefined'?'':new URLSearchParams(window.location.search).get('order');
  const api=useCallback(async (body=null,query='')=>{
    const {data}=await auth().auth.getSession();
    if (!data.session) throw new Error('Sign in to save orders.');
    const response=await fetch('/api/admin-phone-order'+query,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+data.session.access_token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
    const result=await response.json();if(!response.ok)throw new Error(result.error||'Save failed');return result;
  },[]);
  useEffect(()=>{const {data}=auth().auth.onAuthStateChange((_event,s)=>setSession(s));return()=>data.subscription.unsubscribe()},[]);
  useEffect(()=>{
    if(!session || !id || order) return;
    api(null,'?orderNumber='+encodeURIComponent(id)).then(result=>{
      setOrder(result.order);const normalized=normalize(result.order);setForm(normalized);lastSaved.current=JSON.stringify(normalized);setReady(true);
    }).catch(e=>setStatus('Could not load saved order: '+e.message));
  },[session,id,order,api]);
  async function create() {
    setBusy(true);setStatus('');
    try {
      const result=await api({action:'create'});
      window.location.href='/admin/phone?order='+encodeURIComponent(result.order.order_number);
    } catch(e) {setStatus(e.message);setBusy(false);}
  }
  const save=useCallback(async (draft,finalize=false)=>{
    if(!order || inflight.current) return;
    inflight.current=true;setStatus(finalize?'Validating order…':'Saving…');
    const snapshot=JSON.stringify(draft);
    try {
      const {order:updated}=await api({action:finalize?'finalize':'save',orderNumber:order.order_number,version:order.updated_at,customer:draft.customer,items:draft.items,rush:draft.rush,paymentPreference:draft.paymentPreference});
      lastSaved.current=snapshot;current.current=updated;setOrder(updated);
      setStatus(finalize?'Order submitted for review. Open it in the Admin Center.':'Saved at '+format(updated.updated_at));
      if(finalize) setReady(false);
    } catch(e) {setStatus('Not saved: '+e.message);}
    finally {inflight.current=false;}
  },[order,api]);
  useEffect(()=>{
    if(!ready || !order || !form || order.order_status!=='draft' || JSON.stringify(form)===lastSaved.current) return;
    const timer=setTimeout(()=>{if(!inflight.current) save(form)},1500);
    return ()=>clearTimeout(timer);
  },[form,order,ready,save]);
  const update=(key,value)=>setForm(f=>({...f,customer:{...f.customer,[key]:value}}));
  const updateItem=(idx,patch)=>setForm(f=>({...f,items:f.items.map((item,i)=>i===idx?{...item,...patch}:item)}));
  const updateDetail=(idx,key,value)=>setForm(f=>({...f,items:f.items.map((item,i)=>i===idx?{...item,details:{...item.details,[key]:value}}:item)}));
  return <main><style>{`*{box-sizing:border-box}body{background:#07111e;color:white;font-family:Arial,sans-serif;margin:0}main{max-width:1050px;margin:auto;padding:28px 18px}a{color:#f5cf68}h1{margin-bottom:8px}p{color:#b9c9db;line-height:1.5}.card{padding:20px;background:#102034;border:1px solid #33465e;border-radius:12px;margin:16px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}label{display:block;font-size:13px;color:#d5e3f1}input,select,textarea{width:100%;background:#081421;border:1px solid #52677e;color:white;border-radius:7px;padding:11px;margin-top:6px;font:inherit}button{background:#f5cf68;border:0;border-radius:8px;padding:12px 15px;margin:5px;color:#102131;font-weight:bold;cursor:pointer}button:disabled{opacity:.55}.muted{font-size:13px;color:#a8bbcc}.notice{padding:12px;border:1px solid #697b88;border-radius:8px;margin:12px 0}`}</style>
    <a href="/admin">← Admin Center</a><h1>New Phone Order</h1>
    <p>Every call gets an order reference. Drafts save to your private database and can be reopened using this page's link. Never type credit card numbers here.</p>
    {status&&<div role="status" className="notice">{status}</div>}
    {!session?<form className="card" onSubmit={async e=>{e.preventDefault();setBusy(true);const {error}=await auth().auth.signInWithPassword({email,password});setBusy(false);if(error)setStatus('Unable to sign in.');setPassword('')}}><h2>Admin sign in</h2><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label><button disabled={busy}>Sign in</button></form>
    : !id?<div className="card"><h2>Start a phone order</h2><p>Select this before collecting carrier details. The first click saves an empty order and creates a permanent reference number.</p><button disabled={busy} onClick={create}>Create Saved Phone Order</button></div>
    : !form?<p>Loading saved phone order…</p>:
    <><div className="card"><strong>Order reference: {order.order_number}</strong><p>Order status: {order.order_status} · Created {format(order.created_at)}</p><p className="muted">Save status: {status||'All changes saved'}</p><button type="button" onClick={()=>navigator.clipboard?.writeText(window.location.href)}>Copy reopen link</button></div>
    <div className="card"><h2>1. Carrier and truck details</h2><div className="grid">{sharedFields.map(([key,label])=><label key={key}>{label}<input value={form.customer[key]||''} onChange={e=>update(key,e.target.value)} disabled={!ready}/></label>)}</div></div>
    <div className="card"><h2>2. Permit requests</h2>{form.items.map((item,i)=><div className="card" key={item.id}><h3>Permit {i+1}</h3><div className="grid"><label>State<select disabled={!ready} value={item.state} onChange={e=>updateItem(i,{state:e.target.value})}>{supportedStates.map(s=><option key={s}>{s}</option>)}</select></label><label>Type<select disabled={!ready} value={item.permitType} onChange={e=>updateItem(i,{permitType:e.target.value})}>{['Trip Permit','Fuel Permit','Trip + Fuel Permit'].map(s=><option key={s}>{s}</option>)}</select></label></div><div className="grid">{permitFields.map(key=><label key={key}>{key}<input disabled={!ready} value={item.details[key]||''} placeholder={key==='Beginning Travel Date'||key==='Trip End Date'?'YYYY-MM-DD':key==='Effective Time'?'HH:MM (24 hour)':''} onChange={e=>updateDetail(i,key,e.target.value)}/></label>)}</div><button disabled={!ready} onClick={()=>setForm(f=>({...f,items:f.items.filter((_,j)=>j!==i)}))}>Remove permit</button></div>)}<button disabled={!ready||form.items.length>=20} onClick={()=>setForm(f=>({...f,items:[...f.items,newItem()]}))}>Add Permit</button></div>
    <div className="card"><h2>3. Service and payment preference</h2><label>Processing<select disabled={!ready} value={form.rush?'Rush':'Standard'} onChange={e=>setForm(f=>({...f,rush:e.target.value==='Rush'}))}><option>Standard</option><option>Rush</option></select></label><label>How does the caller prefer to pay?<select disabled={!ready} value={form.paymentPreference} onChange={e=>setForm(f=>({...f,paymentPreference:e.target.value}))}><option value="payment_link">Email a secure Stripe payment link</option><option value="phone_card">Take card over the phone in Stripe Dashboard</option></select></label>{form.paymentPreference==='phone_card'&&<p className="notice">Use Stripe Dashboard's secure manual card-entry payment option, if enabled for your Stripe account. Never enter card numbers, CVV, or expiration dates into this site, its notes, or an email. Phone card payment verification must be completed before ordering permits.</p>}</div>
    <div className="card"><h2>4. Save and finish</h2><p>Drafts are saved automatically after editing. For an additional checkpoint, select Save Draft and confirm the saved timestamp appears. Complete required fields before submitting for review.</p><button disabled={!ready||inflight.current} onClick={()=>save(form)}>Save Draft</button><button disabled={!ready||inflight.current} onClick={()=>save(form,true)}>Submit for Quote Review</button>{order.order_status!=='draft'&&<a href="/admin">Review the order in Admin Center</a>}</div></>}
  </main>;
}
