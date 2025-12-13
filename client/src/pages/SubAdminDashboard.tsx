import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, DollarSign, Users, TrendingUp, LogOut, Settings, ExternalLink, Globe, Zap, Sparkles, CheckCircle, Loader2, Eye, Rocket, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logoUrl from "@/assets/rentapog-logo.png";

interface DashboardData {
  user: {
    id: string;
    email: string;
    name: string;
    referralCode: string;
    affiliateLink: string;
    packagesLink: string;
    subdomain?: string;
    stripeAccountId?: string;
  };
  stats: {
    totalSales: number;
    mySalesCount: number;
    passedUpCount: number;
    myEarnings: number;
    passedUpAmount: number;
    referralsCount: number;
  };
  recentSales: Array<{
    id: number;
    amount: string;
    saleNumber: number;
    passedUpTo: string | null;
    passedUpReason: string | null;
    date: string;
  }>;
  referrals: Array<{
    id: string;
    email: string;
    name: string;
    packagePurchased: string | null;
    createdAt: string;
  }>;
}

export default function SubAdminDashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", password: "" });
  const [updating, setUpdating] = useState(false);
  
  // Subdomain state
  const [subdomainInput, setSubdomainInput] = useState("");
  const [subdomainLoading, setSubdomainLoading] = useState(false);
  const [userSubdomain, setUserSubdomain] = useState<string | null>(null);
  
  // Purchased domains state
  const [purchasedDomains, setPurchasedDomains] = useState<any[]>([]);
  const [purchasedDomainsLoading, setPurchasedDomainsLoading] = useState(false);
  
  // AI Site Generator state
  const [userSites, setUserSites] = useState<any[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [generatingSiteId, setGeneratingSiteId] = useState<number | null>(null);
  const [deployingSiteId, setDeployingSiteId] = useState<number | null>(null);
  const [siteDescriptions, setSiteDescriptions] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("/api/sub-admin/dashboard", {
          credentials: "include",
        });
        
        if (response.status === 401 || response.status === 403) {
          navigate("/login");
          return;
        }
        
        if (response.ok) {
          const result = await response.json();
          setData(result);
          setProfileForm({
            name: result.user.name || "",
            email: result.user.email || "",
            password: "",
          });
          setUserSubdomain(result.user.subdomain || null);
          
          // Fetch additional data
          fetchPurchasedDomains();
          fetchUserSites();
        }
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const fetchPurchasedDomains = async () => {
    setPurchasedDomainsLoading(true);
    try {
      const res = await fetch("/api/user/purchased-domains", { credentials: "include" });
      if (res.ok) {
        const result = await res.json();
        setPurchasedDomains(result.domains || []);
      }
    } catch (err) {
      console.error("Failed to fetch purchased domains:", err);
    } finally {
      setPurchasedDomainsLoading(false);
    }
  };

  const fetchUserSites = async () => {
    setSitesLoading(true);
    try {
      const res = await fetch("/api/user/sites", { credentials: "include" });
      if (res.ok) {
        const result = await res.json();
        setUserSites(result.sites || []);
      }
    } catch (err) {
      console.error("Failed to fetch user sites:", err);
    } finally {
      setSitesLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "user=; domain=.rentapog.com; path=/; max-age=0";
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
      description: "Link copied to clipboard.",
    });
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const response = await fetch("/api/sub-admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
          password: profileForm.password || undefined,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        });
        setProfileForm({ ...profileForm, password: "" });
        if (data) {
          setData({
            ...data,
            user: { ...data.user, name: result.user.name, email: result.user.email },
          });
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSubdomainRegister = async () => {
    if (!data?.user?.id || subdomainInput.length < 3) return;
    
    setSubdomainLoading(true);
    try {
      const res = await fetch("/api/subdomain/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: data.user.id,
          subdomain: subdomainInput,
        }),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setUserSubdomain(subdomainInput);
        toast({
          title: "Subdomain Registered!",
          description: `Your subdomain ${subdomainInput}.rentapog.com is now active!`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to register subdomain",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to register subdomain",
        variant: "destructive",
      });
    } finally {
      setSubdomainLoading(false);
    }
  };

  const handleCreateSite = async (domain: any) => {
    if (!data?.user?.id) return;
    
    try {
      const res = await fetch("/api/user/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          purchasedDomainId: domain.id,
          domainName: domain.domainName,
        }),
      });
      
      if (res.ok) {
        const result = await res.json();
        if (result.alreadyExists) {
          toast({
            title: "Site Already Exists",
            description: "You already have a site for this domain.",
          });
        } else {
          toast({
            title: "Site Created",
            description: "Now generate your AI-powered landing page!",
          });
        }
        fetchUserSites();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create site",
        variant: "destructive",
      });
    }
  };

  const handleGenerateSite = async (siteId: number) => {
    setGeneratingSiteId(siteId);
    try {
      const description = siteDescriptions[siteId] || "";
      const res = await fetch(`/api/user/sites/${siteId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ description }),
      });
      
      if (res.ok) {
        toast({
          title: "Site Generated!",
          description: "Your AI-powered landing page is ready!",
        });
        if (data?.user?.id) {
          fetchUserSites();
        }
      } else {
        const result = await res.json();
        toast({
          title: "Error",
          description: result.error || "Failed to generate site",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate site",
        variant: "destructive",
      });
    } finally {
      setGeneratingSiteId(null);
    }
  };

  const handleDeploySite = async (siteId: number) => {
    setDeployingSiteId(siteId);
    try {
      const res = await fetch(`/api/user/sites/${siteId}/deploy`, {
        method: "POST",
        credentials: "include",
      });
      
      if (res.ok) {
        const result = await res.json();
        toast({
          title: "Site Deployed!",
          description: `Your site is live at ${result.liveUrl}`,
        });
        if (data?.user?.id) {
          fetchUserSites();
        }
      } else {
        const result = await res.json();
        toast({
          title: "Error",
          description: result.error || "Failed to deploy site",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to deploy site",
        variant: "destructive",
      });
    } finally {
      setDeployingSiteId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="RentAPog" className="h-10 w-10" />
            <div>
              <h1 className="font-bold text-xl text-blue-900">Sub-Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome, {data.user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-my-earnings">
                ${data.stats.myEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.stats.mySalesCount} sales credited to you
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-sales">
                {data.stats.totalSales}
              </div>
              <p className="text-xs text-muted-foreground">
                From your referral link
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referrals</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-referrals-count">
                {data.stats.referralsCount}
              </div>
              <p className="text-xs text-muted-foreground">
                People signed up with your link
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass-Ups</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500" data-testid="text-passed-up">
                ${data.stats.passedUpAmount.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.stats.passedUpCount} sales passed up
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Affiliate Links */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Your Affiliate Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">Homepage Link</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyLink(`https://${data.user.affiliateLink}`)}
                    data-testid="button-copy-affiliate"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-white rounded border text-sm" data-testid="text-affiliate-link">
                    {data.user.affiliateLink}
                  </code>
                  <a
                    href={`https://${data.user.affiliateLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">Packages Link</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyLink(`https://${data.user.packagesLink}`)}
                    data-testid="button-copy-packages"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-white rounded border text-sm" data-testid="text-packages-link">
                    {data.user.packagesLink}
                  </code>
                  <a
                    href={`https://${data.user.packagesLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {userSubdomain && (
                <div className="p-4 bg-cyan-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-cyan-900">Your Subdomain</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyLink(`https://${userSubdomain}.rentapog.com`)}
                      data-testid="button-copy-subdomain"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white rounded border text-sm font-bold text-cyan-700" data-testid="text-subdomain-link">
                      {userSubdomain}.rentapog.com
                    </code>
                    <a
                      href={`https://${userSubdomain}.rentapog.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:text-cyan-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How Commissions Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="font-semibold text-green-800">1st Sale</div>
                  <div className="text-green-700">100% goes to YOU</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="font-semibold text-blue-800">2nd Sale</div>
                  <div className="text-blue-700">Goes to YOU (Sub-Admin Perk!)</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="font-semibold text-green-800">3rd+ Sales</div>
                  <div className="text-green-700">100% goes to YOU</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FREE Subdomain Registration */}
        {!userSubdomain && (
          <Card className="mb-8 border-2 border-cyan-200">
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                FREE Subdomain - Get Your Custom Link!
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <p className="text-cyan-800 mb-3">
                  Instead of sharing ugly links like <span className="text-slate-500 line-through">rentapog.com/?aff=abc123</span>, 
                  get a clean link like <strong className="text-cyan-700">yourname.rentapog.com</strong> - for FREE!
                </p>
              </div>
              
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                <p className="font-bold text-slate-800 mb-3">Register Your FREE Subdomain:</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="yourname"
                    value={subdomainInput}
                    onChange={(e) => setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="text-lg"
                    data-testid="input-subdomain"
                  />
                  <span className="flex items-center text-cyan-700 font-mono font-bold">.rentapog.com</span>
                </div>
                <p className="text-slate-500 text-xs mt-2">Lowercase letters, numbers, hyphens only (min 3 characters)</p>
              </div>
              <Button
                onClick={handleSubdomainRegister}
                disabled={subdomainLoading || subdomainInput.length < 3}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-12 text-lg"
                data-testid="button-register-subdomain"
              >
                {subdomainLoading ? "Registering..." : "Get My FREE Subdomain Now"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* My Purchased Domains */}
        {purchasedDomains.length > 0 && (
          <Card className="mb-8 border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                My Domains ({purchasedDomains.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {purchasedDomainsLoading ? (
                <p className="text-center text-slate-500">Loading domains...</p>
              ) : (
                <div className="space-y-3">
                  {purchasedDomains.map((domain: any) => (
                    <div key={domain.id} className="bg-white border-2 border-purple-200 rounded-lg p-4" data-testid={`domain-card-${domain.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-purple-700 text-lg">{domain.domainName}</p>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${domain.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {domain.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm mb-3">
                        Expires: {domain.expiresAt ? new Date(domain.expiresAt).toLocaleDateString() : 'N/A'}
                      </p>
                      <Button
                        onClick={() => handleCreateSite(domain)}
                        variant="outline"
                        size="sm"
                        className="border-purple-300"
                        data-testid={`button-create-site-${domain.id}`}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create AI Site
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Site Generator */}
        {userSites.length > 0 && (
          <Card className="mb-8 border-2 border-emerald-200">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Site Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {sitesLoading ? (
                <p className="text-center text-slate-500">Loading sites...</p>
              ) : (
                <div className="space-y-4">
                  {userSites.map((site: any) => (
                    <div key={site.id} className="bg-white border-2 border-emerald-200 rounded-lg p-4" data-testid={`site-card-${site.id}`}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-emerald-700 text-lg">{site.domainName}</p>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          site.status === 'published' ? 'bg-green-100 text-green-700' : 
                          site.status === 'generated' ? 'bg-blue-100 text-blue-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {site.status}
                        </span>
                      </div>
                      
                      {site.status === 'draft' && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm text-slate-600">Describe your business (optional)</Label>
                            <Textarea
                              placeholder="e.g., I help people make money online through affiliate marketing..."
                              value={siteDescriptions[site.id] || ""}
                              onChange={(e) => setSiteDescriptions({ ...siteDescriptions, [site.id]: e.target.value })}
                              className="mt-1"
                              data-testid={`textarea-description-${site.id}`}
                            />
                          </div>
                          <Button
                            onClick={() => handleGenerateSite(site.id)}
                            disabled={generatingSiteId === site.id}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            data-testid={`button-generate-${site.id}`}
                          >
                            {generatingSiteId === site.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating with AI...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate AI Landing Page
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      
                      {site.status === 'generated' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleDeploySite(site.id)}
                            disabled={deployingSiteId === site.id}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            data-testid={`button-deploy-${site.id}`}
                          >
                            {deployingSiteId === site.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Deploying...
                              </>
                            ) : (
                              <>
                                <Rocket className="h-4 w-4 mr-2" />
                                Deploy to Live
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleGenerateSite(site.id)}
                            disabled={generatingSiteId === site.id}
                            variant="outline"
                            data-testid={`button-regenerate-${site.id}`}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Regenerate
                          </Button>
                        </div>
                      )}
                      
                      {site.status === 'published' && site.liveUrl && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <a
                            href={site.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {site.liveUrl}
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabs for Sales, Referrals, and Account Settings */}
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="sales" data-testid="tab-sales">Recent Sales</TabsTrigger>
            <TabsTrigger value="referrals" data-testid="tab-referrals">My Referrals</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Account Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                {data.recentSales.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No sales yet. Share your affiliate link to start earning!</p>
                ) : (
                  <div className="space-y-3">
                    {data.recentSales.map((sale) => (
                      <div
                        key={sale.id}
                        className={`p-4 rounded-lg flex items-center justify-between ${
                          sale.passedUpTo === "admin" ? "bg-orange-50" : "bg-green-50"
                        }`}
                        data-testid={`row-sale-${sale.id}`}
                      >
                        <div>
                          <div className="font-medium">
                            Sale #{sale.saleNumber} - ${sale.amount}
                          </div>
                          <div className="text-sm text-gray-600">{sale.date}</div>
                        </div>
                        <div className={`text-sm font-medium ${
                          sale.passedUpTo === "admin" ? "text-orange-600" : "text-green-600"
                        }`}>
                          {sale.passedUpTo === "admin" ? "Passed Up" : "Earned"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>My Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                {data.referrals.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No referrals yet. Share your link to get started!</p>
                ) : (
                  <div className="space-y-3">
                    {data.referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
                        data-testid={`row-referral-${referral.id}`}
                      >
                        <div>
                          <div className="font-medium">{referral.name || referral.email}</div>
                          <div className="text-sm text-gray-600">{referral.email}</div>
                        </div>
                        <div className="text-right">
                          {referral.packagePurchased ? (
                            <span className="text-green-600 font-medium">
                              ${referral.packagePurchased} Package
                            </span>
                          ) : (
                            <span className="text-gray-400">No package</span>
                          )}
                          <div className="text-xs text-gray-500">{referral.createdAt}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            {/* Stripe Connect Section */}
            {!data?.user.stripeAccountId && (
              <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    Connect Stripe to Get Paid
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-700">
                    Connect your Stripe account to receive commissions from sales. This is required to get paid!
                  </p>

                  <Button
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/stripe/connect-url", { credentials: "include" });
                        const data = await res.json();
                        if (data.url) {
                          window.location.href = data.url;
                        } else {
                          toast({ title: "Error", description: data.error || "Could not get Stripe link", variant: "destructive" });
                        }
                      } catch (err) {
                        toast({ title: "Error", description: "Failed to connect to Stripe", variant: "destructive" });
                      }
                    }}
                    data-testid="button-connect-stripe"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Connect Stripe Account
                  </Button>

                  <p className="text-xs text-slate-600 text-center">
                    Secure connection - Your account details are never shared with us
                  </p>
                </CardContent>
              </Card>
            )}

            {data?.user.stripeAccountId && (
              <Card className="mb-6 border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">Stripe Connected!</p>
                      <p className="text-sm text-green-600">You're all set to receive payments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="settings-name">Name</Label>
                    <Input
                      id="settings-name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Your name"
                      data-testid="input-settings-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="settings-email">Email</Label>
                    <Input
                      id="settings-email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="your@email.com"
                      data-testid="input-settings-email"
                    />
                    <p className="text-xs text-gray-500">This will be your new login email</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="settings-password">New Password</Label>
                    <Input
                      id="settings-password"
                      type="password"
                      value={profileForm.password}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                      placeholder="Leave blank to keep current"
                      data-testid="input-settings-password"
                    />
                    <p className="text-xs text-gray-500">Min 6 characters. Leave blank to keep your current password.</p>
                  </div>
                  
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={updating}
                    className="w-full"
                    data-testid="button-save-settings"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
