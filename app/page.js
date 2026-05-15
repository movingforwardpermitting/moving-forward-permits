"use client";

import { useState } from "react";

export default function Home() {
  const [selectedService, setSelectedService] = useState("");
  const [permitType, setPermitType] = useState("Trip Permit");
  const [state, setState] = useState("Alabama");
  const [rush, setRush] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
const [sharedInfo, setSharedInfo] = useState({
  companyName: "",
  usdot: "",
  mcNumber: "",
  vin: "",
  plateNumber: "",
  phoneNumber: "",
});
  const services = [
    "Trip Permits",
    "Fuel Permits",
    "DOT & MC Filing",
    "BOC-3 Filing",
    "UCR Registration",
    "Compliance Support",
  ];

  const states = [
    "Alabama",
    "Florida",
    "Georgia",
    "Kentucky",
    "Mississippi",
    "Missouri",
    "Tennessee",
    "Texas",
    "Virginia",
  ];

  const stateFees = {
    Alabama: { "Trip Permit": 20, "Fuel Permit": 20, "Trip + Fuel Permit": 40 },
    Florida: { "Trip Permit": 30, "Fuel Permit": 45, "Trip + Fuel Permit": 75 },
    Kentucky: { "Trip Permit": 40, "Fuel Permit": 40, "Trip + Fuel Permit": 80 },
    Missouri: { "Trip Permit": 10, "Fuel Permit": 10, "Trip + Fuel Permit": 20 },
    Tennessee: { "Trip Permit": 30, "Fuel Permit": 30, "Trip + Fuel Permit": 60 },
    Virginia: { "Trip Permit": 15, "Fuel Permit": 20, "Trip + Fuel Permit": 35 },
  };const requirements = {
  Alabama: {
    "Trip Permit": ["Company Name", "USDOT Number", "VIN", "Truck Plate Number", " Beginning Travel Date"],
    "Fuel Permit": ["Company Name", "USDOT Number", "VIN", "IFTA Status", "Beginning Travel Date"],
    "Trip + Fuel Permit": ["Company Name", "USDOT Number", "VIN", "Truck Plate Number", "IFTA Status", "Beginning Travel Date"],
  },
  Florida: {
    "Trip Permit": ["Company Name", "USDOT Number", "VIN", "Truck Year/Make", "Beginning Travel Date"],
    "Fuel Permit": ["Company Name", "USDOT Number", "VIN", "IFTA Status", "Beginning Travel Date"],
    "Trip + Fuel Permit": ["Company Name", "USDOT Number", "VIN", "Truck Year/Make", "IFTA Status", "Beginning Travel Date"],
  },
  Kentucky: {
    "Trip Permit": ["Company Name", "USDOT Number", "VIN", "Plate Number", "Registered Weight", "Beginning Travel Date"],
    "Fuel Permit": ["Company Name", "USDOT Number", "VIN", "IFTA Status", "Beginning Travel Date"],
    "Trip + Fuel Permit": ["Company Name", "USDOT Number", "VIN", "Plate Number", "Registered Weight", "IFTA Status", "Beginning Travel Date"],
  },
  Virginia: {
    "Trip Permit": ["Applicant Name", "Business Address", "Phone Number", "FEIN or SSN", "License Plate Number", "Plate State", "Plate Expiration", "Year/Make/Model", "VIN", "Unit Number"],
    "Fuel Permit": ["Carrier Name", "Business Address", "Phone Number", "VIN", "Make", "Unit Number", "Year", "License Number", "License State", "License Expiration"],
    "Trip + Fuel Permit": ["Carrier Name", "Business Address", "Phone Number", "FEIN or SSN", "VIN", "Make", "Unit Number", "Year", "License Number", "License State", "License Expiration"],
  },
};

  const serviceFee = rush ? 50 : 35;

  const addToOrder = () => {
    const fee = stateFees[state]?.[permitType] ?? null;

    setOrderItems([
      ...orderItems,
      {
        id: Date.now(),
        permitType,
        state,
        stateFee: fee,
      },
    ]);
  };

  const removeItem = (id) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const stateFeeTotal = orderItems.reduce((total, item) => {
    return total + (item.stateFee || 0);
  }, 0);

  const total = orderItems.length > 0 ? stateFeeTotal + serviceFee : 0;

  return (
    <main style={{ minHeight: "100vh", background: "#0b1b2b", color: "white", fontFamily: "Arial" }}>
      <section style={{ padding: "50px 24px", maxWidth: "1150px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "48px", marginBottom: "18px" }}>
          Moving Forward Permitting Services
        </h1>

        <p style={{ fontSize: "20px", lineHeight: "1.6", maxWidth: "760px" }}>
          Trucking permit processing and compliance support for owner-operators,
          dispatchers, and trucking companies.
        </p>

        <div style={{ marginTop: "35px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          {services.map((service) => (
            <div key={service} style={{ background: "#14283d", padding: "24px", borderRadius: "18px" }}>
              <h3>{service}</h3>
              <button
                onClick={() => {
                  setSelectedService(service);
                  document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{ marginTop: "18px", background: "#17c964", color: "white", border: "none", padding: "12px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}
              >
                Order Now
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="order-section" style={{ padding: "40px 24px", maxWidth: "1150px", margin: "0 auto" }}>
        <div style={{ background: "#111827", padding: "30px", borderRadius: "22px" }}>
          <h2>Shared Company & Truck Information</h2>

<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "28px" }}>
  {[
    ["companyName", "Company Name"],
    ["usdot", "USDOT Number"],
    ["mcNumber", "MC Number"],
    ["vin", "VIN"],
    ["plateNumber", "Truck Plate Number"],
    ["phoneNumber", "Phone Number"],
  ].map(([key, label]) => (
    <div key={key}>
      <label>{label}</label>
      <input
        value={sharedInfo[key]}
        onChange={(e) =>
          setSharedInfo({ ...sharedInfo, [key]: e.target.value })
        }
        placeholder={label}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "6px",
          borderRadius: "10px",
          border: "none",
        }}
      />
    </div>
  ))}
</div>
          <h2>Start Your Order</h2>
          {selectedService && <p>You selected: <strong>{selectedService}</strong></p>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginTop: "25px" }}>
            <div>
              <label>Permit Type</label>
              <select value={permitType} onChange={(e) => setPermitType(e.target.value)} style={{ width: "100%", padding: "14px", marginTop: "8px", borderRadius: "10px" }}>
                <option>Trip Permit</option>
                <option>Fuel Permit</option>
                <option>Trip + Fuel Permit</option>
              </select>
            </div>

            <div>
              <label>State</label>
              <select value={state} onChange={(e) => setState(e.target.value)} style={{ width: "100%", padding: "14px", marginTop: "8px", borderRadius: "10px" }}>
                {states.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label>Processing</label>
              <select value={rush ? "Rush" : "Standard"} onChange={(e) => setRush(e.target.value === "Rush")} style={{ width: "100%", padding: "14px", marginTop: "8px", borderRadius: "10px" }}>
                <option>Standard</option>
                <option>Rush</option>
              </select>
            </div>
          </div>

          <button onClick={addToOrder} style={{ marginTop: "24px", background: "#facc15", color: "#111827", border: "none", padding: "14px 22px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>
            Add to Order
          </button>
        </div>

        <div style={{ marginTop: "30px", background: "#111827", padding: "30px", borderRadius: "22px" }}>
          <h2>Current Order</h2>

          {orderItems.length === 0 && <p>No items added yet.</p>}

          {orderItems.map((item, index) => (
            <div key={item.id} style={{ background: "#0b1b2b", padding: "18px", borderRadius: "14px", marginTop: "14px" }}>
              <p><strong>Item #{index + 1}</strong></p>
              <p>{item.permitType} — {item.state}</p>
              <p>State Fee: {item.stateFee ? `$${item.stateFee}` : "Quote required"}</p>
              <button onClick={() => removeItem(item.id)} style={{ background: "transparent", color: "#f87171", border: "1px solid #f87171", padding: "8px 12px", borderRadius: "8px" }}>
                Remove
              </button>
            </div>
          ))}

          <div style={{ marginTop: "25px", background: "#facc15", color: "#111827", padding: "22px", borderRadius: "16px" }}>
            <p>State Fees: ${stateFeeTotal}</p>
            <p>Service Fee: ${orderItems.length > 0 ? serviceFee : 0}</p>
            <h3>Total: ${total}</h3>
          </div>
          <div style={{ marginTop: "30px", background: "#0b1b2b", padding: "24px", borderRadius: "16px" }}>
  <h2>Required Information</h2>

  {orderItems.length === 0 && <p>Add a permit to see required information.</p>}

  {orderItems.map((item, index) => {
    const fields = requirements[item.state]?.[item.permitType] || [
      "Company Name",
      "USDOT Number",
      "VIN",
      "Beginning Travel Date",
      "Additional Notes",
    ];

    return (
      <div key={item.id} style={{ marginTop: "20px", padding: "18px", background: "#111827", borderRadius: "14px" }}>
        <h3>Request #{index + 1}: {item.state} {item.permitType}</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginTop: "15px" }}>
          {fields.map((field) => (
            <div key={field}>
              <label>{field}</label>
<input
  type={
    field.includes("Travel Date") ||
    field.includes("Beginning Travel Date")
      ? "date"
      : "text"
  }
defaultValue={
  field.includes("Company")
    ? sharedInfo.companyName
    : field.includes("USDOT")
    ? sharedInfo.usdot
    : field.includes("MC")
    ? sharedInfo.mcNumber
    : field.includes("VIN")
    ? sharedInfo.vin
    : field.includes("Plate")
    ? sharedInfo.plateNumber
    : field.includes("Phone")
    ? sharedInfo.phoneNumber
    : ""
}
  placeholder={
    field.includes("Travel Date") ||
    field.includes("Beginning Travel Date")
      ? "Beginning Travel Date"
      : field
  }
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    borderRadius: "10px",
    border: "none",
  }}
/>

            </div>
          ))}
        </div>
      </div>
    );
  })}
</div>
<button
  onClick={async () => {
    alert("Checkout button clicked");
    let response;

try {
  response = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      total,
    }),
  });
} catch (err) {
  alert("FETCH ERROR: " + err.message);
  return;
}
      

    const data = await response.json();

if (data.url) {
  window.location.href = data.url;
} else {
  alert(data.error || "Stripe checkout failed.");
}
  }}
  style={{
    marginTop: "24px",
    background: "#17c964",
    color: "white",
    border: "none",
    padding: "14px 22px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  Checkout Securely
</button>

          
        </div>
      </section>
    </main>
  );
}