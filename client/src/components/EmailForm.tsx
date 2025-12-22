import { useState } from "react";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, message }),
      });
      if (res.ok) {
        setSuccess(true);
        setEmail("");
        setName("");
        setMessage("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send email.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "32px auto", background: "#f4f8fb", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <h2 style={{ textAlign: "center", color: "#0033a0", marginBottom: 18 }}>Contact Us</h2>
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginBottom: 8 }}
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginBottom: 8 }}
        />
        <textarea
          placeholder="Your Message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          rows={4}
          style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />
      </div>
      <button type="submit" disabled={loading} style={{ width: "100%", background: "#0033a0", color: "#fff", border: "none", borderRadius: 6, padding: 12, fontWeight: "bold", fontSize: 16, cursor: loading ? "wait" : "pointer" }}>
        {loading ? "Sending..." : "Send Message"}
      </button>
      {success && <div style={{ color: "green", marginTop: 12, textAlign: "center" }}>Email sent successfully!</div>}
      {error && <div style={{ color: "#e60000", marginTop: 12, textAlign: "center" }}>{error}</div>}
    </form>
  );
}
