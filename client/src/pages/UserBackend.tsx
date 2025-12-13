import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, ExternalLink, Eye, TrendingUp, MessageSquare, Zap, DollarSign, ArrowUpRight, ArrowDownRight, Users, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function UserBackend() {
  const [user, setUser] = useState<any>(null);
  const [userDomain, setUserDomain] = useState("");
  const [stripeConnected, setStripeConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"sales" | "referrals" | "squeeze" | "domain" | "guides" | "coey">("sales");
  const [message, setMessage] = useState("");
  const [coeyResponse, setCoeyResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [loadingSales, setLoadingSales] = useState(false);
  const [referralsData, setReferralsData] = useState<any>(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [purchasedPackage, setPurchasedPackage] = useState<string | null>(null);
  const [subdomainInput, setSubdomainInput] = useState("");
  const [subdomainLoading, setSubdomainLoading] = useState(false);
  const [userSubdomain, setUserSubdomain] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeUser = async () => {
      // Check for payment success from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get("payment_success");
      const packageId = urlParams.get("package");
      const autoLogin = urlParams.get("auto_login");
      
      if (paymentSuccess === "true") {
        setShowPaymentSuccess(true);
        setPurchasedPackage(packageId);
      }

      // Try to get user from localStorage first
      let userData = localStorage.getItem("user");
      
      // If not in localStorage, try to get from cookie
      if (!userData) {
        const cookieValue = document.cookie
          .split("; ")
          .find(row => row.startsWith("user="))
          ?.split("=")[1];
        if (cookieValue) {
          try {
            userData = decodeURIComponent(cookieValue);
            // Save to localStorage for future use
            localStorage.setItem("user", userData);
          } catch {
            // Cookie parsing failed
          }
        }
      }
      
      // If auto_login is set or no userData, try to fetch from server
      if (autoLogin === "true" || !userData) {
        try {
          console.log("[UserBackend] Attempting auto-login via /api/auth/current...");
          const res = await fetch("/api/auth/current", { credentials: "include" });
          if (res.ok) {
            const serverUser = await res.json();
            console.log("[UserBackend] Auto-login successful:", serverUser.email);
            userData = JSON.stringify(serverUser);
            localStorage.setItem("user", userData);
          }
        } catch (err) {
          console.error("[UserBackend] Auto-login failed:", err);
        }
      }
      
      // Clean up URL parameters
      if (paymentSuccess || autoLogin) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setUser(parsed);
          fetchUserDomain(parsed.id);
          fetchSalesData(parsed.id);
          fetchReferralsData(parsed.id);
          fetchUserSubdomain(parsed.id);
          const stripeStatus = localStorage.getItem("stripeConnected");
          setStripeConnected(stripeStatus === "true");
        } catch {
          // Failed to parse user data
          window.location.href = "https://backend.rentapog.com/login";
        }
      } else {
        window.location.href = "https://backend.rentapog.com/login";
      }
    };
    
    initializeUser();
  }, []);

  const fetchUserDomain = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/domains`);
      if (res.ok) {
        const domains = await res.json();
        if (domains.length > 0) {
          setUserDomain(domains[0].domainName);
          setStats({
            domain: domains[0].domainName,
            domainCount: domains.length,
            activeCount: domains.filter((d: any) => d.status === "active").length,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch domain:", err);
    }
  };

  const fetchSalesData = async (userId: string) => {
    setLoadingSales(true);
    try {
      const res = await fetch("/api/user/my-sales", {
        credentials: "include",
        headers: { Authorization: `Bearer ${userId}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSalesData(data);
      }
    } catch (err) {
      console.error("Failed to fetch sales:", err);
    } finally {
      setLoadingSales(false);
    }
  };

  const fetchReferralsData = async (userId: string) => {
    setLoadingReferrals(true);
    try {
      const res = await fetch(`/api/users/${userId}/referral-stats`);
      if (res.ok) {
        const data = await res.json();
        setReferralsData(data);
      }
    } catch (err) {
      console.error("Failed to fetch referrals:", err);
    } finally {
      setLoadingReferrals(false);
    }
  };

  const fetchUserSubdomain = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/subdomain`);
      if (res.ok) {
        const data = await res.json();
        if (data.subdomain) {
          setUserSubdomain(data.subdomain);
        }
      }
    } catch (err) {
      console.error("Failed to fetch subdomain:", err);
    }
  };

  const handleSubdomainRegister = async () => {
    console.log("[Subdomain] Starting registration...");
    console.log("[Subdomain] User:", user);
    console.log("[Subdomain] User ID:", user?.id);
    console.log("[Subdomain] Input:", subdomainInput);
    
    if (!user?.id) {
      console.error("[Subdomain] No user ID - user not logged in!");
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }
    
    if (!subdomainInput.trim()) {
      toast({ title: "Please enter a subdomain name", variant: "destructive" });
      return;
    }

    const cleanSubdomain = subdomainInput.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (cleanSubdomain.length < 3) {
      toast({ title: "Subdomain must be at least 3 characters", variant: "destructive" });
      return;
    }

    setSubdomainLoading(true);
    try {
      console.log("[Subdomain] Sending request to /api/subdomain/register...");
      console.log("[Subdomain] Payload:", { userId: user.id, subdomain: cleanSubdomain });
      
      const res = await fetch("/api/subdomain/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          subdomain: cleanSubdomain,
        }),
      });

      console.log("[Subdomain] Response status:", res.status);
      const data = await res.json();
      console.log("[Subdomain] Response data:", data);
      
      if (res.ok) {
        setUserSubdomain(cleanSubdomain);
        toast({
          title: "Subdomain registered!",
          description: `${cleanSubdomain}.rentapog.com is now yours!`,
        });
      } else {
        console.error("[Subdomain] Registration failed:", data.error);
        toast({ title: data.error || "Failed to register subdomain", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("[Subdomain] Fetch error:", err);
      toast({ title: err?.message || "Error registering subdomain", variant: "destructive" });
    } finally {
      setSubdomainLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    // Get Stripe Connect OAuth URL from backend and redirect to Stripe
    try {
      const res = await fetch("/api/stripe/connect-url");
      
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          // Redirect to Stripe Connect OAuth flow
          window.location.href = data.url;
        } else {
          toast({
            title: "Error",
            description: "No Stripe Connect URL returned",
            variant: "destructive",
          });
        }
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to initiate Stripe Connect",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Stripe Connect error:", err);
      toast({
        title: "Error",
        description: "Failed to connect to Stripe",
        variant: "destructive",
      });
    }
  };

  const handleDomainForwarding = async () => {
    if (!userDomain) {
      toast({ title: "Domain not found", variant: "destructive" });
      return;
    }

    // Use Namecheap API to forward domain
    try {
      const response = await fetch("/api/namecheap/forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: userDomain,
          affiliateLink: `sales.rentapog.com/?aff=${userDomain}`,
        }),
      });

      if (response.ok) {
        toast({
          title: "✓ Domain forwarding enabled!",
          description: `${userDomain}.com now forwards to your affiliate link`,
        });
      } else {
        toast({ title: "Forwarding failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error setting up forwarding", variant: "destructive" });
    }
  };

  const handleCoeyMessage = async () => {
    if (!message.trim()) {
      toast({ title: "Please enter a message", variant: "destructive" });
      return;
    }

    setLoading(true);
    setCoeyResponse("");
    try {
      const res = await fetch("/api/coey/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      
      if (res.ok && data.response) {
        setCoeyResponse(data.response);
        setMessage("");
      } else {
        setCoeyResponse(`Error: ${data.error || "Failed to get response. Please try again."}`);
      }
    } catch (err: any) {
      setCoeyResponse(`Error: ${err?.message || "Network error. Please try again."}`);
      toast({ title: "Error communicating with Coey", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("stripeConnected");
    window.location.href = "https://backend.rentapog.com/login";
  };

  // Show Stripe Connect if not connected
  if (!stripeConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950">
        <header className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6">
          <div className="container px-4 md:px-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold">User Backend</h1>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </header>

        <div className="container px-4 md:px-6 py-16 max-w-2xl">
          <Card className="bg-slate-800 border-cyan-500/30 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-300">🎯 Step 1: Connect Stripe</CardTitle>
              <p className="text-slate-400 text-sm mt-2">Start receiving daily payouts immediately</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-700 border border-cyan-500/30 rounded-lg p-6">
                <h3 className="text-cyan-300 font-bold mb-4">Stripe Connect Setup Guide</h3>
                <div className="space-y-3 text-slate-300">
                  <p><strong>Step 1:</strong> Click "Connect Stripe" below</p>
                  <p><strong>Step 2:</strong> You'll be redirected to Stripe</p>
                  <p><strong>Step 3:</strong> Enter your bank account details</p>
                  <p><strong>Step 4:</strong> Verify with your government ID</p>
                  <p><strong>Step 5:</strong> Done! Start receiving daily payouts</p>
                  <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded mt-4">
                    <p className="text-cyan-200 font-bold">💡 Why Stripe?</p>
                    <ul className="list-disc pl-6 space-y-1 mt-2 text-sm">
                      <li>Daily payouts to your bank account</li>
                      <li>Low fees (2.9% + $0.30 per transaction)</li>
                      <li>Instant settlements</li>
                      <li>Works worldwide</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConnectStripe}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-12 text-lg gap-2"
                data-testid="button-connect-stripe"
              >
                <ExternalLink className="h-5 w-5" /> Connect Stripe Account
              </Button>

              <div className="text-slate-400 text-sm text-center">
                Takes ~2 minutes. Your payouts start immediately after approval.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main dashboard after Stripe connected
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950">
      <header className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 border-b-4 border-cyan-500">
        <div className="container px-4 md:px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">✓ Backend Dashboard</h1>
            <p className="text-cyan-100 text-sm">Stripe Connected | Ready to Earn</p>
          </div>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm">{user.email}</span>}
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Payment Success Banner */}
      {showPaymentSuccess && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-4 shadow-lg">
          <div className="container px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6" />
              <div>
                <p className="font-bold text-lg">Payment Successful!</p>
                <p className="text-green-100 text-sm">
                  {purchasedPackage ? `Your package #${purchasedPackage} is now active. You're ready to start earning!` : "Your purchase was successful. You're ready to start earning!"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPaymentSuccess(false)}
              className="text-white hover:bg-green-600"
              data-testid="button-dismiss-success"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="container px-4 md:px-6 py-8">
        {/* Your Level Card - Most Important */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white mb-6 border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">Your Current Level</p>
                <p className="text-5xl font-bold" data-testid="stat-user-level">
                  {salesData?.userLevelFormatted || "$0"}
                </p>
                <p className="text-indigo-200 text-sm mt-2">
                  You can only earn commissions on packages at your level or below
                </p>
              </div>
              <div className="text-right">
                <Zap className="h-16 w-16 text-yellow-300 mb-2" />
                <a 
                  href="https://packages.rentapog.com" 
                  className="bg-yellow-400 text-indigo-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300 inline-block"
                  data-testid="button-upgrade-level"
                >
                  Upgrade Level →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-pink-600 text-sm font-medium mb-2">
                <Users className="h-4 w-4" />
                Total Referrals
              </div>
              <p className="text-3xl font-bold text-pink-600" data-testid="stat-total-referrals">
                {referralsData?.referralCount || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-2">
                <TrendingUp className="h-4 w-4" />
                Your Earnings
              </div>
              <p className="text-3xl font-bold text-green-600" data-testid="stat-your-earnings">
                {salesData?.totalEarningsFormatted || "$0.00"}
              </p>
              <p className="text-green-500 text-xs mt-1">{salesData?.creditedSalesCount || 0} sales</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-purple-600 text-sm font-medium mb-2">
                <DollarSign className="h-4 w-4" />
                Referral Balance
              </div>
              <p className="text-3xl font-bold text-purple-600" data-testid="stat-referral-balance">
                ${((referralsData?.referralBalance || 0) / 100).toFixed(2)}
              </p>
              <p className="text-purple-500 text-xs mt-1">Pending earnings</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-600 text-sm font-medium mb-2">
                <ArrowUpRight className="h-4 w-4" />
                Passed Up to Admin
              </div>
              <p className="text-3xl font-bold text-orange-600" data-testid="stat-passed-up">
                {salesData?.passedUpAmountFormatted || "$0.00"}
              </p>
              <p className="text-orange-500 text-xs mt-1">{salesData?.passedUpCount || 0} sales passed up</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-slate-700 overflow-x-auto">
          <Button
            variant={activeTab === "sales" ? "default" : "ghost"}
            className={`gap-2 rounded-t-lg ${activeTab === "sales" ? "bg-green-600" : "text-slate-400"}`}
            onClick={() => setActiveTab("sales")}
            data-testid="tab-sales"
          >
            <DollarSign className="h-4 w-4" /> My Sales
          </Button>
          <Button
            variant={activeTab === "referrals" ? "default" : "ghost"}
            className={`gap-2 rounded-t-lg ${activeTab === "referrals" ? "bg-blue-600" : "text-slate-400"}`}
            onClick={() => setActiveTab("referrals")}
            data-testid="tab-referrals"
          >
            <Users className="h-4 w-4" /> My Referrals
          </Button>
          <Button
            variant={activeTab === "squeeze" ? "default" : "ghost"}
            className={`gap-2 rounded-t-lg ${activeTab === "squeeze" ? "bg-cyan-600" : "text-slate-400"}`}
            onClick={() => setActiveTab("squeeze")}
          >
            <Eye className="h-4 w-4" /> 25 Squeeze Pages
          </Button>
          <Button
            variant={activeTab === "domain" ? "default" : "ghost"}
            className={`gap-2 rounded-t-lg ${activeTab === "domain" ? "bg-cyan-600" : "text-slate-400"}`}
            onClick={() => setActiveTab("domain")}
          >
            <ExternalLink className="h-4 w-4" /> Domain Setup
          </Button>
          <Button
            variant={activeTab === "guides" ? "default" : "ghost"}
            className={`gap-2 rounded-t-lg ${activeTab === "guides" ? "bg-cyan-600" : "text-slate-400"}`}
            onClick={() => setActiveTab("guides")}
          >
            <TrendingUp className="h-4 w-4" /> Marketing Guides
          </Button>
          <Button
            variant={activeTab === "coey" ? "default" : "ghost"}
            className={`gap-2 rounded-t-lg ${activeTab === "coey" ? "bg-cyan-600" : "text-slate-400"}`}
            onClick={() => setActiveTab("coey")}
          >
            <Zap className="h-4 w-4" /> Coey AI
          </Button>
        </div>

        {/* Sales Tab */}
        {activeTab === "sales" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-green-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Sales</p>
                      <p className="text-3xl font-bold text-white" data-testid="text-total-sales">
                        {salesData?.totalSales || 0}
                      </p>
                    </div>
                    <DollarSign className="h-10 w-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-green-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Your Earnings</p>
                      <p className="text-3xl font-bold text-green-400" data-testid="text-total-earnings">
                        {salesData?.totalEarningsFormatted || "$0.00"}
                      </p>
                    </div>
                    <ArrowUpRight className="h-10 w-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-orange-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Passed Up (Sale #2)</p>
                      <p className="text-3xl font-bold text-orange-400" data-testid="text-passed-up">
                        {salesData?.passedUpAmountFormatted || "$0.00"}
                      </p>
                    </div>
                    <ArrowDownRight className="h-10 w-10 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pass-Up Explanation */}
            <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30">
              <CardContent className="pt-6">
                <h3 className="text-orange-300 font-bold mb-2">📋 How Pass-Up Works</h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li><span className="text-green-400">✓ Sale #1:</span> You keep 100%</li>
                  <li><span className="text-orange-400">↗ Sale #2:</span> Passed up to your sponsor (platform cost)</li>
                  <li><span className="text-green-400">✓ Sale #3+:</span> You keep 100% forever</li>
                </ul>
              </CardContent>
            </Card>

            {/* Sales History */}
            <Card className="bg-slate-800 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-300">📊 Sales History</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSales ? (
                  <p className="text-slate-400">Loading sales...</p>
                ) : salesData?.sales?.length > 0 ? (
                  <div className="space-y-3">
                    {salesData.sales.map((sale: any, index: number) => (
                      <div 
                        key={sale.id || index}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          sale.wasPassedUp 
                            ? "bg-orange-500/10 border border-orange-500/30" 
                            : "bg-green-500/10 border border-green-500/30"
                        }`}
                        data-testid={`sale-row-${index}`}
                      >
                        <div>
                          <span className="text-white font-bold">Sale #{sale.saleNumber}</span>
                          <p className="text-slate-400 text-sm">{sale.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {sale.wasPassedUp ? (
                              <span className="text-orange-400">
                                {sale.amountFormatted} <span className="text-xs">→ Passed Up</span>
                              </span>
                            ) : (
                              <span className="text-green-400">
                                +{sale.amountFormatted}
                              </span>
                            )}
                          </p>
                          <p className={`text-sm ${sale.wasPassedUp ? "text-orange-300" : "text-green-300"}`}>
                            You received: {sale.youReceived}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No sales yet</p>
                    <p className="text-slate-500 text-sm mt-2">Share your affiliate link to start earning!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === "referrals" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-blue-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Referrals</p>
                      <p className="text-3xl font-bold text-white" data-testid="text-total-referrals">
                        {referralsData?.referralCount || 0}
                      </p>
                    </div>
                    <Users className="h-10 w-10 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-blue-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Referral Balance</p>
                      <p className="text-3xl font-bold text-green-400" data-testid="text-referral-balance">
                        ${((referralsData?.referralBalance || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-10 w-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Your Affiliate Link */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/30">
              <CardContent className="pt-6">
                <h3 className="text-blue-300 font-bold mb-2">🔗 Your Affiliate Link</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-900 p-3 rounded text-blue-200 text-sm">
                    sales.rentapog.com/?aff={user?.referralCode || user?.affiliateLink || "..."}
                  </code>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://sales.rentapog.com/?aff=${user?.referralCode || user?.affiliateLink}`);
                      toast({ title: "Link copied!" });
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-copy-affiliate-link"
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-slate-400 text-sm mt-2">Share this link to get referrals. When people sign up using your link, they appear below!</p>
              </CardContent>
            </Card>

            {/* Referrals List */}
            <Card className="bg-slate-800 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-300">👥 Your Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingReferrals ? (
                  <p className="text-slate-400">Loading referrals...</p>
                ) : referralsData?.referrals?.length > 0 ? (
                  <div className="space-y-3">
                    {referralsData.referrals.map((ref: any, index: number) => (
                      <div 
                        key={ref.id || index}
                        className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
                        data-testid={`referral-row-${index}`}
                      >
                        <div>
                          <span className="text-white font-bold">{index + 1}. {ref.name || "No name"}</span>
                          <p className="text-slate-400 text-sm">{ref.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-400">{ref.salesCount || 0}</p>
                          <p className="text-xs text-slate-400">sales</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No referrals yet</p>
                    <p className="text-slate-500 text-sm mt-2">Share your affiliate link above to start building your team!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Squeeze Pages Tab */}
        {activeTab === "squeeze" && (
          <Card className="bg-slate-800 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300">25 Pre-Built Squeeze Pages</CardTitle>
              <p className="text-slate-400 text-sm mt-2">Full-featured landing pages in different color schemes.</p>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Squeeze pages available for customization.</p>
            </CardContent>
          </Card>
        )}

        {/* Domain Setup Tab */}
        {activeTab === "domain" && (
          <div className="space-y-6">
            {/* Intro Explanation Card */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-300 text-xl">Get Your Custom Affiliate Link</CardTitle>
                <p className="text-slate-300 mt-3">
                  Instead of sharing ugly links like <span className="text-slate-500 line-through">rentapog.com/?aff=abc123</span>, 
                  you can get a clean, professional link that's easy to remember and share!
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <h4 className="text-cyan-300 font-bold mb-2">FREE Subdomain</h4>
                    <p className="text-slate-300 text-sm mb-2">Example: <strong className="text-cyan-200">john.rentapog.com</strong></p>
                    <ul className="text-slate-400 text-xs space-y-1">
                      <li>✓ Completely FREE forever</li>
                      <li>✓ Ready in seconds</li>
                      <li>✓ Perfect for beginners</li>
                      <li>✓ No technical setup needed</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                    <h4 className="text-emerald-300 font-bold mb-2">Your Own Domain</h4>
                    <p className="text-slate-300 text-sm mb-2">Example: <strong className="text-emerald-200">makemoney.com</strong></p>
                    <ul className="text-slate-400 text-xs space-y-1">
                      <li>✓ $8.99/year (own it forever)</li>
                      <li>✓ 100% your brand</li>
                      <li>✓ More professional</li>
                      <li>✓ Build long-term value</li>
                    </ul>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mt-4 text-center">
                  We recommend starting with a FREE subdomain, then upgrading to your own domain when you're ready!
                </p>
              </CardContent>
            </Card>

            {/* FREE Subdomain Registration */}
            <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-300 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Option 1: FREE Subdomain (Recommended for Beginners)
                </CardTitle>
                <p className="text-slate-400 text-sm mt-2">Get yourname.rentapog.com in 30 seconds - no cost, no catch!</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {userSubdomain ? (
                  <div className="bg-slate-800 border border-green-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-green-300 font-bold">Your Subdomain is Active!</span>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4 mb-4">
                      <p className="text-cyan-300 text-lg font-mono" data-testid="text-user-subdomain">
                        {userSubdomain}.rentapog.com
                      </p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                      <p className="text-green-200 font-bold mb-2">How to Use Your Subdomain:</p>
                      <ol className="text-slate-300 text-sm space-y-2">
                        <li><strong>1.</strong> Share your link on social media, emails, or anywhere online</li>
                        <li><strong>2.</strong> When someone clicks, they're automatically sent to the signup page</li>
                        <li><strong>3.</strong> They sign up with YOUR affiliate code attached</li>
                        <li><strong>4.</strong> You earn commissions on their purchases!</li>
                      </ol>
                    </div>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://${userSubdomain}.rentapog.com`);
                        toast({ title: "Link copied!" });
                      }}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                      data-testid="button-copy-subdomain"
                    >
                      Copy Your Subdomain Link
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Step by Step Instructions */}
                    <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-6">
                      <h3 className="text-cyan-300 font-bold mb-4">How It Works (3 Easy Steps):</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="bg-cyan-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                          <div>
                            <p className="text-white font-bold">Choose Your Name</p>
                            <p className="text-slate-400 text-sm">Pick a name you want (like your name, nickname, or brand)</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-cyan-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                          <div>
                            <p className="text-white font-bold">Click Register</p>
                            <p className="text-slate-400 text-sm">We'll create your subdomain instantly - no payment needed!</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-cyan-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                          <div>
                            <p className="text-white font-bold">Share Your Link</p>
                            <p className="text-slate-400 text-sm">Copy and share your new professional-looking link everywhere!</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Why Subdomain Benefits */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <h3 className="text-yellow-300 font-bold mb-3">Why Use a Subdomain?</h3>
                      <ul className="text-slate-300 space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span><strong>100% FREE Forever</strong> - No cost, no fees, no annual renewals!</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Looks Professional</strong> - "john.rentapog.com" looks way better than "rentapog.com/?aff=xyz123"</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Easy to Remember</strong> - Tell people "visit john.rentapog.com" - simple!</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Works Instantly</strong> - Ready to use the moment you register</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span><strong>No Technical Skills Needed</strong> - We handle everything for you</span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Registration Form */}
                    <div className="bg-slate-900 rounded-lg p-4">
                      <p className="text-white font-bold mb-3">Register Your FREE Subdomain Now:</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="yourname"
                          value={subdomainInput}
                          onChange={(e) => setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          className="bg-slate-800 border-slate-600 text-white text-lg"
                          data-testid="input-subdomain"
                        />
                        <span className="flex items-center text-cyan-300 font-mono">.rentapog.com</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-2">Use lowercase letters, numbers, and hyphens only (min 3 characters)</p>
                    </div>
                    <Button
                      onClick={handleSubdomainRegister}
                      disabled={subdomainLoading || subdomainInput.length < 3}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-14 text-lg"
                      data-testid="button-register-subdomain"
                    >
                      {subdomainLoading ? "Registering..." : "Get My FREE Subdomain Now"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* OR Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-slate-500 font-bold">OR</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* Dynadot Domain Registration */}
            <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-emerald-300 flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Register Your Domain with Dynadot
                </CardTitle>
                <p className="text-slate-400 text-sm mt-2">Get your own .com domain starting at just $8.99/year</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-800 border border-emerald-500/30 rounded-lg p-6">
                  <h3 className="text-emerald-300 font-bold mb-4">Why Dynadot?</h3>
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Lowest Prices:</strong> .com domains from $8.99/year - no hidden fees</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Free WHOIS Privacy:</strong> Keep your personal info protected</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Easy Domain Forwarding:</strong> Point your domain to your affiliate link in seconds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Free Email Forwarding:</strong> Get professional email at your domain</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><strong>24/7 Support:</strong> Help when you need it</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <p className="text-emerald-200 font-bold mb-2">Pro Tip:</p>
                  <p className="text-slate-300 text-sm">
                    Choose a short, memorable domain name that relates to your niche. For example: "quickcash.com", "earnfromhome.com", or use your own brand name.
                  </p>
                </div>

                <Button
                  onClick={() => window.open("https://www.dynadot.com/en/user/g_r_2025127145016?s6CrNG8X6G7U8N", "_blank")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-lg gap-2"
                  data-testid="button-register-dynadot"
                >
                  <ExternalLink className="h-5 w-5" /> Register Your Domain at Dynadot
                </Button>

                <p className="text-slate-500 text-xs text-center">
                  Opens in a new tab. After purchasing, come back here to set up forwarding.
                </p>
              </CardContent>
            </Card>

            {/* Domain Forwarding */}
            <Card className="bg-slate-800 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-300">Domain Forwarding</CardTitle>
                <p className="text-slate-400 text-sm mt-2">Forward your domain to your affiliate link automatically</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {userDomain && (
                  <div className="bg-slate-700 border border-cyan-500/30 rounded-lg p-6">
                    <h3 className="text-cyan-300 font-bold mb-4">Your Domain: {userDomain}.com</h3>
                    <p className="text-slate-300 mb-4">Forward to: sales.rentapog.com/?aff={userDomain}</p>
                    <Button
                      onClick={handleDomainForwarding}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                    >
                      Enable Domain Forwarding
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Marketing Guides Tab */}
        {activeTab === "guides" && (
          <Card className="bg-slate-800 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300">Marketing Guides</CardTitle>
              <p className="text-slate-400 text-sm mt-2">Proven strategies for cheap clicks and high conversion</p>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Marketing guides available.</p>
            </CardContent>
          </Card>
        )}

        {/* Coey AI Tab */}
        {activeTab === "coey" && (
          <Card className="bg-slate-800 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300">Coey: Your AI Assistant</CardTitle>
              <p className="text-slate-400 text-sm mt-2">Coey can help you with:</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">Making Websites</span>
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">Writing Ads</span>
                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">Coding Help</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Examples: 'Write a Facebook ad for RentAPog' or 'Create HTML for a landing page' or 'Help me with JavaScript code'"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={4}
                data-testid="textarea-coey-message"
              />
              <Button
                onClick={handleCoeyMessage}
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2"
                data-testid="button-ask-coey"
              >
                <MessageSquare className="h-4 w-4" /> {loading ? "Thinking..." : "Ask Coey"}
              </Button>
              {coeyResponse && (
                <div className={`border rounded-lg p-6 ${coeyResponse.startsWith("Error:") ? "bg-red-500/10 border-red-500/30" : "bg-slate-700 border-cyan-500/30"}`}>
                  <p className={`font-bold mb-3 ${coeyResponse.startsWith("Error:") ? "text-red-300" : "text-cyan-300"}`}>
                    {coeyResponse.startsWith("Error:") ? "Error:" : "Coey's Response:"}
                  </p>
                  <p className="text-slate-200 whitespace-pre-wrap" data-testid="text-coey-response">
                    {coeyResponse.startsWith("Error:") ? coeyResponse.replace("Error: ", "") : coeyResponse}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
