"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAllowed, setIsAllowed] = useState(false);
  const [orders, setOrders] = useState([]);

  const correctPassword = "Iwillmakeit@21";

  useEffect(() => {
    if (!isAllowed) return;

    async function loadOrders() {
      const response = await fetch("/api/admin-orders");
      const data = await response.json();
      setOrders(data.orders || []);
    }

    loadOrders();
  }, [isAllowed]);

  if (!isAllowed) {
    return (
      <main style={{ minHeight: "100vh", background: "#020617", color: "white", padding: 40, fontFamily: "Arial" }}>
        <h1>Admin Login</h1>

        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 14, borderRadius: 10, width: 300, marginRight: 10 }}
        />

        <button
          onClick={() => {
            if (password === correctPassword) {
              setIsAllowed(true);
            } else {
              alert("Incorrect password");
            }
          }}
          style={{ padding: 14, borderRadius: 10, cursor: "pointer" }}
        >
          Login
        </button>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "white", padding: 40, fontFamily: "Arial" }}>
      <h1>Admin Dashboard</h1>
      <p>Permit orders submitted through Moving Forward Permitting Services.</p>

      <div style={{ marginTop: 30, display: "grid", gap: 16 }}>
        {orders.length === 0 && <p>No orders found yet.</p>}

        {orders.map((order) => (
          <div key={order.id} style={{ background: "#0f172a", border: "1px solid #1e293b", padding: 20, borderRadius: 14 }}>
            <h3>Order #{order.id}</h3>
            <p><strong>Company:</strong> {order.company_name || "Not provided"}</p>
            <p><strong>USDOT:</strong> {order.usdot || "Not provided"}</p>
            <p><strong>MC:</strong> {order.mc_number || "Not provided"}</p>
            <p><strong>Phone:</strong> {order.phone_number || "Not provided"}</p>
            <p><strong>Permit:</strong> {order.permit_type || "Not provided"} - {order.permit_state || "Not provided"}</p>
            <p><strong>Total:</strong> ${order.total}</p>
            <p><strong>Payment:</strong> {order.payment_status}</p>

            <div style={{ marginTop: 10 }}>
              <strong>Status:</strong>

              <select
                value={order.order_status || "pending_review"}
                onChange={async (e) => {
                  await fetch("/api/update-order-status", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      id: order.id,
                      status: e.target.value,
                    }),
                  });

                  window.location.reload();
                }}
                style={{ marginLeft: 10, padding: 8, borderRadius: 8 }}
              >
                <option value="pending_review">Pending Review</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="sent_to_customer">Sent To Customer</option>
              </select>
            </div>

            <p><strong>Created:</strong> {new Date(order.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </main>
  );
}