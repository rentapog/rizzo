import React from "react";

export default function Pricing() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Pricing</h1>
      <p className="mb-4">Rent a premium subdomain for your marketing, affiliate, or lead generation needs. Choose a package that fits your goals. All plans are billed daily and can be upgraded or downgraded at any time.</p>
      <div className="grid gap-6">
        <div className="border rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Starter</h2>
          <p className="mb-2">$20/day</p>
          <ul className="list-disc ml-6 mb-2">
            <li>1 premium subdomain</li>
            <li>Daily billing</li>
            <li>Affiliate commission eligible</li>
          </ul>
        </div>
        <div className="border rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Pro</h2>
          <p className="mb-2">$99/day</p>
          <ul className="list-disc ml-6 mb-2">
            <li>Up to 5 subdomains</li>
            <li>Priority support</li>
            <li>Daily billing</li>
            <li>Affiliate commission eligible</li>
          </ul>
        </div>
        <div className="border rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Elite</h2>
          <p className="mb-2">$399/day</p>
          <ul className="list-disc ml-6 mb-2">
            <li>Unlimited subdomains</li>
            <li>Top-tier support</li>
            <li>Daily billing</li>
            <li>Affiliate commission eligible</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
