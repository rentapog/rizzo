import { useEffect, useState } from "react";

interface Upgrade {
  id: string;
  name: string;
  packagePrice: number;
  timestamp: Date;
}

const firstNames = [
  "Alex", "Jamie", "Priya", "Chris", "Maria", "Samir", "Jessica", "Tyler", "Olivia", "Marcus",
  "Emily", "David", "Fatima", "Ben", "Sophia", "Leo", "Hannah", "Mateo", "Chloe", "Lucas",
  "Ava", "Noah", "Mia", "Ethan", "Liam", "Zara", "Isabella", "Jack", "Layla", "Owen",
  "Ella", "Mason", "Ruby", "Jacob", "Lily", "Elijah", "Grace", "Carter", "Sofia", "Logan"
];

const lastNames = [
  "Carter", "Lee", "Patel", "Johnson", "Gomez", "Khan", "Smith", "Nguyen", "Brown", "Silva",
  "Chen", "Kim", "Zahra", "Thompson", "Rossi", "Dubois", "Müller", "Garcia", "Wilson", "Evans",
  "Clark", "Turner", "Baker", "Walker", "Young", "King", "Scott", "Green", "Adams", "Hill",
  "Lewis", "Moore", "Wright", "Bennett", "Cruz", "Reed", "Bailey", "Rivera", "Cooper", "Ward"
];

const packages = [29, 49, 99, 149, 199, 249, 299, 349, 399, 449, 499];

export default function LiveUpgradeFeed() {
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);

  useEffect(() => {
    const mockUpgrades: Upgrade[] = Array.from({ length: 8 }, (_, i) => ({
      id: `mock-${i}`,
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      packagePrice: packages[Math.floor(Math.random() * packages.length)],
      timestamp: new Date(Date.now() - Math.random() * 3600000),
    }));
    setUpgrades(mockUpgrades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));

    const interval = setInterval(() => {
      const newUpgrade: Upgrade = {
        id: `upgrade-${Date.now()}`,
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        packagePrice: packages[Math.floor(Math.random() * packages.length)],
        timestamp: new Date(),
      };
      setUpgrades(prev => [newUpgrade, ...prev.slice(0, 7)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: "linear-gradient(90deg, #0033a0 0%, #0052cc 100%)",
      borderRadius: "8px",
      padding: "16px",
      overflow: "hidden",
      position: "relative",
      width: "100%",
    }}>
      <div style={{
        display: "flex",
        gap: "40px",
        animation: "marquee 30s linear infinite",
        whiteSpace: "nowrap",
      }}>
        {upgrades.map((upgrade, idx) => (
          <div key={`marquee-${upgrade.id}`} style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}>
            <span style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: "1.1em",
            }}>
              ✨ {upgrade.name}
            </span>
            <span style={{
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "0.9em",
            }}>
              ${upgrade.packagePrice}
            </span>
          </div>
        ))}
        {upgrades.map((upgrade, idx) => (
          <div key={`marquee-dup-${upgrade.id}`} style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}>
            <span style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: "1.1em",
            }}>
              ✨ {upgrade.name}
            </span>
            <span style={{
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "0.9em",
            }}>
              ${upgrade.packagePrice}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
