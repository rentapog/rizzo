import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Zap, Mail, Lock, ShieldCheck, Globe, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "../hooks/use-toast";

export default function Affiliate() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Handle referral code from URL (both ?aff= and ?ref= patterns)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const affCode = params.get("aff") || params.get("ref");
    
    if (affCode) {
      localStorage.setItem("referralCode", affCode);
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email",
      });
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubscribed(true);
        setEmail("");
        toast({
          title: "✓ Subscribed!",
          description: "Check your email for your account details.",
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

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center space-y-8"
            >
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-green-50 text-green-700 w-fit border-green-200">
                <Zap className="h-3.5 w-3.5 mr-2 fill-green-700" />
                Turn Referrals Into Real Income
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Build Your Affiliate <br/>
                <span className="text-primary">Income Empire.</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-[600px] leading-relaxed">
                Earn daily commissions by referring people to RentAPog. We handle the platform, you handle the marketing. Every referral = daily income in your Stripe account.
                <br/><br/>
                <span className="font-semibold text-slate-900">The Math:</span> Your 1st, 3rd, 4th, 5th + unlimited sales are 100% yours. Only your 2nd sale goes to support the platform. That's the fairest deal in affiliate marketing.
              </p>
              
              <div className="space-y-4 max-w-lg">
                <div className="bg-gradient-to-br from-primary/10 via-white to-blue-50 border-2 border-primary/20 rounded-2xl p-8 shadow-lg">
                  <div className="mb-6">
                    <p className="text-sm font-bold text-primary uppercase tracking-wide mb-2">Start Earning Today</p>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2">Join Our Affiliate Program</h3>
                    <p className="text-slate-600">Sign up on our branded affiliate pages, create your account, and start earning daily.</p>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                    <p className="text-sm text-slate-700">
                      <span className="font-bold text-blue-600">Your Launch Package:</span>
                      <br/>• Your branded affiliate link
                      <br/>• Daily automatic Stripe deposits
                      <br/>• Access to 25 customizable landing pages
                      <br/>• 100% of most sales (only 2nd goes to admin)
                    </p>
                  </div>

                </div>
              </div>

              {!subscribed && (
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button size="lg" variant="outline" className="text-lg h-12 px-8 bg-white w-full sm:w-auto" asChild>
                    <Link href="/howitworks">How It Works</Link>
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4">
                <div className="flex items-center gap-1">
                   <Lock className="h-3 w-3" /> Secure Stripe Integration
                </div>
                <div className="flex items-center gap-1">
                   <ShieldCheck className="h-3 w-3" /> No Hidden Fees
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border bg-white aspect-[16/9]"
            >
               <img 
                src="/rentapog-hero.png" 
                alt="Rent A Pog - Only Domain" 
                className="object-cover w-full h-full"
                onError={(e) => console.log("Image load error:", e)}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How the RentAPog Affiliate Program Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The fairest commission structure in affiliate marketing. More referrals = more money in your pocket.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-slate-50/50">
              <CardContent className="pt-8 space-y-4">
                <div className="h-14 w-14 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-blue-200 shadow-lg">
                  <Globe className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold">1. Share Your Unique Link</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get your branded affiliate link. Share it on social media, in your email list, or anywhere your audience hangs out. We track every click and conversion.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-slate-50/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                 <DollarSign className="h-24 w-24" />
              </div>
              <CardContent className="pt-8 space-y-4">
                <div className="h-14 w-14 rounded-xl bg-green-600 text-white flex items-center justify-center mb-4 shadow-green-200 shadow-lg">
                  <DollarSign className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold">2. Earn Daily Commissions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every referral who signs up becomes a revenue stream. You earn $20/day from each person they rent, every single day. Money flows in automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-slate-50/50">
              <CardContent className="pt-8 space-y-4">
                <div className="h-14 w-14 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4 shadow-purple-200 shadow-lg">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold">3. Get Paid To Your Stripe</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Deposits hit your Stripe account automatically every single day. No waiting for monthly payouts. No minimum thresholds. Real-time, direct payment for real work.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}
