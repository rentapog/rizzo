import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, DollarSign, Zap, ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function DomainRegistry() {
  const paymentLink = "https://buy.stripe.com/test_fZu28q2QKeD7fYcghygA800";
  const [affiliateCode, setAffiliateCode] = useState("");

  useEffect(() => {
    // Read affiliate code from URL parameter (from Mailchimp email)
    const params = new URLSearchParams(window.location.search);
    const affCode = params.get("aff") || params.get("ref");
    
    if (affCode) {
      setAffiliateCode(affCode);
      localStorage.setItem("referralCode", affCode);
      // Redirect to clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 border-blue-200">
              <Zap className="h-4 w-4 mr-2" />
              Daily Pog Rentals with Instant Payouts
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
              Rent a Pog Today
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get your premium pog online in minutes. Only <span className="font-bold text-blue-600">$20/day</span>. Keep almost everything you earn. No credit card hassle.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                size="lg"
                className="h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg"
                onClick={() => window.location.href = paymentLink}
                data-testid="button-rent-pog"
              >
                <Globe className="h-5 w-5 mr-2" />
                Rent Your Pog - $20/day
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-blue-600 border-blue-600 hover:bg-blue-50 font-bold text-lg"
                onClick={() => window.location.href = '/domain-education'}
                data-testid="button-learn-domains"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Learn How Domains Work
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Instant Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Get paid every single day directly to your Stripe account. No waiting, no middleman.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Globe className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Simple Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Register in minutes. Set up domain forwarding in seconds. Start earning immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-600 mb-2" />
                <CardTitle>Fair System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  You keep almost everything. Only your 2nd sale goes to admin. Rest is 100% yours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-2xl mx-auto">
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-slate-50">
            <CardContent className="pt-8 text-center space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">Ready to Earn?</h2>
              <p className="text-lg text-slate-600">
                Click below to register your pog and start earning daily payments.
              </p>
              <Button
                size="lg"
                className="h-14 px-8 w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg"
                onClick={() => window.location.href = paymentLink}
                data-testid="button-rent-pog-cta"
              >
                Start Renting - $20/day
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
