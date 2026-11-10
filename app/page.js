'use client';
import { useRef, useState } from 'react';
import { sharedFields, permitFields, supportedStates, stateFees, prepareOrder } from '../lib/order.mjs';
import { permitIntakeRule, extraPermitFields, launchStates, launchTypesFor } from '../lib/permit-requirements.mjs';
import { suggestedExpirationDate, applySuggestedExpiration } from '../lib/permit-duration.mjs';

const initialCustomer = Object.fromEntries(sharedFields.map(([key]) => [key, '']));
const zones = ['America/Chicago','America/New_York','America/Denver','America/Phoenix','America/Los_Angeles','America/Anchorage','Pacific/Honolulu'];
export default function Home() {
  const [customer,setCustomer] = useState(initialCustomer);
  const [items,setItems] = useState([]);
  const [state,setState] = useState('Arizona');
  const [permitType,setPermitType] = useState('Trip Permit');
  const [rush,setRush] = useState(false);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [received,setReceived] = useState(false);
  const [website,setWebsite] = useState('');
  const request = useRef({});
  async function submit(event) {
    event.preventDefault(); if (busy) return;
    let prepared;
    try { prepared = prepareOrder({...customer,orderItems:items,rush}); }
    catch(error) { setMessage(error.message); return; }
    const fingerprint = JSON.stringify(prepared);
    if (request.current.fingerprint !== fingerprint) request.current = { fingerprint, key: crypto.randomUUID() };
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/create-checkout-session',{ method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...customer,orderItems:items,rush,website,requestKey:request.current.key}) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to submit. Please try again.');
      setMessage(`Request received. Your reference is ${result.orderNumber}. We will review your details and email your quote before payment.`); setReceived(true);
    } catch(error) { setMessage(error.message); } finally { setBusy(false); }
  }
  function changeDetail(id,key,value){
    setItems(prior=>prior.map(item=>{
      if(item.id!==id)return item;
      const next={...item.details,[key]:value};
      return {...item,details:['Beginning Travel Date','Kansas Fuel Duration'].includes(key)?
        applySuggestedExpiration(item.state,item.permitType,item.details,next):next};
    }));
  }
  function field(key,label) {
    const optional = ['mcNumber','unitNumber','usdot'].includes(key);
    return <label key={key} htmlFor={key}>{label}{!optional && ' *'}
      {['irpStatus','iftaStatus'].includes(key) ? <select id={key} required value={customer[key]} onChange={e=>setCustomer({...customer,[key]:e.target.value})}><option value="">Select status</option><option>yes</option><option>no</option><option>unsure</option></select> :
      <input id={key} required={!optional} maxLength={key==='vin'?17:500} type={key==='email'?'email':key==='phoneNumber'?'tel':['registeredWeight','axles'].includes(key)?'number':'text'} min={key==='axles'?2:1} value={customer[key]} onChange={e=>setCustomer({...customer,[key]:e.target.value})} />}
    </label>;
  }
  return <main><style>{`
    *{box-sizing:border-box}body{margin:0;background:#07111e;color:#f8fafc;font-family:Arial,sans-serif}a{color:#f5cf68}header{border-bottom:1px solid #243349;padding:22px 6%;display:flex;gap:20px;align-items:center;justify-content:space-between}header strong{font-size:18px;max-width:300px}header a{text-decoration:none;font-weight:700}.wrap{max-width:1100px;margin:auto;padding:56px 24px}h1{font-size:clamp(38px,6vw,64px);line-height:1.08;letter-spacing:-2px;max-width:800px;margin:20px 0}h2{font-size:30px}h3{margin-top:0}p{color:#c2cedd;line-height:1.7}.eyebrow{color:#f5cf68;text-transform:uppercase;letter-spacing:2px;font-size:12px;font-weight:700}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:18px}.card{padding:26px;background:#101f31;border:1px solid #283b50;border-radius:18px;margin:20px 0}label{display:block;color:#d6e1ee;font-size:14px;font-weight:600}input,select,textarea{display:block;width:100%;margin-top:9px;padding:13px;border:1px solid #52677e;border-radius:8px;color:#fff;background:#081421;font:inherit}button,.button{display:inline-block;background:#f5cf68;color:#172333;border:0;border-radius:9px;padding:14px 20px;font:inherit;font-weight:700;cursor:pointer;text-decoration:none}button:disabled{opacity:.5;cursor:wait}.secondary{background:transparent;color:#e4edf6;border:1px solid #52677e}.note{font-size:13px;color:#aebed0}.notice{padding:22px;border:1px solid #f5cf68;border-radius:12px;line-height:1.7;margin:20px 0;overflow-wrap:anywhere}footer{border-top:1px solid #243349;padding:30px 24px;text-align:center;font-size:13px;color:#aebed0}input:focus,select:focus,button:focus{outline:2px solid #f5cf68;outline-offset:3px}
  `}</style>
    <header><strong>Moving Forward<br/>Permitting Services</strong><a href="#request">Request a permit →</a></header>
    <section className="wrap"><span className="eyebrow">Trip & fuel permit assistance</span><h1>Keep your next trip moving forward.</h1><p style={{maxWidth:700,fontSize:19}}>Permit support for owner-operators, dispatchers and small fleets. Tell us where you’re going. We’ll review what you need and send a clear quote before you pay.</p><a className="button" href="#request">Start a permit request</a>
      <div className="grid" style={{marginTop:30}}>{[['1. Request','Share your carrier, truck and travel details.'],['2. Review & pay','Receive a reviewed quote and secure Stripe payment link.'],['3. Receive your permits','We obtain your permits and email them after review.']].map(([title,text])=><div className="card" key={title}><h3>{title}</h3><p>{text}</p></div>)}</div>
      <p className="note">Trip and fuel permits only. Oversize/overweight permitting is not offered. Rush requests are subject to availability and state processing requirements.</p>
    </section>
    <section className="wrap" id="request" style={{paddingTop:0}}><h2>Build your permit request</h2><p>Initial service area: Arizona, Arkansas, Iowa, Kansas, and Maine, with permit types currently configured for fulfillment. One truck per request. Required fields are marked *. Additional documents may be needed after state review.</p>
      {message && <div className="notice" role="status" aria-live="polite">{message}</div>}
      {received ? <div className="card"><h3>We have your request.</h3><p>Save the reference above. Questions? Email <a href="mailto:movingforwardpermitting@gmail.com">movingforwardpermitting@gmail.com</a>.</p><button onClick={()=>{setReceived(false);setItems([]);setMessage('');request.current={};}}>Start another request</button></div> : <form onSubmit={submit}>
        <div className="card"><h3>Company, contact & truck</h3><div className="grid">{sharedFields.map(([key,label])=>field(key,label))}</div><p className="note">Do not enter Social Security numbers, card details or passwords. We’ll arrange a secure way to collect any additional required documents.</p></div>
        <div style={{display:'none'}} aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)} /></label></div>
        <div className="card"><h3>Choose your permits</h3><div className="grid"><label>State<select value={state} onChange={e=>{setState(e.target.value);setPermitType(launchTypesFor(e.target.value)[0]);}}>{launchStates.map(s=><option key={s}>{s}</option>)}</select></label><label>Permit type<select value={permitType} onChange={e=>setPermitType(e.target.value)}>{launchTypesFor(state).map(type=><option key={type}>{type}</option>)}</select></label></div><button type="button" style={{marginTop:20}} onClick={()=>{if(items.length<20)setItems([...items,{id:crypto.randomUUID(),state,permitType,details:{}}]);}}>Add permit request</button>
          {!items.length && <p>Add a permit to enter your travel details.</p>}
          {items.map((item,index)=>{
            const rule=permitIntakeRule(item.state,item.permitType);
            const suggestion=suggestedExpirationDate(item.state,item.permitType,item.details);
            return <div className="card" key={item.id} style={{background:'#081421'}}>
              <h3>{index+1}. {item.state} · {item.permitType}</h3>
              <p className="note">{Number.isFinite(stateFees[item.state]?.[item.permitType])?`Published state base fee: $${stateFees[item.state][item.permitType]}.`:'State fee will be confirmed during review.'} Your quote will include applicable provider charges and our service fee.</p>
              {rule.unsupported&&<div className="notice" role="alert">This permit type is not offered through our current {item.state} ordering process. Please remove this request or ask about an alternate method.</div>}
              <p className="note">{rule.note} {rule.url&&<a href={rule.url} target="_blank" rel="noopener noreferrer">State information</a>}</p>
              {rule.documentReminder&&<p className="note"><strong>Documents to prepare:</strong> {rule.documentReminder}</p>}
              {suggestion&&<p className="note">Suggested expiration date: <strong>{suggestion.date}</strong> ({suggestion.hours} hours). Actual validity depends on the issued permit.</p>}
              <div className="grid">{permitFields.map(name=>{
                const necessary=rule.required.includes(name);
                const label=name==='Effective Time'?'Start clock time (only if required)':name==='Time Zone'?'Time zone (when needed)':name==='Trip End Date'?'End / expiration date':name;
                return <label key={name} htmlFor={`${item.id}-${name}`}>{label}{necessary?' *':' (optional)'}
                {name==='Time Zone'?<select id={`${item.id}-${name}`} value={item.details[name]||''} onChange={e=>changeDetail(item.id,name,e.target.value)}>
                  <option value="">Not specified</option>{zones.map(zone=><option key={zone}>{zone}</option>)}
                </select>:<input id={`${item.id}-${name}`} required={necessary} type={name.includes('Date')?'date':name==='Effective Time'?'time':'text'}
                  maxLength={2000} value={item.details[name]||''} onChange={e=>changeDetail(item.id,name,e.target.value)}/>}
                </label>;
              })}
              {extraPermitFields(item.state,item.permitType).map(field=><label key={field.key} htmlFor={`${item.id}-${field.key}`}>{field.label}{field.required?' *':' (optional)'}
                {field.inputType==='select'?<select id={`${item.id}-${field.key}`} required={field.required} value={item.details[field.key]||''} onChange={e=>changeDetail(item.id,field.key,e.target.value)}>
                  <option value="">Select</option>{field.options.map(option=><option key={option}>{option}</option>)}
                </select>:<input id={`${item.id}-${field.key}`} required={field.required} type={field.inputType||'text'} min={field.inputType==='number'?1:undefined} value={item.details[field.key]||''} onChange={e=>changeDetail(item.id,field.key,e.target.value)}/>}
              </label>)}</div>
              <button className="secondary" style={{marginTop:18}} type="button" onClick={()=>setItems(items.filter(entry=>entry.id!==item.id))}>Remove request</button>
            </div>;
          })}
        </div>
        <div className="card"><h3>Processing preference</h3><label>Service level<select value={rush?'rush':'standard'} onChange={e=>setRush(e.target.value==='rush')}><option value="standard">Standard — $35 service fee per permit</option><option value="rush">Request rush — $50 service fee per permit</option></select></label><p>State and required provider fees are additional. For trip + fuel requests, your quote will explain whether the state issues one combination permit or separate permits and how service fees apply.</p><p className="note">We’ll confirm eligibility, dates, fees and availability before requesting payment. No permit is issued until processing is completed. Do not begin travel without the required valid permits.</p><button disabled={busy||!items.length} type="submit">{busy?'Submitting…':'Submit request for review'}</button><p className="note">By submitting, you authorize us to contact you about this request and use the information to prepare your permit order.</p></div>
      </form>}
    </section><footer>© {new Date().getFullYear()} Moving Forward Permitting Services · <a href="mailto:movingforwardpermitting@gmail.com">Email us</a></footer>
  </main>;
}
