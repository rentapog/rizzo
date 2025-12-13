import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Copy, CheckCircle2, AlertCircle, LogOut, LogIn, Link, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DomainControlPanel() {
  const [, navigate] = useLocation();
  const [domains, setDomains] = useState<any[]>([]);
  const [customDomains, setCustomDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [forwardingUrl, setForwardingUrl] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [registeringCustom, setRegisteringCustom] = useState(false);
  const [showDNSInstructions, setShowDNSInstructions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchUserDomains(parsedUser.id);
    fetchCustomDomains(parsedUser.id);
  }, [navigate]);

  const fetchUserDomains = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/domains`);
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      }
    } catch (err) {
      console.error("Failed to fetch domains:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomDomains = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/affiliate-pages`);
      if (response.ok) {
        const data = await response.json();
        setCustomDomains(data);
      }
    } catch (err) {
      console.error("Failed to fetch affiliate pages:", err);
    }
  };

  const handleSaveForwarding = async (domainId: number) => {
    if (!forwardingUrl) {
      toast({
        title: "Error",
        description: "Please enter a forwarding URL",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/domains/${domainId}/forwarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forwardUrl: forwardingUrl }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Domain forwarding saved!",
        });
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        fetchUserDomains(userData.id);
        setForwardingUrl("");
        setSelectedDomain(null);
      } else {
        toast({
          title: "Error",
          description: "Failed to save forwarding",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyAffiliateLink = (domain: string) => {
    const affiliateLink = `https://${domain}/?aff=${user?.referralCode}`;
    navigator.clipboard.writeText(affiliateLink);
    toast({
      title: "✓ Copied!",
      description: "Your affiliate link copied to clipboard",
    });
  };

  const handleRegisterCustomDomain = async () => {
    if (!customDomainInput.trim()) {
      toast({ title: "Please enter a page name", variant: "destructive" });
      return;
    }

    setRegisteringCustom(true);
    try {
      const res = await fetch("/api/affiliate-pages/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          slug: customDomainInput.trim(),
          displayName: customDomainInput.trim().charAt(0).toUpperCase() + customDomainInput.trim().slice(1),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "✓ Affiliate page created!",
          description: `Your page is live at ${data.url}`,
        });
        setCustomDomainInput("");
        fetchCustomDomains(user.id);
      } else {
        const data = await res.json();
        toast({
          title: "Creation failed",
          description: data.message || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setRegisteringCustom(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your domains...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Your Domains</h1>
          <p className="text-slate-600">Manage your registered domains and affiliate links</p>
        </div>

        {/* Registered Domains Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Registered Domains</h2>
          {domains.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center pb-12">
                <Globe className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No domains registered yet</p>
                <p className="text-sm text-slate-500 mb-6">Register your first domain to get started</p>
                <Button onClick={() => navigate("/domains/register")} className="bg-blue-600 hover:bg-blue-700">
                  Register Domain
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {domains.map((domain) => (
                <Card key={domain.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="h-6 w-6 text-blue-600" />
                        <div>
                          <CardTitle className="text-xl">{domain.domainName}</CardTitle>
                          <p className="text-xs text-slate-500 mt-1">
                            Status: <span className="text-green-600 font-semibold">Active</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        ${(domain.dailyRate / 100).toFixed(2)}/day
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Affiliate Link Section */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4 text-green-600" />
                        <h3 className="font-semibold text-green-900">Your Affiliate Link</h3>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          readOnly
                          value={`https://${domain.domainName}/?aff=${user?.referralCode}`}
                          className="bg-white flex-1 text-sm"
                        />
                        <Button
                          onClick={() => handleCopyAffiliateLink(domain.domainName)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-green-700">
                        Share this link to earn commissions from referrals!
                      </p>
                    </div>

                    {/* Domain Forwarding Section */}
                    {selectedDomain === domain.id ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                        <label className="text-sm font-medium">Forward to URL</label>
                        <Input
                          placeholder="https://youraffiliate.com"
                          value={forwardingUrl}
                          onChange={(e) => setForwardingUrl(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSaveForwarding(domain.id)}
                            disabled={saving}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            {saving ? "Saving..." : "Save Forwarding"}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedDomain(null);
                              setForwardingUrl("");
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setSelectedDomain(domain.id)}
                        variant="outline"
                        className="w-full"
                      >
                        {domain.forwardUrl ? "Update Forwarding" : "Set Domain Forwarding"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Domain Forwarding & Masking Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Forward Your Domains</h2>
            <Card className="border-2 border-green-200">
              <CardContent className="pt-8">
                <p className="text-slate-600 mb-6">
                  Have your own domains registered? Create a branded affiliate page here, then forward your domain to it.
                </p>

                <div className="space-y-6">
                  {/* Create Branded Page */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Step 1: Create Your Branded Page</h3>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 flex items-center border border-slate-300 rounded-lg bg-white">
                        <span className="px-3 text-slate-500 font-medium">rentapog.com/affiliate/</span>
                        <Input
                          placeholder="e.g. rentariz (from rentariz.com)"
                          value={customDomainInput}
                          onChange={(e) => setCustomDomainInput(e.target.value.toLowerCase())}
                          className="border-0"
                        />
                      </div>
                      <Button
                        onClick={handleRegisterCustomDomain}
                        disabled={registeringCustom}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {registeringCustom ? "Creating..." : "Create"}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      💡 Enter just your brand name (no .com) - e.g., if your domain is rentariz.com, enter "rentariz"
                    </p>
                  </div>

                  {customDomains.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-900">Step 2: Get Your Forwarding Link</h3>
                      
                      {customDomains.map((page) => (
                        <div key={page.id} className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{page.displayName}</p>
                              <p className="text-xs text-slate-500">Copy this link and paste into your registrar</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(`https://rentapog.com/forward/${page.slug}`);
                                toast({ title: "✓ Forwarding Link Copied!" });
                              }}
                              className="bg-green-100 hover:bg-green-200 border-green-300"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </Button>
                          </div>

                          <div className="bg-white border-2 border-green-400 rounded p-3 space-y-1">
                            <p className="text-xs text-slate-500 font-medium">PASTE THIS INTO YOUR DOMAIN REGISTRAR:</p>
                            <p className="text-sm font-mono font-bold text-slate-900 break-all">
                              https://rentapog.com/forward/{page.slug}
                            </p>
                          </div>

                          <details className="cursor-pointer bg-white rounded border border-slate-200 p-3">
                            <summary className="text-xs font-semibold text-slate-700 hover:text-slate-900">
                              ▶ Where to paste this link in your registrar
                            </summary>
                            <div className="mt-3 space-y-2 text-xs text-slate-700">
                              <p><strong>GoDaddy:</strong> Domains → Domain Settings → Forwarding → "Forward to URL"</p>
                              <p><strong>Namecheap:</strong> Dashboard → Advanced DNS → Redirect section</p>
                              <p><strong>Bluehost:</strong> Domains → Domain Forwarding</p>
                              <p><strong>Any registrar:</strong> Look for "URL Forwarding" or "Domain Forwarding"</p>
                            </div>
                          </details>

                          <Button
                            size="sm"
                            onClick={() => window.open(`https://rentapog.com/forward/${page.slug}`, "_blank")}
                            variant="outline"
                            className="w-full text-xs"
                          >
                            Test Link
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Domain Masking Guide */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Domain Masking Guide</h2>
            <Card className="border-2 border-blue-200">
              <CardContent className="pt-8 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">What is Domain Masking?</p>
                  <p className="text-sm text-blue-800">
                    Domain masking (URL cloaking) forwards your domain while keeping your original domain visible in the browser URL bar. 
                    Users see <strong>yourdomain.com</strong> instead of rentapog.com/affiliate/yourname
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Masking Setup by Registrar</h3>
                  
                  {/* GoDaddy */}
                  <details className="border border-slate-200 rounded-lg p-4 cursor-pointer hover:bg-slate-50">
                    <summary className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>🔷 GoDaddy</span>
                    </summary>
                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Go to <strong>My Products</strong> → <strong>Domains</strong></li>
                        <li>Click the domain → <strong>DNS</strong></li>
                        <li>Look for <strong>Forwarding</strong> section (or go to Domain Settings)</li>
                        <li>Click <strong>Forward to URL</strong></li>
                        <li>Select <strong>"Masking (Cloaked)"</strong> option</li>
                        <li>Paste your page URL: <code className="bg-white p-1 rounded">https://rentapog.com/affiliate/yourname</code></li>
                        <li>Save and wait 24-48 hours for activation</li>
                      </ol>
                    </div>
                  </details>

                  {/* Namecheap */}
                  <details className="border border-slate-200 rounded-lg p-4 cursor-pointer hover:bg-slate-50">
                    <summary className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>🔷 Namecheap</span>
                    </summary>
                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Go to <strong>Domain List</strong> → Click your domain</li>
                        <li>Go to <strong>Advanced DNS</strong></li>
                        <li>Look for <strong>Redirect</strong> section</li>
                        <li>Click <strong>Add New Record</strong></li>
                        <li>Select type: <strong>"URL Redirect (Masked)"</strong></li>
                        <li>Paste your page URL in the <strong>Redirect to</strong> field</li>
                        <li>Click <strong>Save All Changes</strong></li>
                      </ol>
                    </div>
                  </details>

                  {/* Bluehost */}
                  <details className="border border-slate-200 rounded-lg p-4 cursor-pointer hover:bg-slate-50">
                    <summary className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>🔷 Bluehost</span>
                    </summary>
                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Go to <strong>Domains</strong> → Click your domain</li>
                        <li>Find <strong>Domain Forwarding</strong></li>
                        <li>Choose <strong>Masked Redirect</strong></li>
                        <li>Paste your page URL</li>
                        <li>Check <strong>"Mask this redirect"</strong></li>
                        <li>Save changes</li>
                      </ol>
                    </div>
                  </details>

                  {/* 1&1 Ionos */}
                  <details className="border border-slate-200 rounded-lg p-4 cursor-pointer hover:bg-slate-50">
                    <summary className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>🔷 1&1 Ionos</span>
                    </summary>
                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Go to <strong>Domains</strong> → Select your domain</li>
                        <li>Click <strong>Edit DNS Settings</strong></li>
                        <li>Find <strong>URL Forwarding</strong></li>
                        <li>Select <strong>Masked Forwarding</strong></li>
                        <li>Paste your page URL</li>
                        <li>Click <strong>Save</strong></li>
                      </ol>
                    </div>
                  </details>

                  {/* Other */}
                  <details className="border border-slate-200 rounded-lg p-4 cursor-pointer hover:bg-slate-50">
                    <summary className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>🔷 Other Registrars</span>
                    </summary>
                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                      <p className="font-semibold">Look for one of these options in your registrar's DNS/forwarding settings:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Masked Redirect</strong></li>
                        <li><strong>URL Cloaking</strong></li>
                        <li><strong>Domain Masking</strong></li>
                        <li><strong>Permanent Masked Redirect</strong></li>
                        <li><strong>Frame Forwarding</strong></li>
                      </ul>
                      <p className="mt-3 text-xs text-slate-600">Select the masked/cloaked option and paste your affiliate page URL</p>
                    </div>
                  </details>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-yellow-900 mb-1">⚠️ Important:</p>
                  <p className="text-xs text-yellow-800">
                    Make sure to select the <strong>MASKED</strong> or <strong>CLOAKED</strong> redirect option. A regular 301 redirect will show rentapog.com/affiliate/yourname instead of keeping your domain visible.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Backoffice Access */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Backoffice</h2>
          <Card className="border-2 border-purple-200">
            <CardContent className="pt-8">
              <p className="text-slate-600 mb-6">
                Access your complete backoffice dashboard to manage stats, referrals, and everything else.
              </p>
              <Button 
                onClick={() => window.location.href = "https://backoffice576.rentapog.com"}
                className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base font-semibold"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Go to Backoffice Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
