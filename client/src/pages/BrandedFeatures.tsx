import { useRoute } from "wouter";
import { designThemes, DesignThemeName } from "@/components/DesignThemes";
import { useState, useEffect } from "react";
import { LogoGenerator } from "@/components/LogoGenerator";
import { Zap, BarChart3, Users, Lock, TrendingUp, Clock } from "lucide-react";
import { BrandedFooter } from "@/components/BrandedFooter";

export default function BrandedFeatures() {
  const [match, params] = useRoute("/affiliate/:slug/features");
  const [brandName, setBrandName] = useState("RentAPog");
  const [theme, setTheme] = useState<DesignThemeName>("modern");

  useEffect(() => {
    if (match && params?.slug) {
      const name = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
      setBrandName(name);
      const saved = localStorage.getItem(`theme-${params.slug}`);
      if (saved) setTheme(saved as DesignThemeName);
    }
  }, [match, params]);

  const currentTheme = designThemes[theme];

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Daily Payouts",
      desc: "Get paid instantly to Stripe every single day your pogs are rented.",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Live Dashboard",
      desc: "Track earnings, referrals, and performance in real-time.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Affiliate Network",
      desc: "Build your network and earn from referrals with our fair system.",
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Secure Platform",
      desc: "Your data is protected with enterprise-grade security.",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Scalable Growth",
      desc: "No limits - scale your earnings as much as you want.",
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "24/7 Support",
      desc: "Get help anytime with our dedicated support team.",
    },
  ];

  return (
    <div className={`w-full min-h-screen ${currentTheme.colors.bg}`}>
      {/* Header */}
      <header className={`${currentTheme.colors.header} border-b-4`}>
        <div className="container px-4 md:px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <LogoGenerator brandName={brandName} style={currentTheme.logoStyle} />
            <h1 className={`text-2xl font-bold ${currentTheme.colors.accent}`}>{brandName}</h1>
          </div>
          <p className="text-sm opacity-75">Platform Features</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container px-4 md:px-6 py-12">
        <div className="mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${currentTheme.colors.accent}`}>Powerful Features Built for Success</h2>
          <p className="opacity-75">Everything you need to grow your affiliate business</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className={`${currentTheme.colors.card} p-8 rounded-lg`}>
              <div className={`${currentTheme.colors.accent} mb-4`}>{feature.icon}</div>
              <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
              <p className="opacity-75">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <BrandedFooter theme={theme} brandName={brandName} slug={params?.slug} />
    </div>
  );
}
