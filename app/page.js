export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1b2b",
        color: "white",
        fontFamily: "Arial",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "54px",
            marginBottom: "20px",
          }}
        >
          Moving Forward Permitting Services
        </h1>

        <p
          style={{
            fontSize: "22px",
            lineHeight: "1.7",
            maxWidth: "800px",
            marginBottom: "40px",
          }}
        >
          Trucking permit processing and compliance support for owner-operators,
          dispatchers, and trucking companies.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {[
            "Trip Permits",
            "Fuel Permits",
            "DOT & MC Filing",
            "BOC-3 Filing",
            "UCR Registration",
            "Compliance Support",
          ].map((service) => (
            <div
              key={service}
              style={{
                background: "#14283d",
                padding: "25px",
                borderRadius: "18px",
              }}
            >
              <h3>{service}</h3>

              <button
                style={{
                  marginTop: "20px",
                  background: "#17c964",
                  color: "white",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Order Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}