import { useLocation } from "wouter";
import { useState, useEffect } from "react";

const getApiBaseUrl = () => {
  // Always use Render backend for API calls
  return 'https://rizz-4zvv.onrender.com';
};

interface Package {
  id: number;
  price: number;
  title: string;
  description: string;
  features: string[];
}

const packages: Package[] = [
  {
    id: 1,
    price: 20,
    title: "Starter Digital Apartment",
    description: "Start FREE for 3 days! No payment until trial ends.",
    features: [
      "3-day FREE trial - no payment required",
      "After trial: $20 AUD/day auto-charged",
      "Cancel anytime during trial",
      "Daily payments go directly to your referrer",
      "Get your own digital address",
      "Access to the Rentapog back office",
    ],
  },
  {
    id: 2,
    price: 49,
    title: "Premium Digital Apartment",
    description: "Start FREE for 3 days! No payment until trial ends.",
    features: [
      "3-day FREE trial - no payment required",
      "After trial: $49 AUD/day auto-charged",
      "Cancel anytime during trial",
      "Daily payments go directly to your referrer",
      "All Starter features included",
      "Priority support",
    ],
  },
  {
    id: 3,
    price: 99,
    title: "Big Digital Apartment",
    description: "Start FREE for 3 days! No payment until trial ends.",
    features: [
      "3-day FREE trial - no payment required",
      "After trial: $99 AUD/day auto-charged",
      "Cancel anytime during trial",
      "Daily payments go directly to your referrer",
      "All Premium features included",
      "VIP support and bonuses",
    ],
  },
  {
    id: 4,
    price: 149,
    title: "Pro Digital Apartment",
    description: "Start FREE for 3 days! No payment until trial ends.",
    features: [
      "3-day FREE trial - no payment required",
      "After trial: $149 AUD/day auto-charged",
      "Cancel anytime during trial",
      "Daily payments go directly to your referrer",
      "All Big Apartment features included",
      "Pro earning tools",
    ],
  },
  {
    id: 5,
    price: 199,
    title: "Elite Digital Apartment",
    description: "Start FREE for 3 days! No payment until trial ends.",
    features: [
      "3-day FREE trial - no payment required",
      "After trial: $199 AUD/day auto-charged",
      "Cancel anytime during trial",
      "Daily payments go directly to your referrer",
      "All Pro features included",
      "Elite earning tools",
    ],
  },
  {
    id: 6,
    price: 249,
    title: "Platinum Digital Apartment",
    description: "Start FREE for 3 days! No payment until trial ends.",
    features: [
      "3-day FREE trial - no payment required",
      "After trial: $249 AUD/day auto-charged",
      "Cancel anytime during trial",
      "Daily payments go directly to your referrer",
      "All Elite features included",
      "Platinum earning tools",
    ],
  },
  {
    id: 7,
    price: 299,
    title: "Diamond Digital Apartment",
    description: "Start FREE for 3 days! No payment until trial ends.",
    features: [
      "3-day FREE trial - no payment required",
      "After trial: $299 AUD/day auto-charged",
      "Cancel anytime during trial",
      "Daily payments go directly to your referrer",
      "All Platinum features included",
      "Diamond earning tools",
    ],
  },
  {
    id: 8,
    price: 349,
    title: "Executive Digital Apartment",
    description: "Start FREE for 3 days! No payment until trial ends.",
    features: [
      "3-day FREE trial - no payment required",
      "After trial: $349 AUD/day auto-charged",
      "Cancel anytime during trial",
      "Daily payments go directly to your referrer",
      "All Diamond features included",
      "Executive earning tools",
    ],
  },
  {
    id: 9,
    price: 399,
    title: "Presidential Digital Apartment",
    description: "Start FREE for 3 days! No payment until trial ends.",
    features: [
      "3-day FREE trial - no payment required",
      "After trial: $399 AUD/day auto-charged",
      "Cancel anytime during trial",
      "Daily payments go directly to your referrer",
      "All Executive features included",
      "Presidential earning tools",
    ],
  },
  {
    id: 10,
    price: 449,
    title: "Royal Digital Apartment",
    description: "Start FREE for 3 days! No payment until trial ends.",
    features: [
      "3-day FREE trial - no payment required",
      "After trial: $449 AUD/day auto-charged",
      "Cancel anytime during trial",
      "Daily payments go directly to your referrer",
      "All Presidential features included",
      "Royal earning tools",
    ],
  },
  {
    id: 11,
    price: 499,
    title: "Legendary Digital Apartment",
    description: "Start FREE for 3 days! No payment until trial ends.",
    features: [
      "3-day FREE trial - no payment required",
      "After trial: $499 AUD/day auto-charged",
      "Cancel anytime during trial",
      "Daily payments go directly to your referrer",
      "All Royal features included",
      "Legendary earning tools",
    ],
  },
];

