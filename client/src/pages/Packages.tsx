import EmailForm from "../components/EmailForm";

const packageData = [
  {
    price: 29,
    title: "Starter Digital Apartment",
    desc: "Perfect for new earners. Includes your first 3 referrals guarantee.",
    features: [
      "Get your own digital address",
      "First 3 referrals guaranteed in 24 hours",
      "Step-by-step training guides",
      "Access to the Rentapog back office",
      "Daily earnings and fast payouts",
    ],
  },
  {
    price: 49,
    title: "Premium Digital Apartment",
    desc: "Level up your earnings. Includes your first 3 referrals guarantee.",
    features: [
      "All Starter features",
      "Rent a bigger digital property",
      "Advanced earning strategies",
      "Priority support",
      "Daily earnings and fast payouts",
    ],
  },
  {
    price: 99,
    title: "Big Digital Apartment",
    desc: "Maximize your potential. Includes your first 3 referrals guarantee.",
    features: [
      "All Premium features",
      "Rent the biggest digital property",
      "Exclusive earning tools",
      "VIP support and bonuses",
      "Daily earnings and fast payouts",
    ],
  },
  {
    price: 149,
    title: "Pro Digital Apartment",
    desc: "For serious earners. You must know 3 people who want to join under you, because payments will come out of your account every day. Get your first 3 referrals to pay their way!",
    features: [
      "All Big Digital Apartment features",
      "Pro earning tools",
      "VIP support and bonuses",
      "Daily earnings and fast payouts",
    ],
  },
  {
    price: 199,
    title: "Elite Digital Apartment",
    desc: "You must know 3 people who want to join under you, because payments will come out of your account every day. Get your first 3 referrals to pay their way!",
    features: [
      "All Pro features",
      "Elite earning tools",
      "VIP support and bonuses",
      "Daily earnings and fast payouts",
    ],
  },
  {
    price: 249,
    title: "Platinum Digital Apartment",
    desc: "You must know 3 people who want to join under you, because payments will come out of your account every day. Get your first 3 referrals to pay their way!",
    features: [
      "All Elite features",
      "Platinum earning tools",
      "VIP support and bonuses",
      "Daily earnings and fast payouts",
    ],
  },
  {
    price: 299,
    title: "Diamond Digital Apartment",
    desc: "You must know 3 people who want to join under you, because payments will come out of your account every day. Get your first 3 referrals to pay their way!",
    features: [
      "All Platinum features",
      "Diamond earning tools",
      "VIP support and bonuses",
      "Daily earnings and fast payouts",
    ],
  },
  {
    price: 349,
    title: "Executive Digital Apartment",
    desc: "You must know 3 people who want to join under you, because payments will come out of your account every day. Get your first 3 referrals to pay their way!",
    features: [
      "All Diamond features",
      "Executive earning tools",
      "VIP support and bonuses",
      "Daily earnings and fast payouts",
    ],
  },
  {
    price: 399,
    title: "Presidential Digital Apartment",
    desc: "You must know 3 people who want to join under you, because payments will come out of your account every day. Get your first 3 referrals to pay their way!",
    features: [
      "All Executive features",
      "Presidential earning tools",
      "VIP support and bonuses",
      "Daily earnings and fast payouts",
    ],
  },
  {
    price: 449,
    title: "Royal Digital Apartment",
    desc: "You must know 3 people who want to join under you, because payments will come out of your account every day. Get your first 3 referrals to pay their way!",
    features: [
      "All Presidential features",
      "Royal earning tools",
      "VIP support and bonuses",
      "Daily earnings and fast payouts",
    ],
  },
  {
    price: 499,
    title: "Legendary Digital Apartment",
    desc: "You must know 3 people who want to join under you, because payments will come out of your account every day. Get your first 3 referrals to pay their way!",
    features: [
      "All Royal features",
      "Legendary earning tools",
      "VIP support and bonuses",
      "Daily earnings and fast payouts",
    ],
  },
];

