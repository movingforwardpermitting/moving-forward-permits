import { createClient } from "@supabase/supabase-js";

export default async function AdminPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: orders, error } = await supabase
    .from("permit_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <main style={{ padding: 40 }}>Error loading orders: {error.message}</main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0b1b2b", color: "white", padding: 40 }}>
      <h1>Admin Dashboard</h1>
      <p>Permit orders submitted through Moving Forward Permitting Services.</p>

      <div style={{ marginTop: 30, display: "grid", gap: 16 }}>
        {orders?.map((order) => (
          <div key={order.id} style={{ background: "#111827", padding: 20, borderRadius: 14 }}>
            <h3>Order #{order.id}</h3>
            <p><strong>Company:</strong> {order.company_name || "Not provided"}</p>
            <p><strong>Permit:</strong> {order.permit_type || "Not provided"} - {order.permit_state || "Not provided"}</p>
            <p><strong>Total:</strong> ${order.total}</p>
            <p><strong>Payment:</strong> {order.payment_status}</p>
            <p><strong>Status:</strong> {order.order_status}</p>
            <p><strong>Created:</strong> {new Date(order.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </main>
  );
}