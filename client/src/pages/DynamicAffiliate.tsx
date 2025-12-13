import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Mail, Lock, ShieldCheck, Globe, DollarSign, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DynamicAffiliate() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [domainName, setDomainName] = useState("RentAPog");
  const { toast } = useToast();

  useEffect(() => {
    // Detect the subdomain being used
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";

    // Extract subdomain for branding (e.g., seobrainai from seobrainai.rentapog.com)
    if (hostname && hostname.includes(".rentapog.com")) {
      const subdomain = hostname.split(".")[0];
      setDomainName(subdomain.charAt(0).toUpperCase() + subdomain.slice(1));
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
      // Always use "rentapog" affiliate code for admin credit
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, affiliateLink: "rentapog" }),
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
                {domainName} - Daily Stripe Payouts
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Rent A Pog. <br/>
                <span className="text-primary">Get Paid Daily.</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-[600px] leading-relaxed">
                The world's first daily-pay pog rental platform. You rent out high-value pogs for $20/day, we handle the tech. 
                <br/><br/>
                <span className="font-semibold text-slate-900">Fair System:</span> You keep almost everything. Only your 2nd sale goes to Admin to cover platform costs. The rest is 100% yours.
              </p>
              
              <div className="space-y-4 max-w-lg">
                {subscribed ? (
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white text-center shadow-xl transform transition-all">
                    <div className="text-5xl mb-4">✓</div>
                    <p className="text-2xl font-bold mb-2">You're In! 🎉</p>
                    <p className="text-green-50">Check your email for your login details and to learn how to start earning.</p>
                    
                    <Button 
                      className="w-full mt-6 bg-white text-green-600 hover:bg-gray-100 font-semibold"
                      onClick={() => window.location.href = "https://backoffice576.rentapog.com"}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Go to Your Backoffice
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-red-50 via-white to-blue-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
                      <div className="mb-6">
                        <p className="text-sm font-bold text-red-600 uppercase tracking-wide mb-2">Limited Time</p>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">Start Earning Daily</h3>
                        <p className="text-slate-600">Get your affiliate link and start earning immediately.</p>
                      </div>
                      
                      <form onSubmit={handleSubscribe} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Your Email</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-3 h-5 w-5 text-red-600" />
                            <Input 
                              type="email" 
                              placeholder="you@example.com" 
                              className="pl-12 h-12 text-base border-2 border-slate-200 focus:border-red-600 rounded-lg"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <Button 
                          type="submit"
                          size="lg" 
                          className="w-full h-14 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-bold text-lg rounded-lg shadow-lg transform transition hover:scale-105"
                          disabled={loading}
                        >
                          {loading ? "Subscribing..." : "Get My Affiliate Link"}
                        </Button>
                      </form>
                      
                      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mt-4">
                        <p className="text-sm text-slate-700">
                          <span className="font-bold text-blue-600">What you get:</span>
                          <br/>• Your unique affiliate link
                          <br/>• Instant Stripe payouts
                          <br/>• 100% of most sales (only 2nd goes to admin)
                        </p>
                      </div>

                      <p className="text-xs text-slate-500 text-center mt-4">
                        By joining, you agree to our Terms & Privacy Policy. We'll never spam you.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border bg-white aspect-[16/9] flex items-center justify-center"
            >
              <div className="text-center">
                <Globe className="h-32 w-32 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-semibold">{domainName}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
