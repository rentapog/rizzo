import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Check, Globe, Zap, Users, TrendingUp, Shield, DollarSign, Mail, Sparkles } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Globe,
      title: ".com Domain Rentals",
      description: "Rent high-value .com domains for $20 per day with instant activation."
    },
    {
      icon: DollarSign,
      title: "Instant Payouts",
      description: "Receive daily rental income directly to your Stripe account with zero fees."
    },
    {
      icon: Users,
      title: "Pass-Up Affiliate System",
      description: "Unique system: Keep 100% on sales #1, #3+. Only your 2nd sale goes to admin to cover platform costs."
    },
    {
      icon: DollarSign,
      title: "Direct Stripe Payouts",
      description: "Money goes straight to your bank account daily. No payment processor middle-man taking cuts."
    },
    {
      icon: TrendingUp,
      title: "Real-Time Dashboard",
      description: "Track your daily income, active rentals, and earnings in real-time."
    },
    {
      icon: Mail,
      title: "Email List Building",
      description: "Collect customer emails and sync them to AWeber automatically."
    },
    {
      icon: Zap,
      title: "Fast Setup",
      description: "Create an account, add a domain, and start earning in minutes."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "All payments processed through Stripe with industry-standard security."
    },
    {
      icon: Users,
      title: "Referral Tracking",
      description: "Get unique referral links to track and earn from every sale you generate."
    }
  ];

  return (
    <div className="w-full">
      {/* Key Features Section - Top of Page */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-slate-50">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Pass-Up Affiliate System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Unique system: Keep 100% on sales #1, #3+. Only your 2nd sale goes to admin to cover platform costs.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <DollarSign className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Direct Stripe Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Money goes straight to your bank account daily. No payment processor middle-man taking cuts.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Real-Time Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Track your daily income, active rentals, and earnings in real-time.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Email List Building</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Collect customer emails and sync them to AWeber automatically.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="container py-16 space-y-16">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl font-bold">Platform Features</h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to succeed with daily domain rentals and instant payouts.
          </p>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      </div>

      <Card className="bg-slate-50 dark:bg-slate-900 container mt-16">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Create Your Account</h3>
              <p className="text-muted-foreground">Sign up for free and verify your email in seconds.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Search & Select Domain</h3>
              <p className="text-muted-foreground">Browse available .com domains and choose one you want to rent.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Complete Payment</h3>
              <p className="text-muted-foreground">Pay $20 for a day's rental through secure Stripe checkout.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Start Earning</h3>
              <p className="text-muted-foreground">Domain goes active immediately. Earn and track income on your dashboard.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="text-white">Pass-Up Affiliate System - Unique to RentAPog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-4">
              Our revolutionary affiliate model means you keep 100% of your earnings, with only your 2nd sale going to admin. This covers our platform costs while ensuring you're rewarded for your success. <strong>No other affiliate platform does this.</strong>
            </p>
            <p className="text-sm opacity-90">
              Traditional affiliate programs give 5-30% commission. We give you 100% - with one small platform fee on your 2nd sale. That's how confident we are in our system.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">1st Sale</div>
              <div className="text-sm opacity-90">100% to You</div>
              <div className="text-xs opacity-75 mt-1">Keep it all</div>
            </div>
            <div className="text-center bg-white/10 p-3 rounded">
              <div className="text-3xl font-bold">2nd Sale</div>
              <div className="text-sm opacity-90">Goes to Admin</div>
              <div className="text-xs opacity-75 mt-1">Covers platform costs</div>
            </div>
            <div className="text-center border-2 border-white/50 p-3 rounded bg-white/5">
              <div className="text-3xl font-bold">3rd+ Sales</div>
              <div className="text-sm opacity-90">100% to You</div>
              <div className="text-xs opacity-75 mt-1">Unlimited, forever</div>
            </div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <p className="font-semibold mb-2">🎁 Fair & Transparent System</p>
            <p className="text-sm opacity-90">You keep 100% of your 1st, 3rd, and all subsequent sales. Only your 2nd sale goes to admin to cover platform costs. It's the fairest affiliate system around.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Marketing Support: Meet Coey, Your AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Struggling to figure out how to market your link? We've got you covered with Coey, your personal AI marketing assistant built into your dashboard.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Coey helps you with:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Marketing strategies for TikTok, Instagram, Facebook, Google</li>
              <li>Copy ideas and post suggestions</li>
              <li>Affiliate growth strategies</li>
              <li>Answering questions about RentAPog anytime</li>
            </ul>
          </div>
          <p className="text-sm opacity-90">
            Access Coey anytime in your dashboard. No extra cost - it's included with your membership. Your personal AI mentor available 24/7.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