export default function Packages() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const urlAffiliateCode = params.get("aff");
  const [affiliateCode, setAffiliateCode] = useState<string>("rentapog");
  const [loadingPackageId, setLoadingPackageId] = useState<number | null>(null);

  useEffect(() => {
    const detectAffiliate = async () => {
      // Priority 1: Check URL parameter (standard ?aff=code format)
      if (urlAffiliateCode) {
        setAffiliateCode(urlAffiliateCode);
        return;
      }

      // Priority 1b: Check for path-based format (/packages/aff=code or /packages/%3Faff=code)
      const decodedLocation = decodeURIComponent(location);
      const pathMatch = decodedLocation.match(/\/packages\/(?:\?aff=|aff=)?([^/?&=]+)/);
      if (pathMatch && pathMatch[1]) {
        setAffiliateCode(pathMatch[1]);
        return;
      }

      // Priority 2: Check referrer for subdomain
      const referrer = document.referrer;
      if (referrer) {
        try {
          const referrerUrl = new URL(referrer);
          const referrerHost = referrerUrl.hostname;
          
          // Check if referrer is a rentapog subdomain (like coolname.rentapog.com)
          const subdomainMatch = referrerHost.match(/^([^.]+)\.rentapog\.com$/);
          if (subdomainMatch && subdomainMatch[1] !== "packages" && subdomainMatch[1] !== "www") {
            const subdomain = subdomainMatch[1];
            
            // Look up the affiliate by subdomain
            const response = await fetch(`${getApiBaseUrl()}/api/affiliate-by-subdomain/${subdomain}`);
            const data = await response.json();
            if (data.found && data.referralCode) {
              setAffiliateCode(data.referralCode);
              return;
            }
            // If no user found for subdomain, use subdomain as code
            setAffiliateCode(subdomain);
            return;
          }
        } catch (e) {
          console.log("Could not parse referrer");
        }
      }

      // Priority 3: Check localStorage for saved affiliate
      const savedAffiliate = localStorage.getItem("affiliateCode");
      if (savedAffiliate) {
        setAffiliateCode(savedAffiliate);
        return;
      }

      // Default to rentapog
      setAffiliateCode("rentapog");
    };

    detectAffiliate();
  }, [urlAffiliateCode, location]);

  // Save affiliate code to localStorage for persistence
  useEffect(() => {
    if (affiliateCode && affiliateCode !== "rentapog") {
      localStorage.setItem("affiliateCode", affiliateCode);
    }
  }, [affiliateCode]);

  const handleBuyPackage = async (pkg: Package) => {
    setLoadingPackageId(pkg.id);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/packages/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          affiliateCode,
        }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Unable to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingPackageId(null);
    }
  };

  return (
    <div style={{
      background: "#f4f6fa",
      fontFamily: "'Montserrat', Arial, sans-serif",
      margin: 0,
      padding: 0,
      minHeight: "100vh"
    }}>
      <div style={{
        maxWidth: "1100px",
        margin: "40px auto",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 32px rgba(0, 31, 91, 0.10)",
        padding: "40px 32px",
      }}>
        <h1 style={{
          textAlign: "center",
          color: "#0033a0",
          marginBottom: "32px",
          fontSize: "2.5em",
        }}>
          Choose Your Digital Property Package
        </h1>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "32px",
          marginBottom: "40px",
        }}>
          {packages.map((pkg, index) => (
            <div
              key={index}
              style={{
                background: "#f4f8fb",
                borderRadius: "12px",
                border: "2px solid #0033a0",
                padding: "32px 24px",
                width: "320px",
                boxSizing: "border-box",
                textAlign: "center",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(0, 51, 160, 0.10)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                fontSize: "2.2em",
                color: "#e60000",
                fontWeight: "bold",
                margin: "16px 0 8px 0",
              }}>
                ${pkg.price} AUD
              </div>
              <div style={{
                fontSize: "0.9em",
                color: "#666",
                marginBottom: "8px",
              }}>
                per day after 3-day FREE trial
              </div>
              <div style={{
                color: "#333",
                fontSize: "1.1em",
                marginBottom: "18px",
              }}>
                <b>{pkg.title}</b>
                <br />
                {pkg.description}
              </div>
              <ul style={{
                textAlign: "left",
                margin: "18px 0 0 0",
                paddingLeft: 0,
                listStyle: "none",
              }}>
                {pkg.features.map((feature, i) => (
                  <li
                    key={i}
                    style={{
                      marginBottom: "10px",
                      paddingLeft: "1.2em",
                      position: "relative",
                    }}
                  >
                    <span style={{
                      color: "#0033a0",
                      position: "absolute",
                      left: 0,
                    }}>
                      ✔
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleBuyPackage(pkg)}
                disabled={loadingPackageId === pkg.id}
                style={{
                  background: loadingPackageId === pkg.id ? "#6680c0" : "#0033a0",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "12px 28px",
                  fontSize: "1.1em",
                  fontWeight: "bold",
                  cursor: loadingPackageId === pkg.id ? "wait" : "pointer",
                  display: "inline-block",
                  marginTop: "10px",
                }}
              >
                {loadingPackageId === pkg.id ? "Loading..." : "Start FREE Trial"}
              </button>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: "40px",
          textAlign: "center",
          color: "#0033a0",
          fontSize: "1.15em",
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          <b>How It Works</b>
          <ul style={{
            textAlign: "left",
            display: "inline-block",
            margin: "18px auto 0 auto",
            paddingLeft: "1.2em",
          }}>
            <li><b>Step 1:</b> Sign up and start your 3-day FREE trial - no payment required!</li>
            <li><b>Step 2:</b> Explore all features, share your link, cancel anytime during trial</li>
            <li><b>Step 3:</b> After 3 days, daily payments begin automatically from your account</li>
            <li><b>Daily payments:</b> Charged to your account daily based on your package</li>
            <li><b>Earn money:</b> When you refer others, their daily payments come to YOU!</li>
          </ul>
        </div>

        <div style={{
          margin: "40px auto 0 auto",
          maxWidth: "700px",
          color: "#0033a0",
          fontSize: "1.08em",
          textAlign: "center",
          background: "#f0f4ff",
          border: "1.5px solid #0033a0",
          borderRadius: "10px",
          padding: "22px 18px 18px 18px",
        }}>
          <b>Risk-Free:</b> Try FREE for 3 days! Cancel anytime during your trial - no charges, no questions asked. After 3 days, daily billing starts automatically. Get referrals to offset your costs and start earning!
        </div>

        <div style={{
          marginTop: "60px",
          paddingTop: "20px",
          borderTop: "1px solid #ddd",
          textAlign: "center",
          color: "#666",
          fontSize: "0.95em",
        }}>
          <a href="/terms" style={{
            color: "#0033a0",
            textDecoration: "none",
            marginRight: "24px",
            fontWeight: "500",
          }}>
            Terms and Conditions
          </a>
          <a href="/privacy" style={{
            color: "#0033a0",
            textDecoration: "none",
            fontWeight: "500",
          }}>
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
