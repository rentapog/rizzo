export default function AffiliateRedirect() {
  // This page should never actually render since the server redirects
  return (
    <div style={{ 
      width: "100%",
      height: "100vh",
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      background: "linear-gradient(135deg, #fef2f2 0%, #eff6ff 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: "#dc2626", fontSize: "48px", fontWeight: "bold", margin: "0 0 20px 0" }}>
          RentAPog
        </h1>
        <p style={{ color: "#666", fontSize: "20px", margin: "0", fontWeight: "500" }}>
          Redirecting to home...
        </p>
      </div>
    </div>
  );
}
