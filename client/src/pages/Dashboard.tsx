import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Globe, DollarSign, ArrowUpRight, AlertCircle, CheckCircle2, Mail, Settings, LogOut, CreditCard, BookOpen, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logoUrl from "@/assets/rentapog-logo.png";
import MarketingGuides from "@/pages/MarketingGuides";
import CoeyChat from "@/pages/CoeyChat";

// Mock Data for the new model
const recentSales = [
  { id: 1, domain: "crypto-wealth.net", amount: 45.00, date: "Today, 10:23 AM", status: "Paid to You", type: "Direct" },
  { id: 2, domain: "fast-funnels.io", amount: 45.00, date: "Today, 09:15 AM", status: "Sent to Admin", type: "Pass-Up (2nd Sale)" },
  { id: 3, domain: "ai-writer-tool.com", amount: 45.00, date: "Yesterday", status: "Paid to You", type: "Direct" },
  { id: 4, domain: "fitness-daily.org", amount: 45.00, date: "Yesterday", status: "Paid to You", type: "Direct" },
];

export default function Dashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayIncome: 0,
    activeRentals: 0,
    adminContribution: 0,
  });
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setUserProfile(parsedUser);
      } catch {
        // Invalid JSON, redirect to login
        navigate("/login");
      }
    } else {
      // No user found, redirect to login
      navigate("/login");
    }
    setLoading(false);
  }, [navigate]);

  // Fetch user's sales data
  useEffect(() => {
    if (!user?.id) return;

    const fetchSales = async () => {
      try {
        const response = await fetch(`/api/users/${user.id}/sales`);
        if (response.ok) {
          const salesData = await response.json();
          setSales(salesData);

          // Calculate stats from real data
          let todayIncome = 0;
          let adminContribution = 0;
          const activeRentalCount = salesData.length;

          salesData.forEach((sale: any) => {
            if (sale.passedUpTo === "admin") {
              adminContribution += sale.amount / 100; // Convert from cents
            } else {
              todayIncome += sale.amount / 100; // Convert from cents
            }
          });

          setStats({
            todayIncome,
            activeRentals: activeRentalCount,
            adminContribution,
          });
        }
      } catch (err) {
        console.error("Failed to fetch sales:", err);
      }
    };

    fetchSales();
  }, [user?.id]);

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/login");
  };

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Your affiliate link has been copied to clipboard.",
    });
  };

  if (loading) {
    return <div className="container py-10 text-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleConnectEmail = () => {
    toast({
      title: "Email Service Connection",
      description: "Backend required: To securely connect AWeber/Mailchimp API, we need to upgrade the project to Full Stack.",
      variant: "destructive"
    });
  };

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={logoUrl} alt="RentAPog" className="h-16 w-auto" data-testid="img-rentapog-logo" />
          <div>
            <p className="text-sm text-muted-foreground">Welcome back, {user.name || "User"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="gap-2"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* AFFILIATE LINK - Prominent at Top */}
      <Card className="border-2 border-red-500 shadow-lg bg-gradient-to-r from-red-50 via-white to-blue-50">
        <CardHeader className="bg-gradient-to-r from-red-100 to-blue-100">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Globe className="h-5 w-5" />
            Your Affiliate Link
          </CardTitle>
          <p className="text-sm text-red-600 mt-2">Share this link to earn commissions on referrals</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="bg-white border-2 border-red-200 p-4 rounded-lg flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Your Referral Code</p>
              <p className="font-bold text-lg text-red-600" data-testid="text-referral-code">
                {userProfile?.referralCode || "Loading..."}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleCopyLink(userProfile?.referralCode || "")}
              className="gap-2"
              data-testid="button-copy-referral-code"
              disabled={!userProfile?.referralCode}
            >
              <Copy className="h-4 w-4" />
              Copy Code
            </Button>
          </div>

          <div className="bg-white border-2 border-red-200 p-4 rounded-lg flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Your Full Affiliate Link</p>
              <p className="font-mono text-sm text-red-600 break-all" data-testid="text-affiliate-link">
                https://rentapog.com/ref/{userProfile?.referralCode || "..."}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleCopyLink(`https://rentapog.com/ref/${userProfile?.referralCode || ""}`)}
              className="gap-2"
              data-testid="button-copy-affiliate-link"
              disabled={!userProfile?.referralCode}
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
            <p className="font-bold text-blue-900 mb-2">💡 How It Works:</p>
            <ul className="text-blue-800 space-y-1">
              <li>✓ Share your link with 3 friends</li>
              <li>✓ Their 1st sale = 100% to you</li>
              <li>✓ Their 2nd sale goes to admin</li>
              <li>✓ Their 3rd+ sales = 100% to you forever</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* STRIPE SETUP - Prominent at Top */}
      <Card className="border-2 border-blue-500 shadow-lg">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Connect Your Stripe Account
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Set up instant payouts to your bank account</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Why Section */}
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Why Connect Stripe?
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>✓ <strong>Get Paid Instantly</strong> - When your referrals make sales, money goes straight to your bank account</p>
              <p>✓ <strong>Real-Time Tracking</strong> - See all your earnings and payouts in your Stripe dashboard</p>
              <p>✓ <strong>Professional & Secure</strong> - Stripe handles all payments securely and compliantly</p>
              <p>✓ <strong>No Hidden Fees</strong> - Transparent pricing, you keep 100% of your eligible earnings</p>
            </div>
          </div>

          {/* Connect Button */}
          <div className="flex gap-3">
            <a 
              href="https://connect.stripe.com/d/setup/e/_TVohM6p16oSNkQnJJVIeHCUspX/YWNjdF8xU1luM2xCbjcwWGNxOFA4/2995fdb689351822c"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" data-testid="button-connect-stripe">
                <CreditCard className="h-5 w-5 mr-2" />
                Connect Stripe Account
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.todayIncome.toFixed(2)}</div>
            <p className="text-xs opacity-75 pt-1">Available for instant payout</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRentals}</div>
            <p className="text-xs text-muted-foreground">Total referral sales made</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Contribution</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${stats.adminContribution.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Your 2nd sales that went to admin</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="activity">Sales Activity</TabsTrigger>
          <TabsTrigger value="domains">My Domains</TabsTrigger>
          <TabsTrigger value="guides">Marketing Guides</TabsTrigger>
          <TabsTrigger value="coey">Ask Coey</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4 mt-4">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Sales Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          sale.type.includes("Pass-Up") 
                            ? "bg-orange-100 text-orange-600" 
                            : "bg-green-100 text-green-600"
                        }`}>
                          {sale.type.includes("Pass-Up") ? <ArrowUpRight className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{sale.domain}</p>
                          <p className="text-xs text-muted-foreground">{sale.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${
                          sale.type.includes("Pass-Up") ? "text-muted-foreground line-through" : "text-green-600"
                        }`}>
                          ${sale.amount.toFixed(2)}
                        </span>
                        <p className="text-xs text-muted-foreground">{sale.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
               {/* Admin Fee Explanation */}
               <Card className="bg-slate-50 border-dashed border-2">
                 <CardHeader>
                   <CardTitle className="text-base flex items-center gap-2">
                     <AlertCircle className="h-4 w-4 text-blue-500" />
                     How the System Works
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="text-sm space-y-4">
                   <p>To keep this platform free of monthly subscription fees, we use a "One-Time Pass-Up" model.</p>
                   
                   <div className="space-y-2">
                     <div className="flex items-center justify-between p-2 bg-white rounded border">
                       <span>Sale #1</span>
                       <span className="text-green-600 font-bold text-xs uppercase flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> 100% Yours</span>
                     </div>
                     <div className="flex items-center justify-between p-2 bg-orange-50 border border-orange-100 rounded opacity-80">
                       <span>Sale #2</span>
                       <span className="text-orange-600 font-bold text-xs uppercase flex items-center gap-1"><ArrowUpRight className="h-3 w-3"/> Sent to Admin</span>
                     </div>
                     <div className="flex items-center justify-between p-2 bg-white rounded border">
                       <span>Sale #3+</span>
                       <span className="text-green-600 font-bold text-xs uppercase flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> 100% Yours</span>
                     </div>
                   </div>
                   
                   <p className="text-xs text-muted-foreground pt-2">
                     This covers server costs, API maintenance, and support so you don't have to pay monthly.
                   </p>
                 </CardContent>
               </Card>

               {/* API Key Safety Notice */}
               <Card className="bg-blue-50 border-blue-100">
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm text-blue-800">Safe Setup Guide</CardTitle>
                 </CardHeader>
                 <CardContent className="text-xs text-blue-700 space-y-2">
                   <p>
                     <strong>Don't worry about suspension.</strong> To keep your account safe:
                   </p>
                   <ul className="list-disc pl-4 space-y-1">
                     <li>Never paste API keys directly into the code files.</li>
                     <li>Use "Secrets" (Environment Variables) in Replit to store your Stripe & Namecheap keys.</li>
                     <li>This mockup is safe because it's just a visual demo.</li>
                   </ul>
                 </CardContent>
               </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="guides" className="mt-4">
          <MarketingGuides />
        </TabsContent>

        <TabsContent value="coey" className="mt-4">
          <CoeyChat />
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Mail className="h-5 w-5" />
                 Email Marketing Integration
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800 flex items-start gap-3">
                   <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                   <div>
                      <p className="font-bold">Backend Required</p>
                      <p>To securely connect to AWeber or other email services, we need to upgrade this project to a Full Stack application. This allows us to securely store your API keys and handle the data transmission.</p>
                   </div>
                </div>

                <div className="space-y-4 max-w-md">
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Provider</label>
                      <select className="w-full h-10 rounded-md border px-3 text-sm">
                         <option>AWeber</option>
                         <option>Mailchimp</option>
                         <option>GetResponse</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium">API Key</label>
                      <Input type="password" placeholder="Enter API Key (e.g. Aw~...)" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium">List ID</label>
                      <Input placeholder="Unique List ID" />
                   </div>
                   <Button onClick={handleConnectEmail}>Connect Service</Button>
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="packages" className="mt-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Upgrade Your Account</h2>
              <p className="text-muted-foreground">Choose the perfect package to maximize your earnings</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Starter Package */}
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Starter Package</CardTitle>
                  <p className="text-3xl font-bold text-gray-700 mt-2">$20<span className="text-sm text-gray-500">/day</span></p>
                  <p className="text-sm text-gray-600 mt-1">GST included</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">Perfect for beginners to start earning daily</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Daily payouts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Basic dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Email support</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500">Pay when you add your first domain</p>
                </CardContent>
              </Card>

              {/* Silver Package */}
              <Card className="border-2 border-red-400 shadow-lg">
                <CardHeader className="bg-red-50">
                  <div className="inline-block bg-red-600 text-white px-2 py-1 rounded text-xs font-bold mb-2">Popular Choice</div>
                  <CardTitle className="text-lg text-red-600">Silver Package</CardTitle>
                  <p className="text-3xl font-bold text-red-600 mt-2">$49<span className="text-sm text-red-500">/day</span></p>
                  <p className="text-sm text-red-600 mt-1">GST included</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">Popular choice for active earners</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Daily payouts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Advanced dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-red-600 hover:bg-red-700">Upgrade Now</Button>
                </CardContent>
              </Card>

              {/* Gold Package */}
              <Card className="border-2 border-blue-400">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-lg text-blue-600">Gold Package</CardTitle>
                  <p className="text-3xl font-bold text-blue-600 mt-2">$99<span className="text-sm text-blue-500">/day</span></p>
                  <p className="text-sm text-blue-600 mt-1">GST included</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">For serious scale-minded affiliates</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Daily payouts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Analytics & reports</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>VIP support</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Upgrade Now</Button>
                </CardContent>
              </Card>

              {/* Platinum Package */}
              <Card className="border-2 border-purple-400">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-lg text-purple-600">Platinum Package</CardTitle>
                  <p className="text-3xl font-bold text-purple-600 mt-2">$199<span className="text-sm text-purple-500">/day</span></p>
                  <p className="text-sm text-purple-600 mt-1">GST included</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">Elite tier for maximum earnings</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Daily payouts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Full analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Dedicated support</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Upgrade Now</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
