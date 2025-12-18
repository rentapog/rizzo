import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Globe, DollarSign, ShieldCheck, Zap, Lock, TrendingUp, Mail, Lightbulb } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
    // Dynamically load the AWeber form script on mount
    useEffect(() => {
      const scriptId = "aweber-wjs-ka1zb45kz";
      if (!document.getElementById(scriptId)) {
        const js = document.createElement("script");
        js.id = scriptId;
        js.src = "//forms.aweber.com/form/89/873792089.js";
        js.type = "text/javascript";
        document.body.appendChild(js);
      }
      // No need to remove script on unmount for this use case
    }, []);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribedName, setSubscribedName] = useState("");
  const [newAffiliateLink, setNewAffiliateLink] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [referrerCode, setReferrerCode] = useState("");
  const [referrerName, setReferrerName] = useState("");
  const [hasAffiliateLink, setHasAffiliateLink] = useState(false);
  const [packagesAffiliateCode, setPackagesAffiliateCode] = useState("");
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const didYouKnowTips = [
    { title: "Your 1st and 3rd+ Sales = 100% Yours", text: "Only the 2nd sale goes to admin to cover platform costs. Every other sale is 100% yours!" },
    { title: "Daily Payouts via Stripe", text: "Get paid every single day directly to your Stripe account. No waiting weeks for commissions." },
    { title: "Stack Multiple Domains", text: "The more domains you rent, the more passive income streams you create. No limits!" },
    { title: "Share Your Link Everywhere", text: "Social media, email, forums, YouTube - every referral from your link counts toward your earnings." },
    { title: "Premium Domains = Higher Value", text: "Short, memorable domain names attract more renters and can command higher daily rates." },
    { title: "Referral Balance Covers Fees", text: "Your referral earnings automatically offset your daily domain fees - smart passive income!" },
    { title: "Build a Team", text: "When your referrals make sales, you benefit from a sustainable affiliate ecosystem." },
    { title: "No Inventory Needed", text: "Unlike physical products, domains are digital assets with zero storage or shipping costs." },
  ];

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % didYouKnowTips.length);
    }, 5000);
    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    // Get affiliate link from URL parameter - default to "rentapog" if none provided
    const params = new URLSearchParams(window.location.search);
    const aff = params.get("aff") || params.get("ref") || "rentapog";
    setReferrerCode(aff);
    setHasAffiliateLink(true);
    
    // Fetch referrer's name
    fetch(`/api/referral/${encodeURIComponent(aff)}`)
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          setReferrerName(data.name);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email) {
      toast({ title: "Error", description: "Please fill in all fields" });
      return;
    }

    // Get referrer code directly from URL at submit time (fixes race condition) - default to "rentapog"
    const params = new URLSearchParams(window.location.search);
    const currentReferrerCode = params.get("aff") || params.get("ref") || referrerCode || "rentapog";

    setLoading(true);
    try {
      // Create full account via new endpoint (username and password auto-generated)
      const res = await fetch("/api/affiliates/home-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          name: firstName,
          referrerCode: currentReferrerCode 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Also send to Zapier
        const zapierUrl = "https://hooks.zapier.com/hooks/catch/25004565/uicqitu/";
        await fetch(zapierUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            name: firstName,
            referrerCode: currentReferrerCode,
            timestamp: new Date().toISOString() 
          }),
        }).catch(() => {});

        // Redirect straight to packages after signup
        const packagesCode = data.packagesAffiliateCode || data.affiliateLink || data.username;
        window.location.href = `https://packages.rentapog.com/?aff=${packagesCode}`;
      } else {
        const data = await res.json();
        toast({
          title: "Signup failed",
          description: data.error || data.message || "Please try again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center z-50">
        <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl mx-auto"
            >
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl">
                <CardContent className="pt-12 pb-12 text-center space-y-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: 2 }}
                    className="mx-auto"
                  >
                    <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>

                  <div className="space-y-3">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Thank You, {subscribedName}!</h2>
                    <p className="text-xl font-semibold text-green-700">You Have Been Subscribed</p>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 text-left space-y-4">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-lg">
                      <Mail className="w-5 h-5" />
                      Important: Check Your Email
                    </div>
                    
                    <div className="space-y-3 text-slate-700">
                      <p className="font-medium">
                        We've sent you an email from <span className="font-bold text-blue-600">sales@rentapog.com</span>
                      </p>
                      
                      <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <p className="font-semibold text-slate-800 mb-2">Please check your spam/junk folder!</p>
                        <p className="text-sm text-slate-600">
                          Sometimes our emails land there by mistake. If you find it in spam, mark it as "Not Spam" to ensure you receive future emails.
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <p className="font-semibold text-slate-800 mb-2">How to Whitelist Our Email:</p>
                        <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                          <li>Add <span className="font-bold">sales@rentapog.com</span> to your contacts</li>
                          <li>In Gmail: Click the 3 dots → "Add to contacts"</li>
                          <li>In Outlook: Right-click the sender → "Add to contacts"</li>
                          <li>In Yahoo: Click the sender → "Add to contacts"</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm">
                    This ensures you receive all important updates and notifications from RentAPog.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
        </div>
      </div>
    );
  }

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
                RentAPog - Try FREE for 3 Days
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Rent A Pog. <br/>
                <span className="text-primary">Get Paid Daily.</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-[600px] leading-relaxed">
                The world's first daily-pay pog rental platform. Try it completely FREE for 3 days - no risk, cancel anytime!
                <br/><br/>
                <span className="font-semibold text-slate-900">Risk-Free Trial:</span> Start earning with zero upfront cost. After 3 days, daily billing begins. Cancel anytime during your trial.
              </p>
              
              <div className="space-y-4 max-w-lg">
                <div className="bg-gradient-to-br from-red-50 via-white to-blue-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
                  <div className="mb-6">
                    <p className="text-sm font-bold text-red-600 uppercase tracking-wide mb-2">Limited Time</p>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2">Start Earning Daily</h3>
                    <p className="text-slate-600">Get your affiliate link and start earning immediately.</p>
                  </div>
                  
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {hasAffiliateLink && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-green-800">
                            <span className="font-bold">Referred by:</span> {referrerCode}
                          </p>
                        </div>
                      )}

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">
                          <span className="font-bold">Quick signup!</span> We'll create your username and password, then email your login details.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Your Name</label>
                        <Input 
                          type="text" 
                          placeholder="John" 
                          className="h-12 text-base border-2 border-slate-200 focus:border-red-600 rounded-lg"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          data-testid="input-firstName-subscribe"
                          required
                        />
                      </div>

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
                            data-testid="input-email-subscribe"
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit"
                        size="lg" 
                        className="w-full h-14 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-bold text-lg rounded-lg shadow-lg transform transition hover:scale-105"
                        data-testid="button-join-now"
                        disabled={loading}
                      >
                        {loading ? "Creating Account..." : "Create Account & Get My Affiliate Link"}
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
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" variant="outline" className="text-lg h-12 px-8 bg-white w-full sm:w-auto" asChild>
                  <Link href="/howitworks">How It Works</Link>
                </Button>
              </div>

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
      <section id="features" className="py-12 bg-gradient-to-b from-white to-slate-50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
              🚀 Three Simple Steps to Daily Income
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Your Path to Passive Income</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Get started in minutes. Earn every single day. It's that simple.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardContent className="pt-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-2xl font-bold">1</span>
                    </div>
                    <Globe className="h-8 w-8 text-blue-300 opacity-40" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Select Your Pogs</h3>
                    <p className="text-slate-700 leading-relaxed">
                      Browse our premium collection of high-value pogs. Choose the ones you want to rent out and set your rental terms. Start with as little or as much as you want.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold">⏱️ Takes less than 2 minutes</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="relative md:mt-6">
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardContent className="pt-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-2xl font-bold">2</span>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-300 opacity-40" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Earn Daily</h3>
                    <p className="text-slate-700 leading-relaxed">
                      Every rental generates revenue immediately. You keep 100% of most sales. Only your 2nd sale goes to cover platform costs - that's it. No hidden fees, no surprises.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-green-200">
                    <p className="text-sm text-green-600 font-semibold">💰 Payouts every single day</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="relative md:mt-12">
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardContent className="pt-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-2xl font-bold">3</span>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-300 opacity-40" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Scale & Grow</h3>
                    <p className="text-slate-700 leading-relaxed">
                      As your rentals increase, so does your income. Refer friends and earn from their sales too. Build a sustainable passive income stream with our proven affiliate system.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-purple-200">
                    <p className="text-sm text-purple-600 font-semibold">📈 Earn 100% from most referrals</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 3-Day FREE Trial Section */}
          <div className="mt-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 md:p-12 border-2 border-green-200">
            <div className="text-center mb-10">
              <div className="inline-block mb-4 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                🎁 Risk-Free Offer
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Start FREE for 3 Days - No Risk!</h3>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Try before you commit! Cancel anytime during your trial - no questions asked.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {/* Step 1 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h4 className="font-bold text-slate-900 mb-2">Sign Up FREE</h4>
                <p className="text-sm text-slate-600">Choose your package and start your 3-day free trial instantly</p>
                <p className="text-xs text-green-600 mt-2 font-semibold">No payment for 3 days</p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h4 className="font-bold text-slate-900 mb-2">Try Risk-Free</h4>
                <p className="text-sm text-slate-600">Explore all features, share your link, start earning referrals</p>
                <p className="text-xs text-blue-600 mt-2 font-semibold">Cancel anytime during trial</p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h4 className="font-bold text-slate-900 mb-2">Daily Billing Starts</h4>
                <p className="text-sm text-slate-600">After 3 days OR when you get 3 subscribers, automatic daily charges begin</p>
                <p className="text-xs text-purple-600 mt-2 font-semibold">$20 - $499/day based on package</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-green-200 max-w-3xl mx-auto mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-2">🎯 When Does Daily Billing Start?</h4>
                  <p className="text-slate-700 mb-3">
                    Your <span className="font-bold text-green-700">3-day FREE trial</span> ends when <span className="font-bold">either</span> of these happens first:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="font-bold text-blue-900 mb-1">⏰ Option 1: Time Runs Out</p>
                      <p className="text-sm text-blue-800">After 3 full days from signup, daily billing automatically starts</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="font-bold text-purple-900 mb-1">👥 Option 2: You Get 3 Subscribers</p>
                      <p className="text-sm text-purple-800">Once you have 3 paying referrals, you're in profit mode - daily billing begins!</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <p className="text-sm text-amber-900">
                      <span className="font-bold">💡 Smart System:</span> If you get 3 subscribers within your trial, you'll already be earning commissions that cover your daily fees. That's why billing starts early - you're already profitable!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-green-200 max-w-3xl mx-auto mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">100% Risk-Free Guarantee</h4>
                  <p className="text-slate-600 mb-3">
                    Not sure if this is for you? No problem! Try it for 3 full days completely FREE. 
                    If it's not right for you, simply cancel before your trial ends - no charges, no questions asked.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      ✓ 3 days completely FREE
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                      ✓ Cancel anytime
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                      ✓ No risk, no obligation
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <ShieldCheck className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Fair Pass-Up System</h4>
                  <p className="text-slate-600 mb-3">
                    To keep the platform running smoothly, your <span className="font-bold text-amber-700">2nd sale always passes up to admin</span>. 
                    This covers ongoing platform costs. But here's the great part:
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-amber-100 text-center">
                      <p className="text-2xl font-bold text-green-600">1st Sale</p>
                      <p className="text-sm text-slate-600">100% Yours</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-amber-100 text-center">
                      <p className="text-2xl font-bold text-amber-600">2nd Sale</p>
                      <p className="text-sm text-slate-600">Goes to Admin</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-amber-100 text-center">
                      <p className="text-2xl font-bold text-green-600">3rd → ∞</p>
                      <p className="text-sm text-slate-600">100% Yours Forever!</p>
                    </div>
                  </div>
                  <p className="text-center text-sm text-slate-600 mt-4">
                    That's right - after your 2nd sale, <span className="font-bold text-green-700">every single sale from #3 onwards is 100% yours, forever!</span> No caps, no limits.
                  </p>
                </div>
              </div>
            </div>

            {/* NEW: First 3 Leads System Explanation */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 max-w-3xl mx-auto mt-6">
              <div className="text-center mb-6">
                <div className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-3">
                  🎁 BONUS: Get Free Leads!
                </div>
                <h4 className="font-bold text-slate-900 text-2xl mb-2">Rotating Lead Pool System</h4>
                <p className="text-slate-600">When you purchase a package, you get your share of incoming leads as the system collects them!</p>
              </div>

              <div className="bg-white rounded-xl p-6 mb-4 border border-blue-100">
                <h5 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🔄</span> How The Rotation Works:
                </h5>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <p className="font-semibold text-slate-900">First Buyer Gets Leads 1-3</p>
                      <p className="text-sm text-slate-600">The first person to purchase gets the first 3 email signups</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <p className="font-semibold text-slate-900">Second Buyer Gets Leads 4-6</p>
                      <p className="text-sm text-slate-600">Next buyer gets the next 3 signups in the queue</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">∞</div>
                    <div>
                      <p className="font-semibold text-slate-900">Automatic Rotation Continues</p>
                      <p className="text-sm text-slate-600">Each buyer gets the next 3 leads - fair and automatic!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <p className="font-bold text-blue-600 mb-2">💰 What This Means For You:</p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>✓ Your next 3 leads assigned as system collects them</li>
                    <li>✓ These leads already have your affiliate link</li>
                    <li>✓ When they purchase, YOU earn the commission</li>
                    <li>✓ Buy more packages = get more leads in rotation!</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <p className="font-bold text-green-600 mb-2">📈 Example Scenario:</p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• You purchase → Get Sarah, Mike, Lisa</li>
                    <li>• Sarah buys $99 package → You earn $99!</li>
                    <li>• Mike buys $49 package → You earn $49!</li>
                    <li>• Lisa signs up friends → More earnings!</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-slate-700 text-center">
                  <span className="font-bold text-amber-700">🚀 Pro Tip:</span> The more people who sign up on the platform, the more valuable each package purchase becomes - you're not just buying access, you're buying future leads!
                </p>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mt-20 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-12 text-white">
            <h3 className="text-2xl font-bold mb-8 text-center">Why RentAPog?</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Daily Payouts</h4>
                  <p className="text-slate-300">No monthly waiting periods. Get paid instantly to Stripe every single day.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <ShieldCheck className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Transparent Pricing</h4>
                  <p className="text-slate-300">Only your 2nd sale goes to admin. You keep 100% of the rest. Period.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Zap className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Quick Setup</h4>
                  <p className="text-slate-300">Get started in minutes. No complicated forms, no long waits for approval.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Unlimited Earnings</h4>
                  <p className="text-slate-300">The more you rent, the more you earn. There's no cap on your income.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Did You Know Section */}
      <section className="py-16 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              key={currentTipIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 border-amber-300 bg-white shadow-xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                        <Lightbulb className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-amber-600 uppercase tracking-wide">Did You Know?</span>
                        <span className="text-xs text-slate-400">Tip {currentTipIndex + 1} of {didYouKnowTips.length}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">
                        {didYouKnowTips[currentTipIndex].title}
                      </h3>
                      <p className="text-lg text-slate-600 leading-relaxed">
                        {didYouKnowTips[currentTipIndex].text}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6 gap-2">
                    {didYouKnowTips.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTipIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          index === currentTipIndex 
                            ? 'bg-amber-500 w-6' 
                            : 'bg-amber-200 hover:bg-amber-300'
                        }`}
                        data-testid={`tip-indicator-${index}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Latest Blog Posts</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tips, strategies, and insights to help you maximize your earnings
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Post 1 */}
            <Card className="border-2 border-blue-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">Guide</span>
                  <span className="text-xs text-slate-500">Dec 1, 2025</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Getting Started with Daily Payouts</h3>
                <p className="text-slate-700 leading-relaxed">
                  Learn how to maximize your earnings with our daily payout system and get paid instantly.
                </p>
                <a href="/blog/getting-started" className="text-blue-600 font-semibold hover:text-blue-800 text-sm">
                  Read More →
                </a>
              </CardContent>
            </Card>

            {/* Post 2 */}
            <Card className="border-2 border-green-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">Education</span>
                  <span className="text-xs text-slate-500">Nov 28, 2025</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Understanding the Fair Affiliate System</h3>
                <p className="text-slate-700 leading-relaxed">
                  How our 2nd sale pass-up keeps the platform sustainable for everyone.
                </p>
                <a href="/blog/fair-affiliate-system" className="text-blue-600 font-semibold hover:text-blue-800 text-sm">
                  Read More →
                </a>
              </CardContent>
            </Card>

            {/* Post 3 */}
            <Card className="border-2 border-purple-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700">Strategy</span>
                  <span className="text-xs text-slate-500">Nov 25, 2025</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Top Strategies for Affiliate Success</h3>
                <p className="text-slate-700 leading-relaxed">
                  Real tips from top earners on how to scale your referral income.
                </p>
                <a href="/blog/top-strategies" className="text-blue-600 font-semibold hover:text-blue-800 text-sm">
                  Read More →
                </a>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2" asChild>
              <a href="/blog">
                View All Articles <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
