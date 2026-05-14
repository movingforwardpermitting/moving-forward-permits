"use client";

import { useState } from "react";

export default function Home() {
  const [selectedPermit, setSelectedPermit] = useState("Trip Permit");
  const [selectedState, setSelectedState] = useState("Alabama");
  const [isRushOrder, setIsRushOrder] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [message, setMessage] = useState("");
  const [customer, setCustomer] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
  });

  const states = [
    "Alabama", "Arkansas", "Florida", "Georgia", "Kentucky", "Louisiana",
    "Mississippi", "Missouri", "New Mexico", "North Carolina", "Oklahoma",
    "South Carolina", "Tennessee", "Texas", "Virginia",
  ];

  const permitTypes = ["Trip Permit", "Fuel Permit", "Trip + Fuel Permit"];

  const pricing = {
    Alabama: { trip: 20, fuel: 20, both: 40, note: "State fees shown separately from Moving Forward service fees." },
    Arkansas: { trip: 33, fuel: null, both: null, note: "Verify before processing." },
    Florida: { trip: 30, fuel: 45, both: 75, note: "State fees shown separately from service fees." },
    Georgia: { trip: null, fuel: null, both: null, note: "Quote required. Pricing needs confirmation." },
    Kentucky: { trip: 40, fuel: 40, both: 80, note: "KYU may be separate." },
    Louisiana: { trip: 50, fuel: null, both: null, note: "Fuel may require confirmation." },
    Mississippi: { trip: 25, fuel: null, both: null, note: "Fuel may require confirmation." },
    Missouri: { trip: 10, fuel: 10, both: 20, note: "State fees shown separately from service fees." },
    "New Mexico": { trip: null, fuel: null, both: null, note: "Quote required. Weight distance requirements may apply." },
    "North Carolina": { trip: null, fuel: null, both: null, note: "Quote required. Pricing varies by permit type." },
    Oklahoma: { trip: 25, fuel: 50, both: 75, note: "State fees shown separately from service fees." },
    "South Carolina": { trip: 15, fuel: 15, both: 30, note: "Verify final state fees." },
    Tennessee: { trip: 30, fuel: 30, both: 60, note: "State and service fees shown separately." },
    Texas: { trip: null, fuel: 50, both: null, note: "Trip registration permit may differ by use case." },
    Virginia: { trip: 15, fuel: 20, both: 35, note: "State fees shown separately from service fees." },
  };

  const getPermitKey = (permit) => {
    if (permit === "Trip Permit") return "trip";
    if (permit === "Fuel Permit") return "fuel";
    return "both";
  };

  const getPermitCost = (item) => {
    const key = getPermitKey(item.permit);
    return pricing[item.state]?.[key] || null;
  };

  const serviceFee = orderItems.length > 0 ? (isRushOrder ? 50 : 35) : 0;
  const stateFeeTotal = orderItems.reduce((sum, item) => {
    const cost = getPermitCost(item);
    return cost ? sum + cost : sum;
  }, 0);
  const hasQuoteRequired = orderItems.some((item) => !getPermitCost(item));
  const estimatedTotal = stateFeeTotal + serviceFee;

  const addOrderItem = () => {
    setOrderItems([...orderItems, { id: Date.now(), permit: selectedPermit, state: selectedState }]);
  };

  const removeOrderItem = (id) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const updateOrderItem = (id, field, value) => {
    setOrderItems(orderItems.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const submitOrder = async () => {
    setMessage("Creating checkout session...");
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        orderItems,
        isRushOrder,
        stateFeeTotal,
        serviceFee,
        estimatedTotal,
        hasQuoteRequired,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Something went wrong.");
      return;
    }

    window.location.href = data.url;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-6 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="text-lg font-bold tracking-wide md:text-xl">Moving Forward Permitting Services</div>
          <a href="#permit-request" className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950">Start Request</a>
        </div>
      </header>

      <main>
        <section className="px-6 py-20 md:px-12 lg:px-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 inline-block rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">Trucking Permit & Compliance Support</p>
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">Keep your truck moving without the paperwork headache.</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">We help owner-operators, dispatchers, and small trucking companies with trip permits, fuel permits, DOT/MC filing support, and common compliance paperwork.</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href="#permit-request" className="rounded-2xl bg-amber-400 px-7 py-4 text-center font-semibold text-slate-950">Start a Request</a>
                <a href="#services" className="rounded-2xl border border-slate-600 px-7 py-4 text-center font-semibold text-white">View Services</a>
              </div>
              <p className="mt-5 text-sm text-slate-400">Oversize/overweight routing is not currently offered.</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
              <h2 className="text-2xl font-bold">What We’ll Need</h2>
              <p className="mt-3 text-slate-300">A simple intake process helps us review your request quickly.</p>
              <div className="mt-6 space-y-3">
                {["Permit type", "DOT/MC number", "Truck and VIN information", "State needed", "Travel date", "Best contact info"].map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-950 p-4 text-slate-200">✓ {item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="bg-slate-900/60 px-6 py-16 md:px-12 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold md:text-4xl">Services Offered</h2>
            <p className="mt-4 max-w-2xl text-slate-300">Simple administrative support for common trucking paperwork and temporary permit needs.</p>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {["Temporary Trip Permits", "Temporary Fuel Permits", "Trip + Fuel Permit Bundle", "DOT / MC Filing Support", "KYU & Weight Distance Support", "Renewal Reminder Support"].map((service) => (
                <div key={service} className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-xl font-bold text-slate-950">✓</div>
                  <h3 className="text-xl font-semibold">{service}</h3>
                  <p className="mt-3 leading-7 text-slate-300">Fast, organized support with clear communication and upfront next steps.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="permit-request" className="px-6 py-16 md:px-12 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold md:text-4xl">Build Your Permit Request</h2>
            <p className="mt-4 max-w-3xl text-slate-300">Add one or more permit requests to your order. Each line can include a different state and permit type.</p>

            <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-2xl font-bold">Add a permit to your order</h3>

              <div className="mt-5 rounded-2xl bg-slate-950 p-5">
                <p className="font-semibold">Processing Speed</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button onClick={() => setIsRushOrder(false)} className={`rounded-2xl p-4 text-left font-semibold ${!isRushOrder ? "bg-amber-400 text-slate-950" : "bg-slate-900 text-white"}`}>Standard Processing — $35 Service Fee</button>
                  <button onClick={() => setIsRushOrder(true)} className={`rounded-2xl p-4 text-left font-semibold ${isRushOrder ? "bg-amber-400 text-slate-950" : "bg-slate-900 text-white"}`}>Rush Processing — $50 Service Fee</button>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">Permit Type</label>
                  <select value={selectedPermit} onChange={(e) => setSelectedPermit(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-white">
                    {permitTypes.map((permit) => <option key={permit} value={permit}>{permit}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">State</label>
                  <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-white">
                    {states.map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={addOrderItem} className="w-full rounded-2xl bg-amber-400 px-7 py-4 font-semibold text-slate-950">Add to Order</button>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-2xl font-bold">Current Order</h3>
              <div className="mt-6 space-y-4">
                {orderItems.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-slate-400">No permits added yet.</div>
                )}
                {orderItems.map((item, index) => {
                  const permitCost = getPermitCost(item);
                  return (
                    <div key={item.id} className="grid gap-4 rounded-2xl bg-slate-950 p-5 lg:grid-cols-5 lg:items-center">
                      <div><p className="text-sm text-slate-400">Item</p><p className="font-semibold">#{index + 1}</p></div>
                      <div>
                        <p className="mb-2 text-sm text-slate-400">Permit</p>
                        <select value={item.permit} onChange={(e) => updateOrderItem(item.id, "permit", e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white">
                          {permitTypes.map((permit) => <option key={permit} value={permit}>{permit}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="mb-2 text-sm text-slate-400">State</p>
                        <select value={item.state} onChange={(e) => updateOrderItem(item.id, "state", e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white">
                          {states.map((state) => <option key={state} value={state}>{state}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Estimated State Fee</p>
                        <p className="text-lg font-bold">{permitCost ? `$${permitCost.toFixed(2)}` : "Quote required"}</p>
                      </div>
                      <div className="lg:text-right">
                        <button onClick={() => removeOrderItem(item.id)} className="rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800">Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-2xl bg-amber-400 p-6 text-slate-950">
                <p className="text-sm font-semibold uppercase tracking-wide">Estimated Order Summary</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div><p className="text-sm font-semibold">Estimated State Fees</p><p className="text-2xl font-bold">${stateFeeTotal.toFixed(2)}</p></div>
                  <div><p className="text-sm font-semibold">{isRushOrder ? "Rush Service Fee" : "Standard Service Fee"}</p><p className="text-2xl font-bold">${serviceFee.toFixed(2)}</p></div>
                  <div><p className="text-sm font-semibold">Estimated Total</p><p className="text-2xl font-bold">{hasQuoteRequired ? "Quote required" : `$${estimatedTotal.toFixed(2)}`}</p></div>
                </div>
              </div>

              <button onClick={() => setShowIntakeForm(true)} className="mt-6 inline-block rounded-2xl bg-white px-7 py-4 text-center font-semibold text-slate-950">Continue to Request Form</button>
            </div>

            {showIntakeForm && (
              <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-2xl font-bold">Customer Information</h3>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {[
                    ["companyName", "Company Name"],
                    ["contactName", "Contact Name"],
                    ["phone", "Phone Number"],
                    ["email", "Email Address"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="mb-2 block text-sm font-semibold text-slate-300">{label}</label>
                      <input value={customer[key]} onChange={(e) => setCustomer({ ...customer, [key]: e.target.value })} className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-white" />
                    </div>
                  ))}
                </div>

                <h3 className="mt-8 text-2xl font-bold">Permit Details</h3>
                <p className="mt-2 text-slate-400">Add DOT/MC, VIN, plate, dates, and notes for now. File uploads will be connected in the next build phase.</p>
                <textarea className="mt-5 min-h-40 w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-white" placeholder="Enter DOT number, MC number, VIN, plate number, travel dates, truck details, and any other notes..." />

                <button onClick={submitOrder} className="mt-6 rounded-2xl bg-amber-400 px-7 py-4 font-semibold text-slate-950">Pay & Submit Request</button>
                {message && <p className="mt-4 rounded-2xl bg-slate-950 p-4 text-slate-300">{message}</p>}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="px-6 py-8 text-center text-sm text-slate-500">
        <p>© 2026 Moving Forward Permitting Services. All rights reserved.</p>
        <p className="mt-2">Disclaimer: Services are administrative support only. Oversize/overweight routing is not currently offered.</p>
      </footer>
    </div>
  );
}
