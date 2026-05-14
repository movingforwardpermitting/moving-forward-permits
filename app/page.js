export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#020617",
      color: "white",
      padding: "40px",
      fontFamily: "Arial"
    }}>
      <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>
        Moving Forward Permitting Services
      </h1>

      <p style={{ fontSize: "20px", maxWidth: "700px", lineHeight: "1.7" }}>
        Trucking permit processing and compliance support for owner-operators,
        dispatchers, and trucking companies.
      </p>

      <div style={{
        marginTop: "40px",
        padding: "30px",
        borderRadius: "20px",
        background: "#111827"
      }}>
        <h2>Services</h2>

        <ul style={{ lineHeight: "2" }}>
          <li>Trip Permits</li>
          <li>Fuel Permits</li>
          <li>DOT & MC Filing Assistance</li>
          <li>Administrative Compliance Support</li>
        </ul>
      </div>
    </main>
  );
}