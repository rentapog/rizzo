import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BarChart3, Globe, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Sales() {
  const [showRegister, setShowRegister] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "✓ Account Created!",
          description: "Your affiliate link is ready. Check your email for details.",
        });
        
        // Show confirmation and redirect to dashboard
        setTimeout(() => {
          navigate("/backend");
        }, 2000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 overflow-hidden bg-gradient-to-r from-red-600 via-white to-blue-600">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Create Your Account</h1>
            <p className="text-xl text-slate-700">
              Sign up and start earning daily with your affiliate link!
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="py-12 bg-gradient-to-b from-white to-slate-50">
        <div className="container px-4 md:px-6">
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Complete Your Signup</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Username</label>
                    <Input
                      type="text"
                      placeholder="yourname"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      data-testid="input-username"
                      className="h-10 border-2"
                      disabled={loading}
                    />
                    <p className="text-xs text-slate-500">Your affiliate link: sales.rentapog.com/?aff=<strong>{username || "yourname"}</strong></p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-email"
                      className="h-10 border-2"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      data-testid="input-password"
                      className="h-10 border-2"
                      disabled={loading}
                    />
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-green-900">🎁 After signup:</p>
                    <ul className="text-sm text-green-800 mt-2 space-y-1">
                      <li>✓ Your own subdomain: yourname.rentapog.com</li>
                      <li>✓ Your unique affiliate link</li>
                      <li>✓ 100% commissions on 1st & 3rd+ sales</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-semibold"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account & Get My Affiliate Link"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Access Section - Only show after login */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-slate-50">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Already have an account?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Dashboard Card */}
            <Card className="hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  View your real-time earnings, sales stats, and account overview.
                </p>
                <Button className="w-full" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Domain Rental Card */}
            <Card className="hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Domain Rental</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Browse available domains and start your first rental today.
                </p>
                <Button className="w-full" asChild>
                  <Link href="/domains">Rent Domains</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle>All Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Explore all platform features and benefits available to you.
                </p>
                <Button className="w-full" asChild>
                  <Link href="/features">View Features</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6 max-w-3xl">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">How to Get Started</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <span>Visit your dashboard to see your account overview and earnings</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <span>Browse available domains in the Domain Rental section</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <span>Start earning with your first rental</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <span>Share your affiliate link to build your network</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