export default function Packages() {
  const [loadingIndex, setLoadingIndex] = React.useState(-1);
  const [error, setError] = React.useState("");

  const handleBuy = async (pkg, i) => {
    setLoadingIndex(i);
    setError("");
    try {
      // Optionally prompt for email or use logged-in user
      // const email = window.prompt("Enter your email to continue:");
      // if (!email) { setLoadingIndex(-1); return; }
      const resp = await fetch("/api/payments/square/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: pkg.price, packageTitle: pkg.title }),
      });
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create payment link.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoadingIndex(-1);
    }
  };

  return (
    <div style={{
      background: '#f4f6fa',
      fontFamily: "'Montserrat', Arial, sans-serif",
      margin: 0,
      padding: 0,
      minHeight: '100vh',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '40px auto',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 32px rgba(0, 31, 91, 0.10)',
        padding: '40px 32px',
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#0033a0',
          marginBottom: '32px',
          fontSize: '2.5em',
        }}>
          Choose Your Digital Property Package
        </h1>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '32px',
          marginBottom: '40px',
        }}>
          {packageData.map((pkg, i) => (
            <div
              key={i}
              style={{
                background: '#f4f8fb',
                borderRadius: '12px',
                border: '2px solid #0033a0',
                padding: '32px 24px',
                width: '320px',
                boxSizing: 'border-box',
                textAlign: 'center',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 51, 160, 0.10)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                fontSize: '2.2em',
                color: '#e60000',
                fontWeight: 'bold',
                margin: '16px 0 8px 0',
              }}>
                ${pkg.price}
              </div>
              <div style={{
                color: '#333',
                fontSize: '1.1em',
                marginBottom: '18px',
              }}>
                <b>{pkg.title}</b><br />{pkg.desc}
              </div>
              <ul style={{
                textAlign: 'left',
                margin: '18px 0 0 0',
                paddingLeft: 0,
                listStyle: 'none',
              }}>
                {pkg.features.map((feature, j) => (
                  <li key={j} style={{ marginBottom: '10px', paddingLeft: '1.2em', position: 'relative' }}>
                    <span style={{ color: '#0033a0', position: 'absolute', left: 0 }}>✔</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className="buy-btn"
                style={{
                  background: '#0033a0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 28px',
                  fontSize: '1.1em',
                  fontWeight: 'bold',
                  cursor: loadingIndex === i ? 'wait' : 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginTop: '10px',
                  opacity: loadingIndex === i ? 0.6 : 1,
                }}
                onClick={() => handleBuy(pkg, i)}
                disabled={loadingIndex === i}
              >
                {loadingIndex === i ? 'Redirecting...' : `Buy $${pkg.price} Package`}
              </button>
              {error && loadingIndex === i && (
                <div style={{ color: '#e60000', marginTop: 8, fontSize: '0.95em' }}>{error}</div>
              )}
            </div>
          ))}
        </div>
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          color: '#0033a0',
          fontSize: '1.15em',
          maxWidth: '700px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <b>Why pay for a Rentapog package?</b><br />
          <ul style={{ textAlign: 'left', display: 'inline-block', margin: '18px auto 0 auto', paddingLeft: '1.2em' }}>
            <li>We guarantee your first 3 referrals or your money back—no risk!</li>
            <li>Unlock daily earnings and build your digital real estate empire</li>
            <li>Get exclusive access to our back office, training, and support</li>
            <li>Join a community of motivated earners and property owners</li>
            <li>Every package and donation helps us create more opportunities for you and others</li>
          </ul>
        </div>
        <div style={{
          margin: '40px auto 0 auto',
          maxWidth: '700px',
          color: '#e60000',
          fontSize: '1.08em',
          textAlign: 'center',
          background: '#fff4f4',
          border: '1.5px solid #e60000',
          borderRadius: '10px',
          padding: '22px 18px 18px 18px',
        }}>
          <b>Note:</b> The 3 referral guarantee system does <u>not</u> apply when you set your own rental price for others to join under you. But you can still advertise your own rental price however you like!
        </div>

        {/* Contact/Resend Email Form */}
        <EmailForm />
      </div>
    </div>
  );
}
