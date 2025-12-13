import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Globe, DollarSign, Zap, Users, ArrowRight, CheckCircle, Star } from "lucide-react";

interface BrandData {
  id: number;
  brandName: string;
  brandSlug: string;
  customDomain?: string;
  affiliateCode: string;
  ownerEmail: string;
  status: string;
}

interface BrandedFranchiseProps {
  brandSlug?: string;
  customDomain?: string;
}

export default function BrandedFranchise({ brandSlug, customDomain }: BrandedFranchiseProps) {
  const [brand, setBrand] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        // Try custom domain first, then fall back to slug
        let res;
        if (customDomain) {
          res = await fetch(`/api/branding/domain/${encodeURIComponent(customDomain)}`);
        } else if (brandSlug) {
          res = await fetch(`/api/branding/site/${brandSlug}`);
        } else {
          setLoading(false);
          return;
        }
        
        if (res.ok) {
          const data = await res.json();
          setBrand(data.brand);
        }
      } catch (err) {
        console.error("Failed to fetch brand:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, [brandSlug, customDomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email) {
      toast({ title: "Please enter your name and email", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          name: firstName, 
          affiliateLink: brand?.affiliateCode || "rentapog" 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        await fetch("https://hooks.zapier.com/hooks/catch/25004565/uicqitu/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            name: firstName,
            affiliateUsername: brand?.affiliateCode || "rentapog",
            referralCode: data.affiliateLink,
            brandedSite: brand?.brandName,
            timestamp: new Date().toISOString() 
          }),
        }).catch(() => {});

        setFirstName("");
        setEmail("");
        
        toast({
          title: "Check your email!",
          description: "Your affiliate link has been sent to your inbox.",
        });
      } else {
        const data = await res.json();
        toast({
          title: "Signup failed",
          description: data.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!brand || brand.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Brand Not Found</h1>
          <p className="text-slate-300">This branded site is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
      <header className="border-b border-white/10 bg-black/20">
        <div className="container px-4 md:px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">{brand.brandName}</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 md:px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-600/30 px-4 py-2 rounded-full text-indigo-200 text-sm mb-6">
              <Star className="h-4 w-4" />
              Premium Domain Rental Platform
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Rent Premium Domains.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Earn Daily.
              </span>
            </h2>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
              Access high-value domains for your business or earn money by referring others. 
              No upfront costs. Start earning today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/10" data-testid="feature-domains">
              <Globe className="h-10 w-10 text-indigo-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Premium Domains</h3>
              <p className="text-indigo-200 text-sm">
                Access domains worth $20-$199/day. Perfect for campaigns, launches, or testing.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/10" data-testid="feature-earnings">
              <DollarSign className="h-10 w-10 text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Instant Earnings</h3>
              <p className="text-indigo-200 text-sm">
                Earn commissions on every referral. Get paid directly to your account.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/10" data-testid="feature-affiliate">
              <Users className="h-10 w-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Build Your Team</h3>
              <p className="text-indigo-200 text-sm">
                Refer others and earn from their success. Our pass-up system rewards builders.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/10 mb-12" data-testid="signup-form">
            <div className="text-center mb-6">
              <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Get Your FREE Affiliate Link</h3>
              <p className="text-indigo-200">Enter your details and start earning in minutes</p>
            </div>
            
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <Input
                placeholder="Your First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 h-12"
                data-testid="input-first-name"
              />
              <Input
                type="email"
                placeholder="Your Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 h-12"
                data-testid="input-email"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold h-14 text-lg"
                data-testid="button-signup"
              >
                {submitting ? "Signing Up..." : "Get My Affiliate Link"} 
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
            
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-indigo-300">
              <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Free to join</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> No credit card</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Instant access</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 border border-green-500/30 rounded-xl p-6 text-center" data-testid="earnings-highlight">
            <p className="text-green-300 text-lg mb-2">Top affiliates earn</p>
            <p className="text-4xl font-bold text-white mb-2">$5,000+<span className="text-green-400">/month</span></p>
            <p className="text-green-200 text-sm">With our exclusive pass-up commission system</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-black/20 py-8">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-indigo-300 text-sm">
            Powered by {brand.brandName} | A RentAPog Partner Site
          </p>
          <p className="text-indigo-400 text-xs mt-2">
            2nd sale pass-up system in effect. Transparency first.
          </p>
        </div>
      </footer>
    </div>
  );
}
