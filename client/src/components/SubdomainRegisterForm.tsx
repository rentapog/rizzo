import { useState } from "react";

export default function SubdomainRegisterForm({ affiliateCode }) {
  const [subdomain, setSubdomain] = useState("");
  const [status, setStatus] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    setLink("");
    try {
      const res = await fetch("/api/subdomain/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain, affiliateCode }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("Subdomain registered!");
        setLink(data.subdomain);
      } else {
        setStatus(data.error || "Failed to register subdomain.");
      }
    } catch (err) {
      setStatus("Error: " + err.message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Register Your Subdomain</h2>
      <label className="block mb-2">Choose your subdomain:</label>
      <div className="flex mb-4">
        <input
          type="text"
          value={subdomain}
          onChange={e => setSubdomain(e.target.value)}
          placeholder="yourname"
          className="border p-2 rounded-l w-full"
          required
        />
        <span className="bg-gray-100 border border-l-0 p-2 rounded-r">.rentapog.com</span>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "Registering..." : "Register Subdomain"}
      </button>
      {status && <div className="mt-4 text-green-700">{status}</div>}
      {link && (
        <div className="mt-2">
          <strong>Your subdomain:</strong> <a href={`https://${link}`} target="_blank" rel="noopener noreferrer">https://{link}</a>
        </div>
      )}
    </form>
  );
}
