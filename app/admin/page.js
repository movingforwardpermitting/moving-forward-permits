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
    {
      title: "Trip Permits",
      desc: "Temporary operating permits for eligible interstate travel.",
    },
    {
      title: "Fuel Permits",
      desc: "Temporary fuel tax permit support for carriers and owner-operators.",
    },
    {
      title: "DOT & MC Filing",
      desc: "Administrative filing support for carrier setup and updates.",
    },
    {
      title: "BOC-3 Filing",
      desc: "Process agent filing support for motor carriers.",
    },
    {
      title: "UCR Registration",
      desc: "Annual registration assistance for motor carriers.",
    },
    {
      title: "Compliance Support",
      desc: "Organized support for common trucking paperwork needs.",
    },
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
  };

  const requirements = {
    Alabama: {
      "Trip Permit": ["Truck Plate Number", "Beginning Travel Date"],
      "Fuel Permit": ["IFTA Status", "Beginning Travel Date"],
      "Trip + Fuel Permit": ["Truck Plate Number", "IFTA Status", "Beginning Travel Date"],
    },
    Florida: {
      "Trip Permit": ["Truck Year/Make", "Beginning Travel Date"],
      "Fuel Permit": ["IFTA Status", "Beginning Travel Date"],
      "Trip + Fuel Permit": ["Truck Year/Make", "IFTA Status", "Beginning Travel Date"],
    },
    Kentucky: {
      "Trip Permit": ["Registered Weight", "Beginning Travel Date"],
      "Fuel Permit": ["IFTA Status", "Beginning Travel Date"],
      "Trip + Fuel Permit": ["Registered Weight", "IFTA Status", "Beginning Travel Date"],
    },
    Virginia: {
      "Trip Permit": ["Applicant Name", "Business Address", "FEIN or SSN", "Plate State", "Plate Expiration", "Year/Make/Model", "Unit Number"],
      "Fuel Permit": ["Carrier Name", "Business Address", "Make", "Unit Number", "Year", "License Number", "License State", "License Expiration"],
      "Trip + Fuel Permit": ["Carrier Name", "Business Address", "FEIN or SSN", "Make", "Unit Number", "Year", "License Number", "License State", "License Expiration"],
    },
  };

  const serviceFee = rush ? 50 : 35;
  const stateFeeTotal = orderItems.reduce((total, item) => total + (item.stateFee || 0), 0);
  const total = orderItems.length > 0 ? stateFeeTotal + serviceFee : 0;

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

  const handleCheckout = async () => {
    if (!sharedInfo.companyName) {
      alert("Please enter Company Name.");
      return;
    }

    if (orderItems.length === 0) {
      alert("Please add at least one permit to your order.");
      return;
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          total,
          companyName: sharedInfo.companyName,
          usdot: sharedInfo.usdot,
          mcNumber: sharedInfo.mcNumber,
          vin: sharedInfo.vin,
          plateNumber: sharedInfo.plateNumber,
          phoneNumber: sharedInfo.phoneNumber,
          permitType: orderItems[0]?.permitType,
          state: orderItems[0]?.state,
          rush,
          orderItems,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Stripe checkout failed.");
      }
    } catch (error) {
      alert("Checkout error: " + error.message);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "13px",
    marginTop: "7px",
    borderRadius: "14px",
    border: "1px solid #334155",
    background: "#020617",
    color: "white",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: "14px",
    color: "#cbd5e1",
    fontWeight: "600",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "white", fontFamily: "Arial, sans-serif" }}>
      <header style={{ borderBottom: "1px solid #1e293b", padding: "20px 24px", position: "sticky", top: 0, background: "rgba(2, 6, 23, 0.95)", zIndex: 10 }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div style={{ fontWeight: "800", fontSize: "20px", letterSpacing: ".3px" }}>
            Moving Forward Permitting Services
          </div>
          <a href="#order-section" style={{ background: "#facc15", color: "#111827", padding: "12px 18px", borderRadius: "999px", fontWeight: "800", textDecoration: "none" }}>
            Start Order
          </a>
        </div>
      </header>

      <section style={{ padding: "76px 24px 54px" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "34px", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", border: "1px solid rgba(250, 204, 21, .35)", color: "#fde68a", background: "rgba(250, 204, 21, .08)", padding: "9px 14px", borderRadius: "999px", fontSize: "14px", fontWeight: "700", marginBottom: "22px" }}>
              Trucking Permit & Compliance Support
            </div>

            <h1 style={{ fontSize: "clamp(40px, 6vw, 68px)", lineHeight: "1.02", margin: "0 0 24px", letterSpacing: "-1.5px" }}>
              Fast trucking permits without the paperwork headache.
            </h1>

            <p style={{ fontSize: "19px", lineHeight: "1.8", color: "#cbd5e1", maxWidth: "720px" }}>
              Fast, organized support for trip permits, fuel permits, filing assistance, and common motor carrier paperwork.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "30px" }}>
              <a href="#order-section" style={{ background: "#facc15", color: "#111827", padding: "15px 22px", borderRadius: "16px", fontWeight: "800", textDecoration: "none" }}>
                Start Permit Request
              </a>
              <a href="#services" style={{ border: "1px solid #475569", color: "white", padding: "15px 22px", borderRadius: "16px", fontWeight: "800", textDecoration: "none" }}>
                View Services
              </a>
            </div>

            <p style={{ marginTop: "18px", color: "#94a3b8", fontSize: "14px" }}>
              Oversize/overweight routing is not currently offered.
            </p>
          </div>

          <div style={{ background: "linear-gradient(145deg, #0f172a, #111827)", border: "1px solid #1e293b", borderRadius: "28px", padding: "30px", boxShadow: "0 25px 70px rgba(0,0,0,.35)" }}>
            <h2 style={{ marginTop: 0, fontSize: "26px" }}>What we’ll need</h2>
            <p style={{ color: "#cbd5e1", lineHeight: "1.7" }}>
              Start with your shared company and truck information, then add one or more permit requests by state.
            </p>
            {["Company and carrier details", "Truck VIN and plate information", "Permit type and state", "Beginning travel date", "Standard or rush processing"].map((item) => (
              <div key={item} style={{ background: "#020617", border: "1px solid #1e293b", padding: "15px", borderRadius: "18px", marginTop: "12px", color: "#e2e8f0" }}>
                ✓ {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" style={{ background: "rgba(15, 23, 42, .7)", padding: "60px 24px" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "36px", margin: "0 0 14px" }}>Services Offered</h2>
          <p style={{ color: "#cbd5e1", maxWidth: "680px", lineHeight: "1.7" }}>
            Practical administrative support for carriers who need paperwork handled quickly and clearly.
          </p>

          <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))", gap: "18px" }}>
            {services.map((service) => (
              <div key={service.title} style={{ background: "#020617", border: "1px solid #1e293b", padding: "24px", borderRadius: "24px" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "999px", background: "#facc15", color: "#111827", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", marginBottom: "18px" }}>
                  ✓
                </div>
                <h3 style={{ margin: "0 0 10px", fontSize: "21px" }}>{service.title}</h3>
                <p style={{ color: "#cbd5e1", lineHeight: "1.65", margin: 0 }}>{service.desc}</p>
                <button
                  onClick={() => {
                    setSelectedService(service.title);
                    document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{ marginTop: "18px", background: "#16a34a", color: "white", border: "none", padding: "12px 16px", borderRadius: "14px", cursor: "pointer", fontWeight: "800" }}
                >
                  Order Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="order-section" style={{ padding: "62px 24px" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "38px", marginBottom: "10px" }}>Build Your Permit Request</h2>
          <p style={{ color: "#cbd5e1", lineHeight: "1.7", maxWidth: "750px" }}>
            Add one or more permit requests. Shared company and truck information is collected once to reduce repeated typing.
          </p>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "28px", borderRadius: "28px", marginTop: "28px" }}>
            <h3 style={{ fontSize: "24px", marginTop: 0 }}>Shared Company & Truck Information</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {[
                ["companyName", "Company Name"],
                ["usdot", "USDOT Number"],
                ["mcNumber", "MC Number"],
                ["vin", "VIN"],
                ["plateNumber", "Truck Plate Number"],
                ["phoneNumber", "Phone Number"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    value={sharedInfo[key]}
                    onChange={(e) => setSharedInfo({ ...sharedInfo, [key]: e.target.value })}
                    placeholder={label}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "28px", borderRadius: "28px", marginTop: "22px" }}>
            <h3 style={{ fontSize: "24px", marginTop: 0 }}>Add Permit</h3>
            {selectedService && <p style={{ color: "#cbd5e1" }}>Selected service: <strong>{selectedService}</strong></p>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Permit Type</label>
                <select value={permitType} onChange={(e) => setPermitType(e.target.value)} style={inputStyle}>
                  <option>Trip Permit</option>
                  <option>Fuel Permit</option>
                  <option>Trip + Fuel Permit</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>State</label>
                <select value={state} onChange={(e) => setState(e.target.value)} style={inputStyle}>
                  {states.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Processing</label>
                <select value={rush ? "Rush" : "Standard"} onChange={(e) => setRush(e.target.value === "Rush")} style={inputStyle}>
                  <option>Standard</option>
                  <option>Rush</option>
                </select>
              </div>
            </div>

            <button onClick={addToOrder} style={{ marginTop: "20px", background: "#facc15", color: "#111827", border: "none", padding: "14px 20px", borderRadius: "16px", fontWeight: "900", cursor: "pointer" }}>
              Add to Order
            </button>
          </div>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "28px", borderRadius: "28px", marginTop: "22px" }}>
            <h3 style={{ fontSize: "24px", marginTop: 0 }}>Current Order</h3>

            {orderItems.length === 0 && (
              <div style={{ border: "1px dashed #475569", color: "#94a3b8", padding: "24px", borderRadius: "18px", textAlign: "center" }}>
                No permits added yet.
              </div>
            )}

            {orderItems.map((item, index) => (
              <div key={item.id} style={{ background: "#020617", border: "1px solid #1e293b", padding: "18px", borderRadius: "18px", marginTop: "14px", display: "grid", gridTemplateColumns: "1fr auto", gap: "14px", alignItems: "center" }}>
                <div>
                  <p style={{ margin: "0 0 6px", color: "#94a3b8" }}>Item #{index + 1}</p>
                  <strong>{item.permitType} — {item.state}</strong>
                  <p style={{ margin: "6px 0 0", color: "#cbd5e1" }}>
                    State Fee: {item.stateFee ? `$${item.stateFee}` : "Quote required"}
                  </p>
                </div>
                <button onClick={() => removeItem(item.id)} style={{ background: "transparent", color: "#f87171", border: "1px solid #f87171", padding: "10px 14px", borderRadius: "12px", cursor: "pointer" }}>
                  Remove
                </button>
              </div>
            ))}

            <div style={{ marginTop: "22px", background: "#facc15", color: "#111827", padding: "22px", borderRadius: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
              <div>
                <p style={{ margin: 0, fontWeight: "700" }}>State Fees</p>
                <h3 style={{ margin: "5px 0 0" }}>${stateFeeTotal}</h3>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: "700" }}>{rush ? "Rush Service Fee" : "Standard Service Fee"}</p>
                <h3 style={{ margin: "5px 0 0" }}>${orderItems.length > 0 ? serviceFee : 0}</h3>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: "700" }}>Estimated Total</p>
                <h3 style={{ margin: "5px 0 0" }}>${total}</h3>
              </div>
            </div>
          </div>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "28px", borderRadius: "28px", marginTop: "22px" }}>
            <h3 style={{ fontSize: "24px", marginTop: 0 }}>Required Information</h3>

            {orderItems.length === 0 && <p style={{ color: "#94a3b8" }}>Add a permit to see required state-specific information.</p>}

            {orderItems.map((item, index) => {
              const fields = requirements[item.state]?.[item.permitType] || [
                "Beginning Travel Date",
                "Additional Notes",
              ];

              return (
                <div key={item.id} style={{ marginTop: "18px", padding: "20px", background: "#020617", border: "1px solid #1e293b", borderRadius: "20px" }}>
                  <h4 style={{ marginTop: 0 }}>Request #{index + 1}: {item.state} {item.permitType}</h4>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                    {fields.map((field) => (
                      <div key={field}>
                        <label style={labelStyle}>{field}</label>
                        <input
                          type={field.includes("Travel Date") || field.includes("Beginning Travel Date") ? "date" : "text"}
                          placeholder={field}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleCheckout}
              style={{
                marginTop: "24px",
                background: "#16a34a",
                color: "white",
                border: "none",
                padding: "16px 24px",
                borderRadius: "16px",
                fontWeight: "900",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Checkout Securely
            </button>

            <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "14px" }}>
              State fees are shown separately from Moving Forward service fees. Final processing is subject to state verification.
            </p>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #1e293b", padding: "28px 24px", color: "#94a3b8", textAlign: "center" }}>
        © 2026 Moving Forward Permitting Services. Services are administrative support only.
      </footer>
    </main>
  );
}