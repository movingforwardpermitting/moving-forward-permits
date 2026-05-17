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
      desc: "Temporary operating permits for interstate travel.",
    },
    {
      title: "Fuel Permits",
      desc: "Temporary fuel permit support for carriers.",
    },
    {
      title: "DOT & MC Filing",
      desc: "Administrative filing support for carriers.",
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
    Alabama: {
      "Trip Permit": 20,
      "Fuel Permit": 20,
      "Trip + Fuel Permit": 40,
    },
    Florida: {
      "Trip Permit": 30,
      "Fuel Permit": 45,
      "Trip + Fuel Permit": 75,
    },
    Kentucky: {
      "Trip Permit": 40,
      "Fuel Permit": 40,
      "Trip + Fuel Permit": 80,
    },
  };

  const serviceFee = rush ? 50 : 35;

  const stateFeeTotal = orderItems.reduce(
    (total, item) => total + (item.stateFee || 0),
    0
  );

  const total =
    orderItems.length > 0 ? stateFeeTotal + serviceFee : 0;

  const addToOrder = () => {
    const fee = stateFees[state]?.[permitType] ?? 0;

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
      alert("Please add at least one permit.");
      return;
    }

    try {
      const response = await fetch(
        "/api/create-checkout-session",
        {
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
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout failed.");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px",
    marginTop: "8px",
    borderRadius: "12px",
    border: "1px solid #334155",
    background: "#020617",
    color: "white",
    boxSizing: "border-box",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "50px",
          }}
        >
          <h1
            style={{
              fontSize: "58px",
              marginBottom: "20px",
            }}
          >
            Fast trucking permits without the paperwork headache.
          </h1>

          <p
            style={{
              color: "#cbd5e1",
              fontSize: "20px",
              lineHeight: "1.8",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            Moving Forward Permitting Services helps
            carriers handle permit requests quickly and
            professionally.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {services.map((service) => (
            <div
              key={service.title}
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                padding: "24px",
                borderRadius: "24px",
              }}
            >
              <h3>{service.title}</h3>

              <p
                style={{
                  color: "#cbd5e1",
                  lineHeight: "1.7",
                }}
              >
                {service.desc}
              </p>

              <button
                onClick={() =>
                  setSelectedService(service.title)
                }
                style={{
                  marginTop: "16px",
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Order Now
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "40px",
            background: "#0f172a",
            padding: "30px",
            borderRadius: "24px",
            border: "1px solid #1e293b",
          }}
        >
          <h2>Shared Company & Truck Information</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
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
                    setSharedInfo({
                      ...sharedInfo,
                      [key]: e.target.value,
                    })
                  }
                  placeholder={label}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: "30px",
            background: "#0f172a",
            padding: "30px",
            borderRadius: "24px",
            border: "1px solid #1e293b",
          }}
        >
          <h2>Add Permit</h2>

          {selectedService && (
            <p style={{ color: "#cbd5e1" }}>
              Selected Service:
              <strong> {selectedService}</strong>
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            <div>
              <label>Permit Type</label>

              <select
                value={permitType}
                onChange={(e) =>
                  setPermitType(e.target.value)
                }
                style={inputStyle}
              >
                <option>Trip Permit</option>
                <option>Fuel Permit</option>
                <option>Trip + Fuel Permit</option>
              </select>
            </div>

            <div>
              <label>State</label>

              <select
                value={state}
                onChange={(e) =>
                  setState(e.target.value)
                }
                style={inputStyle}
              >
                {states.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Processing</label>

              <select
                value={rush ? "Rush" : "Standard"}
                onChange={(e) =>
                  setRush(e.target.value === "Rush")
                }
                style={inputStyle}
              >
                <option>Standard</option>
                <option>Rush</option>
              </select>
            </div>
          </div>

          <button
            onClick={addToOrder}
            style={{
              marginTop: "20px",
              background: "#facc15",
              color: "#111827",
              border: "none",
              padding: "14px 20px",
              borderRadius: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Add to Order
          </button>
        </div>

        <div
          style={{
            marginTop: "30px",
            background: "#0f172a",
            padding: "30px",
            borderRadius: "24px",
            border: "1px solid #1e293b",
          }}
        >
          <h2>Current Order</h2>

          {orderItems.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#020617",
                border: "1px solid #1e293b",
                padding: "18px",
                borderRadius: "18px",
                marginTop: "16px",
              }}
            >
              <strong>
                {item.permitType} - {item.state}
              </strong>

              <p style={{ color: "#cbd5e1" }}>
                State Fee: ${item.stateFee}
              </p>

              <button
                onClick={() => removeItem(item.id)}
                style={{
                  background: "transparent",
                  color: "#f87171",
                  border: "1px solid #f87171",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}

          <div
            style={{
              marginTop: "24px",
              background: "#facc15",
              color: "#111827",
              padding: "20px",
              borderRadius: "20px",
            }}
          >
            <h2>Total: ${total}</h2>
          </div>

          <button
            onClick={handleCheckout}
            style={{
              marginTop: "24px",
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "16px 24px",
              borderRadius: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Checkout Securely
          </button>
        </div>
      </div>
    </main>
  );
}