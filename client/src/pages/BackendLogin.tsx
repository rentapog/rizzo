import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowLeft, Mail, CheckCircle, Package } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function BackendLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [showPinField, setShowPinField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requiresPackage, setRequiresPackage] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRequiresPackage(false);

    if (!email || !password) {
      setError("Email and password required");
      return;
    }

    // If PIN field is shown, validate it
    if (showPinField && !pin) {
      setError("PIN required for sub-admin login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, pin: showPinField ? pin : undefined }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.removeItem("stripeConnected");
        
        toast({
          title: "Login successful!",
          description: "Redirecting to your dashboard...",
        });

        // Redirect sub-admins to their special dashboard
        const redirectUrl = data.user.isSubAdmin 
          ? "https://backend.rentapog.com/sub-admin"
          : "https://backend.rentapog.com/";
        
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
      } else {
        const data = await res.json();
        if (data.requiresPackage) {
          setRequiresPackage(true);
          setError("");
        } else if (data.requiresPin) {
          // Show PIN field for sub-admin
          setShowPinField(true);
          setError("This is a sub-admin account. Please enter your PIN.");
        } else {
          setError(data.message || "Login failed");
        }
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!forgotEmail) {
      setError("Please enter your email address");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setForgotSuccess(true);
      } else {
        setError(data.message || "Failed to send reset email");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-cyan-500/30">
          <CardHeader>
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotSuccess(false);
                setError("");
              }}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </button>
            <CardTitle className="text-2xl text-cyan-300">
              {forgotSuccess ? "Check Your Email" : "Forgot Password"}
            </CardTitle>
            <p className="text-slate-400 text-sm mt-2">
              {forgotSuccess 
                ? "We've sent a password reset link to your email." 
                : "Enter your email and we'll send you a reset link."}
            </p>
          </CardHeader>
          <CardContent>
            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <p className="text-slate-300 text-center">
                    If an account exists with <strong className="text-cyan-300">{forgotEmail}</strong>, 
                    you'll receive a password reset link shortly.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSuccess(false);
                  }}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-10"
                >
                  Return to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {error && (
                  <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    data-testid="input-forgot-email"
                    disabled={forgotLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-10 flex items-center justify-center gap-2"
                  data-testid="button-send-reset"
                >
                  <Mail className="h-4 w-4" />
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-cyan-300">Backend Login</CardTitle>
          <p className="text-slate-400 text-sm mt-2">Access your marketing dashboard and earnings</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {requiresPackage && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center space-y-3">
                <div className="flex justify-center">
                  <Package className="h-10 w-10 text-amber-400" />
                </div>
                <p className="text-amber-200 font-medium">Package Required</p>
                <p className="text-slate-300 text-sm">
                  You need to purchase a package to access the backend dashboard.
                </p>
                <a
                  href="https://packages.rentapog.com"
                  className="inline-block w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  data-testid="link-buy-package"
                >
                  Get Your Package Now
                </a>
              </div>
            )}
            {error && (
              <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                data-testid="input-email"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                data-testid="input-password"
                disabled={loading}
              />
            </div>

            {showPinField && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  PIN (Sub-Admin)
                </label>
                <Input
                  type="password"
                  placeholder="Enter your PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  data-testid="input-pin"
                  disabled={loading}
                  maxLength={6}
                />
              </div>
            )}

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
                data-testid="link-forgot-password"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-10"
              data-testid="button-login"
            >
              {loading ? "Logging in..." : "Login to Backend"}
            </Button>

            <p className="text-slate-400 text-sm text-center">
              Don't have an account?{" "}
              <a href="https://rentapog.com" className="text-cyan-400 hover:text-cyan-300">
                Sign up at rentapog.com
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
