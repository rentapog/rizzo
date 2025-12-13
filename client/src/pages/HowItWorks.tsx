import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, TrendingUp, Users, DollarSign, Zap, Shield, ArrowRight, Mail } from "lucide-react";
import { Link } from "wouter";

export default function HowItWorks() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="pt-16 pb-12 bg-gradient-to-r from-red-600 via-white to-blue-600">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">How RentAPog Works</h1>
            <p className="text-xl text-slate-700">
              Start with nothing and reach profit mode in your first month. We'll give you your first 3 referrals so you can see real earnings immediately.
            </p>
            <p className="text-lg font-semibold text-red-600">
              ✓ Daily Packages ✓ Backoffice Upgrades ✓ Unlimited Growth
            </p>
          </div>
        </div>
      </section>

      {/* The System Explained */}
      <section className="py-16">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none">
                  <CardContent className="pt-8 flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold">1</span>
                      </div>
                      <p className="font-semibold text-slate-900">You Register Free</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="order-1 md:order-2 space-y-4">
                <h2 className="text-3xl font-bold">Step 1: Join RentAPog</h2>
                <p className="text-lg text-muted-foreground">
                  Create your account completely free. No credit card required. You'll get a unique referral link instantly.
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-600 shrink-0" />
                    <span>Free account creation</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-600 shrink-0" />
                    <span>Instant referral link</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-600 shrink-0" />
                    <span>Access to dashboard</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Step 2: Share Your Affiliate Link</h2>
                <p className="text-lg text-muted-foreground">
                  Here's the game changer: Share your unique affiliate link and <strong>start earning from day one</strong>. Every package is <strong>DAILY</strong> - meaning $20/day per pog rental.
                </p>
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-blue-900">What This Means:</p>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex gap-2">
                      <span className="font-bold">Sale #1:</span> You keep 100% ($20/day)
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">Sale #2:</span> Goes to Admin ($0 to you - platform cost)
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">Sale #3:</span> You keep 100% ($20/day)
                    </li>
                    <li className="flex gap-2 font-bold text-blue-900">
                      YOUR FIRST PROFIT: $40/day minimum
                    </li>
                  </ul>
                </div>
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <p className="font-semibold text-red-900 mb-2">🚀 Backoffice Upgrades Available:</p>
                  <p className="text-sm text-red-800">Once you're in your backoffice dashboard, you can upgrade to premium packages with higher daily payouts and exclusive features!</p>
                </div>
              </div>
              <div>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none">
                  <CardContent className="pt-8 flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="h-20 w-20 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-4">
                        <Users className="h-10 w-10" />
                      </div>
                      <p className="font-semibold text-slate-900">Share & Earn</p>
                      <p className="text-sm text-muted-foreground">= Your profit mode</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-none">
                  <CardContent className="pt-8 flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="h-20 w-20 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-10 w-10" />
                      </div>
                      <p className="font-semibold text-slate-900">Scale & Earn</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="order-1 md:order-2 space-y-4">
                <h2 className="text-3xl font-bold">Step 3: Scale to Unlimited Income</h2>
                <p className="text-lg text-muted-foreground">
                  From your 3rd sale onwards, everything is 100% yours. Forever. Keep growing with zero additional platform fees.
                </p>
                <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-purple-900">Unlimited Growth Potential:</p>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li className="flex gap-2">
                      <span className="font-bold">3rd Sale and Beyond:</span> 100% to you (forever)
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      No caps on earnings
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      Instant daily Stripe payouts to your bank
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      Scale to unlimited income
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Billing Notice */}
      <section className="py-12 bg-red-50 border-t-4 border-red-600">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-red-900">⚠️ Important Billing Information</h2>
            
            <div className="bg-white rounded-lg p-6 border-2 border-red-300 space-y-4">
              <div>
                <h3 className="font-bold text-red-900 mb-2">📅 Daily Recurring Charges</h3>
                <p className="text-sm text-gray-700">
                  Your subscription charges are <strong>DAILY</strong>. This means money is deducted from your account every single day as long as your subscription is active. Make sure you have sufficient funds in your account to cover daily charges.
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold text-red-900 mb-2">💰 Monthly Earning Examples (AUD)</h3>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
                  <p>• <strong>Starter ($20/day):</strong> $600/month</p>
                  <p>• <strong>Bronze ($49/day):</strong> $1,470/month</p>
                  <p>• <strong>Silver ($99/day):</strong> $2,970/month</p>
                  <p>• <strong>Gold ($149/day):</strong> $4,470/month</p>
                  <p>• <strong>Platinum ($199/day):</strong> $5,970/month</p>
                  <p>• <strong>Diamond ($249/day):</strong> $7,470/month</p>
                  <p>• <strong>Elite ($299/day):</strong> $8,970/month</p>
                  <p>• <strong>Master ($349/day):</strong> $10,470/month</p>
                  <p>• <strong>Champion ($399/day):</strong> $11,970/month</p>
                  <p>• <strong>Legend ($449/day):</strong> $13,470/month</p>
                  <p>• <strong>Ultimate ($499/day):</strong> $14,970/month</p>
                </div>
              </div>

              <div className="border-t pt-4 bg-yellow-50 rounded p-4">
                <h3 className="font-bold text-red-900 mb-2">🔔 Keep Funds in Your Account</h3>
                <p className="text-sm text-gray-700 mb-4">
                  <strong>CRITICAL:</strong> Your account balance must always cover your daily subscription fee. If your balance drops below your daily rate, your subscription will be <strong>automatically cancelled</strong>.
                </p>
                
                <div className="bg-white rounded-lg p-4 border border-yellow-300 mb-4">
                  <p className="font-semibold text-gray-800 mb-3">Minimum Balance Required (Based on Your Package):</p>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <p>• Starter Package: Keep <strong>$20+ AUD</strong> in account</p>
                    <p>• Bronze Package: Keep <strong>$49+ AUD</strong> in account</p>
                    <p>• Silver Package: Keep <strong>$99+ AUD</strong> in account</p>
                    <p>• Gold Package: Keep <strong>$149+ AUD</strong> in account</p>
                    <p>• Platinum Package: Keep <strong>$199+ AUD</strong> in account</p>
                    <p>• Diamond Package: Keep <strong>$249+ AUD</strong> in account</p>
                    <p>• Elite Package: Keep <strong>$299+ AUD</strong> in account</p>
                    <p>• Master Package: Keep <strong>$349+ AUD</strong> in account</p>
                    <p>• Champion Package: Keep <strong>$399+ AUD</strong> in account</p>
                    <p>• Legend Package: Keep <strong>$449+ AUD</strong> in account</p>
                    <p>• Ultimate Package: Keep <strong>$499+ AUD</strong> in account</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-300">
                  <p className="font-semibold text-green-800 mb-2">💡 How It Works:</p>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li>• When you refer someone, their daily payment goes into YOUR account balance</li>
                    <li>• Your daily subscription fee is then deducted from this balance</li>
                    <li>• As long as referrals keep paying, your balance stays funded</li>
                    <li>• <strong>Example:</strong> If you're on the $99/day Silver package and have 3 referrals paying $99/day each, you earn $297/day but only pay $99/day = <strong>$198/day profit!</strong></li>
                  </ul>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold text-red-900 mb-2">❌ Auto-Cancellation Policy</h3>
                <p className="text-sm text-gray-700">
                  If you don't have sufficient funds in your account to cover a daily charge, your account will be automatically suspended/cancelled. To reactivate, you'll need to add funds and contact support.
                </p>
              </div>

              <div className="border-t pt-4 bg-red-100 rounded p-4 border-2 border-red-600">
                <h3 className="font-bold text-red-900 mb-2">🚨 CRITICAL: Missed Payment = ALL REFERRALS LOST</h3>
                <p className="text-sm text-red-900 font-semibold">
                  <strong>If your payment fails and your subscription is cancelled:</strong>
                </p>
                <ul className="text-sm text-red-900 mt-3 space-y-2 ml-4">
                  <li>• Your entire subscription is PERMANENTLY LOST</li>
                  <li>• <strong>ALL of your referrals go to ADMIN</strong> - regardless of how many you have</li>
                  <li>• You lose access to ALL commissions from those referrals</li>
                  <li>• Even if you had 50+ referrals generating thousands/month, they ALL transfer to admin</li>
                  <li>• You cannot recover your referrals even if you reactivate</li>
                </ul>
                <p className="text-sm text-red-900 font-bold mt-4">
                  This is why keeping sufficient funds in your account is absolutely critical. One missed payment could cost you your entire income stream.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Math */}
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-6">The Math Breakdown</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Start FREE for 3 days - no risk, cancel anytime! After trial, daily payments begin automatically.
          </p>

          {/* 3-Day FREE Trial Explainer */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mb-10">
            <h3 className="text-xl font-bold text-green-800 mb-4 text-center">🎁 Your 3-Day FREE Trial</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">Step 1</div>
                <p className="font-semibold text-slate-800">Sign Up FREE</p>
                <p className="text-sm text-slate-600">No payment for 3 days</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">Step 2</div>
                <p className="font-semibold text-slate-800">Try Risk-Free</p>
                <p className="text-sm text-slate-600">Cancel anytime during trial</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">Step 3</div>
                <p className="font-semibold text-slate-800">Daily Payments Begin</p>
                <p className="text-sm text-slate-600">After 3 days, billing starts</p>
              </div>
            </div>
            <p className="text-center text-sm text-green-700 mt-4 font-medium">
              No risk! Cancel anytime during your 3-day trial - no charges, no questions asked.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* After Trial - Your Earnings */}
            <Card>
              <CardHeader>
                <CardTitle>After 3-Day Trial: Your Earnings</CardTitle>
                <p className="text-xs text-muted-foreground mt-2">Daily payments from YOUR referrals come to YOU</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>Referral 1 pays daily</span>
                    <span className="font-bold text-green-600">+$20/day to YOU</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>Referral 2 (passes to Admin)</span>
                    <span className="font-bold text-amber-600">$0 to you</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>Referral 3+ pays daily</span>
                    <span className="font-bold text-green-600">+$20/day to YOU</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t-2 border-b-2 bg-green-50 px-2">
                    <span className="font-bold">YOUR DAILY INCOME</span>
                    <span className="font-bold text-2xl text-green-600">$40+/day</span>
                  </div>
                  <div className="text-sm font-semibold text-green-700 bg-green-100 rounded p-3 text-center mt-3">
                    <p className="mb-1">From 3 referrals = <strong>$40/day = $1,200/month</strong></p>
                    <p className="text-xs">Your 2nd referral's payment covers admin costs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Daily Costs */}
            <Card>
              <CardHeader>
                <CardTitle>After 3-Day Trial: Your Daily Cost</CardTitle>
                <p className="text-xs text-muted-foreground mt-2">Charged to your account daily</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b bg-blue-50 px-2 rounded">
                    <span>Your daily subscription</span>
                    <span className="font-bold text-blue-600">-$20/day (Starter)</span>
                  </div>
                  <div className="text-sm text-slate-600 py-2">
                    This daily fee is charged from your referral balance and goes 100% to the person who referred YOU.
                  </div>
                  <div className="flex justify-between items-center py-2 border-t-2 border-b-2 bg-purple-50 px-2">
                    <span className="font-bold">NET DAILY PROFIT</span>
                    <span className="font-bold text-green-600">$40 - $20 = $20/day</span>
                  </div>
                  <div className="text-sm font-semibold text-purple-700 bg-purple-100 rounded p-3 text-center mt-3">
                    <p className="mb-1"><strong>$20/day profit = $600/month</strong></p>
                    <p className="text-xs">More referrals = more profit! 10 referrals = $160/day profit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scale Up */}
          <div className="mt-10 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-purple-800 mb-4 text-center">📈 Scale to Unlimited Daily Profit</h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="text-sm text-slate-600">3 Referrals</p>
                <p className="text-xl font-bold text-green-600">$20/day</p>
                <p className="text-xs text-slate-500">$600/month profit</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="text-sm text-slate-600">10 Referrals</p>
                <p className="text-xl font-bold text-green-600">$160/day</p>
                <p className="text-xs text-slate-500">$4,800/month profit</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="text-sm text-slate-600">25 Referrals</p>
                <p className="text-xl font-bold text-green-600">$460/day</p>
                <p className="text-xs text-slate-500">$13,800/month profit</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="text-sm text-slate-600">50 Referrals</p>
                <p className="text-xl font-bold text-green-600">$960/day</p>
                <p className="text-xs text-slate-500">$28,800/month profit</p>
              </div>
            </div>
            <p className="text-center text-sm text-purple-700 mt-4">
              Remember: Only your 2nd referral passes to admin. Every other referral = 100% yours forever!
            </p>
          </div>
        </div>
      </section>

      {/* Why This Works */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-blue-600 text-white">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why This System Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="pt-8 space-y-4">
                <Zap className="h-10 w-10 text-yellow-300" />
                <h3 className="font-bold text-lg text-white">Zero Risk Entry</h3>
                <p className="text-white/90">
                  Start earning with your affiliate link immediately. No hidden costs, no complicated setup.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="pt-8 space-y-4">
                <DollarSign className="h-10 w-10 text-yellow-300" />
                <h3 className="font-bold text-lg text-white">Daily Payouts</h3>
                <p className="text-white/90">
                  Every package is DAILY. Earnings hit your account every single day with Stripe. No waiting, no delays.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="pt-8 space-y-4">
                <Shield className="h-10 w-10 text-yellow-300" />
                <h3 className="font-bold text-lg text-white">Upgrade Anytime</h3>
                <p className="text-white/90">
                  Access premium packages in your backoffice. Increase your daily payouts whenever you're ready to scale.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">What You Get</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Check className="h-6 w-6" />
                Unique Referral Link
              </h3>
              <p>Custom link that tracks every rental you send. No confusion about who referred what.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Check className="h-6 w-6" />
                Real-Time Dashboard
              </h3>
              <p>See your referrals, sales, and earnings update live. Track every dollar coming in.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Check className="h-6 w-6" />
                Facebook & Google Compliance
              </h3>
              <p>Fully compliant marketing materials so you can advertise on any platform legally.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Check className="h-6 w-6" />
                Email List Integration
              </h3>
              <p>Build your email list with AWeber integration. Keep leads for future offers.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Check className="h-6 w-6" />
                Secure Stripe Payments
              </h3>
              <p>Industry-leading security so your customers' payments are protected 24/7.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Check className="h-6 w-6" />
                Unlimited Growth
              </h3>
              <p>No caps, no limits. Earn as much as you can send to the platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Ready to Enter Profit Mode?</h2>
            <p className="text-xl text-white/90">
              Start completely free with daily earnings. Get your 3 referrals. Keep 100% of everything after. Upgrade anytime in your backoffice.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="text-lg h-12 px-8 border-white text-white hover:bg-white/10" asChild>
              <Link href="/features">
                View All Features
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
