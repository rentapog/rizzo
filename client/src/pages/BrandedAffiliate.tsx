import { useRoute } from "wouter";
import { designThemes, DesignThemeName } from "@/components/DesignThemes";
import { useState, useEffect } from "react";
import { LogoGenerator } from "@/components/LogoGenerator";
import { Link } from "wouter";
import { BrandedFooter } from "@/components/BrandedFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { affiliateContent } from "@/data/affiliateContent";

const allThemes: DesignThemeName[] = [
  "minimal", "modern", "bold", "classic", "vibrant", "tropical", "sunset", "ocean",
  "midnight", "lavender", "gold", "forest", "cherry", "indigo", "coral", "mint",
  "plum", "slate", "lemon", "teal", "rose", "charcoal", "lime", "fuchsia", "sky",
  "amber", "violet"
] as const;

export default function BrandedAffiliate() {
  const [match, params] = useRoute("/affiliate/:slug");
  const [brandName, setBrandName] = useState("RentAPog");
  const [theme, setTheme] = useState<DesignThemeName>("modern");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [affiliateLink, setAffiliateLink] = useState("");

  useEffect(() => {
    if (match && params?.slug) {
      const slugLower = params.slug.toLowerCase();
      const validTheme = allThemes.find(t => t === slugLower) || "modern";
      setTheme(validTheme as DesignThemeName);
      const name = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
      setBrandName(name);
      setAffiliateLink(params.slug);
      
      const saved = localStorage.getItem(`theme-${params.slug}`);
      if (saved) setTheme(saved as DesignThemeName);
    }
  }, [match, params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email) {
      toast({ title: "Error", description: "Please enter your name and email" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: firstName, affiliateLink: affiliateLink || "rentapog" }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Send to Zapier
        const zapierUrl = "https://hooks.zapier.com/hooks/catch/25004565/uicqitu/";
        await fetch(zapierUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            name: firstName,
            affiliateUsername: data.affiliateLink || affiliateLink || "rentapog",
            referralCode: data.affiliateLink,
            timestamp: new Date().toISOString() 
          }),
        }).catch(() => {});

        setFirstName("");
        setEmail("");
        
        toast({
          title: "✓ Check your email!",
          description: "Your affiliate link has been sent to your inbox.",
        });
      } else {
        const data = await res.json();
        toast({
          title: "Signup failed",
          description: data.error || "Please try again.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const content = affiliateContent[theme] || affiliateContent.modern;
  const currentTheme = designThemes[theme];

  return (
    <div className={`w-full min-h-screen ${currentTheme.colors.bg}`}>
      {/* Header */}
      <header className={`${currentTheme.colors.header} border-b-4`}>
        <div className="container px-4 md:px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <LogoGenerator brandName={theme} style={currentTheme.logoStyle} compact={true} />
            <h1 className={`text-2xl font-bold ${currentTheme.colors.accent}`}>{theme.toUpperCase()}</h1>
          </div>
          <p className="text-sm opacity-75">Affiliate Income Program</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container px-4 md:px-6 py-16">
        <div className="max-w-3xl">
          <h2 className={`text-4xl font-bold mb-4 ${currentTheme.colors.accent}`}>
            {content.headline}
          </h2>
          <p className="text-xl opacity-80 mb-8">{content.subheading}</p>
          <p className="text-lg opacity-90 mb-12 leading-relaxed">
            {content.description}
          </p>

          {/* CTA Card */}
          <div className={`${currentTheme.colors.card} p-8 rounded-lg mb-12`}>
            <h3 className="text-2xl font-bold mb-4">Ready to Start Earning?</h3>
            <p className="opacity-90 mb-6">Join thousands of affiliates making daily income with RentAPog.</p>
            <Button 
              className={`w-full ${currentTheme.colors.button} text-white font-semibold py-3 h-12`}
              data-testid="button-signup"
              onClick={() => window.location.href = `https://sales.rentapog.com/register?aff=${theme}`}
            >
              Create Your Account Now
            </Button>
            <p className="text-xs opacity-75 mt-4 text-center">Takes 2 minutes. Start earning same day.</p>
          </div>

          {/* Detailed Info Section */}
          <div className="space-y-6">
            <div className={`${currentTheme.colors.card} p-6 rounded-lg`}>
              <h4 className="text-xl font-bold mb-3">💰 How You Earn</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>✓ <strong>1st sale:</strong> 100% commission - Keep it all</li>
                <li>✓ <strong>2nd sale:</strong> Goes to platform (keeps us running)</li>
                <li>✓ <strong>3rd+ sales:</strong> 100% commission forever</li>
                <li>✓ Daily Stripe deposits automatically</li>
                <li>✓ No caps, no limits - Scale as high as you want</li>
              </ul>
            </div>

            <div className={`${currentTheme.colors.card} p-6 rounded-lg`}>
              <h4 className="text-xl font-bold mb-3">🎯 Your Marketing Tools</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>✓ 25 pre-built branded landing pages</li>
                <li>✓ All pages auto-capture emails & send your link</li>
                <li>✓ Your custom domain forwarding</li>
                <li>✓ AI marketing mentor (Coey) - free advice 24/7</li>
                <li>✓ Complete marketing guides for every platform</li>
              </ul>
            </div>

            <div className={`${currentTheme.colors.card} p-6 rounded-lg`}>
              <h4 className="text-xl font-bold mb-3">📱 How to Promote</h4>
              <p className="text-sm opacity-90 mb-3">Share your link everywhere:</p>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• TikTok - Post short videos showing earnings</li>
                <li>• Instagram - Share in stories & bio link</li>
                <li>• Facebook - Target side hustlers & entrepreneurs</li>
                <li>• Google Ads - Cheap clicks on high-intent searches</li>
                <li>• Your own domain - Forward it to your affiliate link</li>
                <li>• Email - Send to your list or use our email builder</li>
              </ul>
            </div>

            <div className={`${currentTheme.colors.card} p-6 rounded-lg`}>
              <h4 className="text-xl font-bold mb-3">🚀 What's Included</h4>
              <p className="text-sm opacity-90 mb-3">Everything you need to succeed:</p>
              <ul className="space-y-2 text-sm opacity-90">
                <li>✓ Stripe Connect setup in 2 minutes</li>
                <li>✓ Your branded user dashboard</li>
                <li>✓ Real-time earnings tracking</li>
                <li>✓ Domain forwarding with Namecheap</li>
                <li>✓ Coey AI for marketing questions</li>
                <li>✓ Complete marketing guides (cheap clicks strategies)</li>
                <li>✓ Team collaboration features (coming soon)</li>
              </ul>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className={`${currentTheme.colors.card} p-6 rounded-lg`}>
              <h4 className="font-bold mb-3">💰 Daily Payouts</h4>
              <p className="opacity-75 text-sm">Get paid every single day to your Stripe account. No waiting, no delays.</p>
            </div>
            <div className={`${currentTheme.colors.card} p-6 rounded-lg`}>
              <h4 className="font-bold mb-3">🎯 Fair Commission</h4>
              <p className="opacity-75 text-sm">100% on 1st, 3rd, 4th+ sales. Only 2nd sale goes to support the platform.</p>
            </div>
            <div className={`${currentTheme.colors.card} p-6 rounded-lg`}>
              <h4 className="font-bold mb-3">📈 Unlimited Growth</h4>
              <p className="opacity-75 text-sm">No caps, no limits. Scale your earnings as high as you want.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <BrandedFooter theme={theme} brandName={brandName} slug={params?.slug} />
    </div>
  );
}
