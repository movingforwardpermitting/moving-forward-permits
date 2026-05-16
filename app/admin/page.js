"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAllowed, setIsAllowed] = useState(false);
  const [orders, setOrders] = useState([]);

  const correctPassword = "ChangeThisPassword123";

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
      <main style={{ minHeight: "100vh", background: "#0b1b2b", color: "white", padding: 40 }}>
        <h1>Admin Login</h1>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 14, borderRadius: 10, width: "300px" }}
        />
        <button
          onClick={() => {
            if (password === correctPassword) setIsAllowed(true);
            else alert("Incorrect password");
          }}
          style={{ marginLeft: 10, padding: 14, borderRadius: 10 }}
        >
          Login
        </button>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0b1b2b", color: "white", padding: 40 }}>
      <h1>Admin Dashboard</h1>

      <div style={{ marginTop: 30, display: "grid", gap: 16 }}>
        {orders.map((order) => (
          <div key={order.id} style={{ background: "#111827", padding: 20, borderRadius: 14 }}>
            <h3>Order #{order.id}</h3>
            <p><strong>Company:</strong> {order.company_name || "Not provided"}</p>
            <p><strong>Permit:</strong> {order.permit_type || "Not provided"} - {order.permit_state || "Not provided"}</p>
            <p><strong>Total:</strong> ${order.total}</p>
            <p><strong>Payment:</strong> {order.payment_status}</p>
            <div style={{ marginTop: 10 }}>
  <strong>Status:</strong>

  <select
    value={order.order_status || "pending_review"}
    onChange={async (e) => {
      const newStatus = e.target.value;

      await fetch("/api/update-order-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: order.id,
          status: newStatus,
        }),
      });

      window.location.reload();
    }}
    style={{
      marginLeft: 10,
      padding: 8,
      borderRadius: 8,
    }}
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