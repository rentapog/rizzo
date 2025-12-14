import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, ExternalLink, Zap, MessageSquare, TrendingUp, Users, LogOut, Lock, Copy, Plus, Rocket, Eye, Edit, Trash2, CheckCircle, X, Code, FileText, Globe, CreditCard, RefreshCw, Search, Link as LinkIcon, Layout } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import LiveUpgradeFeed from "@/components/LiveUpgradeFeed";
import { Textarea } from "@/components/ui/textarea";
import { websiteTemplates, getTemplateById, colorSchemes, ColorScheme, getWordingVariant, getColorSchemeById, getColorizedGradient } from "@shared/websiteTemplates";
import NotificationBell from "@/components/NotificationBell";

export default function Backoffice() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [coeyResponse, setCoeyResponse] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [adminDomains, setAdminDomains] = useState<any[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [deploymentSettings, setDeploymentSettings] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [deployLoading, setDeployLoading] = useState(false);
  const [showTeamTab, setShowTeamTab] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [editorTab, setEditorTab] = useState<"chat" | "editor">("chat");
  const [codeRequest, setCodeRequest] = useState("");
  const [codeResponse, setCodeResponse] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [selectedFile, setSelectedFile] = useState("client/src/pages/Home.tsx");
  const [isCreatingNewPage, setIsCreatingNewPage] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageDescription, setNewPageDescription] = useState("");
  const [newPageRoute, setNewPageRoute] = useState("");
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [stripeStatusLoading, setStripeStatusLoading] = useState(false);
  const [affiliateTestCode, setAffiliateTestCode] = useState("");
  const [affiliateTestResult, setAffiliateTestResult] = useState<any>(null);
  const [affiliateTestLoading, setAffiliateTestLoading] = useState(false);
  const [paymentTestCode, setPaymentTestCode] = useState("");
  const [paymentTestPackage, setPaymentTestPackage] = useState(1);
  const [paymentTestResult, setPaymentTestResult] = useState<any>(null);
  const [paymentTestLoading, setPaymentTestLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [passedUpSales, setPassedUpSales] = useState<any>(null);
  const [passedUpLoading, setPassedUpLoading] = useState(false);
  const [allPlatformSales, setAllPlatformSales] = useState<any>(null);
  const [allPlatformSalesLoading, setAllPlatformSalesLoading] = useState(false);
  const [levelData, setLevelData] = useState<any>(null);
  const [nichePreferences, setNichePreferences] = useState<string[]>([]);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [availableNiches, setAvailableNiches] = useState<string[]>([]);
  const [nicheLoading, setNicheLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [subdomainInput, setSubdomainInput] = useState("");
  const [subdomainLoading, setSubdomainLoading] = useState(false);
  const [userSubdomain, setUserSubdomain] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<any>(null);
  const [envVarsLoading, setEnvVarsLoading] = useState(false);
  const [showAgentDocs, setShowAgentDocs] = useState(false);
  // Sub-admin management state
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [subAdminsLoading, setSubAdminsLoading] = useState(false);
  const [newSubAdmin, setNewSubAdmin] = useState({ email: "", username: "", password: "", name: "", pin: "" });
  const [createSubAdminLoading, setCreateSubAdminLoading] = useState(false);
  // Branding feature state
  const [brandingSubscriptions, setBrandingSubscriptions] = useState<any[]>([]);
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newCustomDomain, setNewCustomDomain] = useState("");
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
  const [domainCheckLoading, setDomainCheckLoading] = useState(false);
  const [domainCheckError, setDomainCheckError] = useState("");
  const [brandingCheckoutLoading, setBrandingCheckoutLoading] = useState(false);
  // Domain purchase state
  const [purchaseDomain, setPurchaseDomain] = useState("");
  const [purchaseDomainAvailable, setPurchaseDomainAvailable] = useState<boolean | null>(null);
  const [purchaseDomainPrice, setPurchaseDomainPrice] = useState<number | null>(null);
  const [purchaseDomainCheckLoading, setPurchaseDomainCheckLoading] = useState(false);
  const [purchaseDomainCheckoutLoading, setPurchaseDomainCheckoutLoading] = useState(false);
  // Purchased domains management
  const [purchasedDomains, setPurchasedDomains] = useState<any[]>([]);
  const [purchasedDomainsLoading, setPurchasedDomainsLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [dnsRecords, setDnsRecords] = useState<any[]>([]);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [newDnsRecord, setNewDnsRecord] = useState({ hostname: "@", type: "A", address: "" });
  // AI Activity Logs state
  const [aiActivityLogs, setAiActivityLogs] = useState<any[]>([]);
  const [aiLogsLoading, setAiLogsLoading] = useState(false);
  // Website Builder state
  const [websiteProjects, setWebsiteProjects] = useState<any[]>([]);
  const [websiteProjectsLoading, setWebsiteProjectsLoading] = useState(false);
  const [showWebsiteBuilder, setShowWebsiteBuilder] = useState(false);
  const [newWebsiteName, setNewWebsiteName] = useState("");
  const [selectedWebsite, setSelectedWebsite] = useState<any>(null);
  const [websiteHtml, setWebsiteHtml] = useState("");
  const [websiteCss, setWebsiteCss] = useState("");
  const [websiteJs, setWebsiteJs] = useState("");
  const [websiteSaving, setWebsiteSaving] = useState(false);
  const [websiteDeploying, setWebsiteDeploying] = useState(false);
  const [websiteBuilderPrompt, setWebsiteBuilderPrompt] = useState("");
  const [websiteBuilderLoading, setWebsiteBuilderLoading] = useState(false);
  // Custom domain linking for website builder
  const [websiteCustomDomain, setWebsiteCustomDomain] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  // User site projects (AI-generated websites for purchased domains)
  const [userSiteProjects, setUserSiteProjects] = useState<any[]>([]);
  const [userSitesLoading, setUserSitesLoading] = useState(false);
  const [generatingSiteForDomain, setGeneratingSiteForDomain] = useState<string | null>(null);
  const [deployingSiteId, setDeployingSiteId] = useState<number | null>(null);
  const [showSitePreview, setShowSitePreview] = useState<number | null>(null);
  const [siteDescriptions, setSiteDescriptions] = useState<Record<string, string>>({});
  const [selectedTemplates, setSelectedTemplates] = useState<Record<string, string>>({});
  const [selectedColorSchemes, setSelectedColorSchemes] = useState<Record<string, string>>({});
  const [wordingVariantIndex, setWordingVariantIndex] = useState<Record<string, number>>({});
  const [templateCustomizations, setTemplateCustomizations] = useState<Record<string, { headline: string; subheadline: string; features: string[] }>>({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Detect if we're on admin backoffice or user backend
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isAdminSite = hostname.includes("backoffice576.rentapog.com") || pathname.includes("/backoffice");
  const isUserBackend = hostname.includes("backend.rentapog.com");
  
  // Show admin features if on admin site OR if logged-in user is admin
  const showAdminFeatures = isAdminSite || (user?.isAdmin === true);

  useEffect(() => {
    // Helper to get cookie by name
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        if (cookieValue) {
          try {
            return decodeURIComponent(cookieValue);
          } catch {
            return cookieValue;
          }
        }
      }
      return null;
    };

    // Check for user cookie first (set by auto-login after package purchase)
    let userData = localStorage.getItem("user");
    
    if (!userData) {
      const userCookie = getCookie("user");
      if (userCookie) {
        try {
          // Verify it's valid JSON and save to localStorage
          const parsedCookie = JSON.parse(userCookie);
          if (parsedCookie && parsedCookie.id && parsedCookie.email) {
            localStorage.setItem("user", userCookie);
            userData = userCookie;
            console.log("[Backoffice] Auto-login: transferred user from cookie to localStorage");
          }
        } catch (err) {
          console.error("[Backoffice] Failed to parse user cookie:", err);
        }
      }
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      
      // SECURITY: On admin backoffice, only allow admin users
      if (isAdminSite && !parsedUser.isAdmin) {
        localStorage.removeItem("user");
        setStats({
          referralCount: 0,
          referrals: [],
          referralBalance: 0,
          dailyEarnings: 0,
          activeDomains: 0,
        });
        setStatsLoading(false);
        return;
      }
      
      // SECURITY: On user backend, redirect admins to admin backoffice
      if (isUserBackend && parsedUser.isAdmin) {
        localStorage.removeItem("user");
        setStats({
          referralCount: 0,
          referrals: [],
          referralBalance: 0,
          dailyEarnings: 0,
          activeDomains: 0,
        });
        setStatsLoading(false);
        return;
      }
      
      setUser(parsedUser);
      fetchStats(parsedUser.id);
      fetchAdminDomains(parsedUser.id);
      fetchTeamMembers(parsedUser.id);
      fetchDeploymentSettings(parsedUser.id);
      fetchUserSubdomain(parsedUser.id);
      fetchBrandingSubscriptions(parsedUser.id);
      fetchPurchasedDomains(parsedUser.id);
      fetchUserSiteProjects();
      // Fetch AI activity logs for admin
      if (hostname.includes("backoffice576.rentapog.com") || hostname === "localhost") {
        fetchAiActivityLogs();
      }
    } else {
      setStats({
        referralCount: 0,
        referrals: [],
        referralBalance: 0,
        dailyEarnings: 0,
        activeDomains: 0,
      });
      setStatsLoading(false);
    }
  }, []);

  const fetchAdminDomains = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/admin-domains`);
      if (res.ok) {
        const data = await res.json();
        setAdminDomains(data);
      }
    } catch (err) {
      console.error("Failed to fetch admin domains:", err);
    } finally {
      setDomainsLoading(false);
    }
  };

  const fetchTeamMembers = async (userId: string) => {
    try {
      const res = await fetch(`/api/team/members/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data);
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err);
    }
  };

  const fetchDeploymentSettings = async (userId: string) => {
    try {
      const res = await fetch(`/api/deployment/settings/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setDeploymentSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch deployment settings:", err);
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
      const res = await fetch("/api/subdomain/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          subdomain: cleanSubdomain,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUserSubdomain(cleanSubdomain);
        toast({
          title: "Subdomain registered!",
          description: `${cleanSubdomain}.rentapog.com is now yours!`,
        });
      } else {
        console.error("Subdomain registration error response:", data);
        toast({ title: data.error || "Failed to register subdomain", variant: "destructive" });
      }
    } catch (err) {
      console.error("Subdomain registration fetch error:", err);
      toast({ title: err instanceof Error ? err.message : "Error registering subdomain", variant: "destructive" });
    } finally {
      setSubdomainLoading(false);
    }
  };

  const validateDomainFormat = (domain: string): string | null => {
    if (!domain.trim()) return "Please enter a domain name";
    
    const cleaned = domain.trim().toLowerCase();
    
    // Check for .com suffix and remove it
    if (cleaned.includes(".")) {
      return 'Do not include ".com" - just enter the domain name (e.g., "rentariz" not "rentariz.com")';
    }
    
    // Check for invalid characters
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(cleaned)) {
      return "Domain name can only contain lowercase letters, numbers, and hyphens";
    }
    
    return null;
  };

  // Sub-admin management functions
  const fetchSubAdmins = async () => {
    setSubAdminsLoading(true);
    try {
      const res = await fetch("/api/admin/sub-admins", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSubAdmins(data.subAdmins || []);
      }
    } catch (err) {
      console.error("Failed to fetch sub-admins:", err);
    } finally {
      setSubAdminsLoading(false);
    }
  };

  const handleCreateSubAdmin = async () => {
    if (!newSubAdmin.email || !newSubAdmin.username || !newSubAdmin.password || !newSubAdmin.pin) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!/^\d{4,6}$/.test(newSubAdmin.pin)) {
      toast({ title: "PIN must be 4-6 digits", variant: "destructive" });
      return;
    }
    if (newSubAdmin.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setCreateSubAdminLoading(true);
    try {
      const res = await fetch("/api/admin/sub-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newSubAdmin),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ 
          title: "Sub-admin created!", 
          description: `${newSubAdmin.email} can now login at backend.rentapog.com` 
        });
        setNewSubAdmin({ email: "", username: "", password: "", name: "", pin: "" });
        fetchSubAdmins();
      } else {
        toast({ title: data.error || "Failed to create sub-admin", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error creating sub-admin", variant: "destructive" });
    } finally {
      setCreateSubAdminLoading(false);
    }
  };

  const handleDeleteSubAdmin = async (subAdminId: string) => {
    if (!confirm("Are you sure you want to delete this sub-admin?")) return;
    
    try {
      const res = await fetch(`/api/admin/sub-admins/${subAdminId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast({ title: "Sub-admin deleted" });
        fetchSubAdmins();
      } else {
        const data = await res.json();
        toast({ title: data.error || "Failed to delete sub-admin", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error deleting sub-admin", variant: "destructive" });
    }
  };

  const handleInviteTeamMember = async () => {
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }

    if (!inviteEmail.includes("@")) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }

    setInviteLoading(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: user.id,
          memberEmail: inviteEmail,
        }),
      });

      if (res.ok) {
        toast({ title: "Invitation sent!", description: `Invited ${inviteEmail} to your team` });
        setInviteEmail("");
        fetchTeamMembers(user.id);
      } else {
        const data = await res.json();
        toast({ title: data.message || "Failed to invite member", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error inviting member", variant: "destructive" });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeploy = async () => {
    console.log("🚀 [Deploy] Starting deployment process");
    console.log("👤 User:", user?.id);
    console.log("⚙️ Deployment settings:", deploymentSettings);
    console.log("🔒 Deployment enabled:", deploymentSettings?.deploymentEnabled);

    if (!user) {
      console.log("❌ [Deploy] No user found");
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }

    if (!deploymentSettings?.deploymentEnabled) {
      console.log("❌ [Deploy] Deployment is disabled. Current settings:", deploymentSettings);
      toast({ title: "❌ Deployment is not enabled. Please enable it first using the toggle above.", variant: "destructive" });
      return;
    }

    if (!confirm("Deploy changes to production? This will make your current code live.")) {
      console.log("⚠️ [Deploy] User cancelled deployment");
      return;
    }

    setDeployLoading(true);
    try {
      console.log("📤 [Deploy] Sending deployment request to /api/deployment/deploy...");
      const res = await fetch("/api/deployment/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      console.log("📡 [Deploy] Response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("✅ [Deploy] Deployment successful:", data);
        toast({ title: "🎉 Deployment successful!", description: "Your website is now live" });
        fetchDeploymentSettings(user.id);
      } else {
        const data = await res.json();
        console.error("❌ [Deploy] Deployment failed:", data.message);
        toast({ title: data.message || "Deployment failed", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("❌ [Deploy] Error deploying:", err.message);
      toast({ title: "Error deploying", variant: "destructive" });
    } finally {
      setDeployLoading(false);
    }
  };

  const handleToggleDeployment = async (enabled: boolean) => {
    if (!user) {
      console.log("⚠️ [Deployment] No user found");
      return;
    }

    console.log("🔘 [Deployment Toggle] Toggling deployment to:", enabled);
    console.log("👤 User ID:", user.id);

    try {
      console.log("📡 [Deployment Toggle] Sending request to /api/deployment/settings...");
      const res = await fetch("/api/deployment/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, deploymentEnabled: enabled }),
      });

      console.log("📡 [Deployment Toggle] Response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("✅ [Deployment Toggle] Settings updated successfully:", data);
        fetchDeploymentSettings(user.id);
        toast({ title: enabled ? "✅ Deployment enabled - you can now deploy!" : "Deployment disabled" });
      } else {
        const errorData = await res.json();
        console.error("❌ [Deployment Toggle] Failed:", errorData.message);
        toast({ title: errorData.message || "Failed to update deployment settings", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("❌ [Deployment Toggle] Error:", err.message);
      toast({ title: "Error updating settings", variant: "destructive" });
    }
  };

  const handleAskCoeyForCode = async () => {
    const isNewPage = selectedFile === "__CREATE_NEW__";
    
    if (isNewPage) {
      if (!newPageName.trim() || !newPageRoute.trim()) {
        toast({ title: "Please enter a page name and route", variant: "destructive" });
        return;
      }
      if (!newPageDescription.trim() && !codeRequest.trim()) {
        toast({ title: "Please describe what the new page should contain", variant: "destructive" });
        return;
      }
    } else if (!codeRequest.trim()) {
      toast({ title: "Please describe what you want to change", variant: "destructive" });
      return;
    }

    console.log("🚀 [Coey] Starting code generation request");
    console.log("📁 File:", isNewPage ? `NEW: ${newPageName}` : selectedFile);
    console.log("📝 Request:", codeRequest || newPageDescription);
    
    setLoading(true);
    try {
      if (isNewPage) {
        console.log("⏳ [Coey] Creating new page...");
        const res = await fetch("/api/coey/create-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            pageName: newPageName,
            route: newPageRoute,
            description: newPageDescription || codeRequest,
          }),
        });

        console.log("📡 [Coey] Response status:", res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log("✅ [Coey] New page code generated");
          setCodeResponse(data.code);
          toast({ title: `New page "${newPageName}" ready for review!` });
        } else {
          const errorData = await res.json();
          console.error("❌ [Coey] Failed to create page:", errorData.message);
          toast({ title: "Failed to create page", variant: "destructive" });
        }
      } else {
        console.log("⏳ [Coey] Sending request to /api/coey/code...");
        const res = await fetch("/api/coey/code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            request: codeRequest,
            file: selectedFile,
            currentCode: fileContent
          }),
        });

        console.log("📡 [Coey] Response status:", res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log("✅ [Coey] Code generated successfully");
          console.log("💻 Generated code length:", data.code?.length || 0, "characters");
          console.log("📄 Generated code preview:", data.code?.substring(0, 200) || "No code");
          setCodeResponse(data.code);
          toast({ title: "Code suggestion from Coey ready!" });
        } else {
          const errorData = await res.json();
          console.error("❌ [Coey] Failed to generate code:", errorData.message);
          toast({ title: "Failed to get code suggestion", variant: "destructive" });
        }
      }
    } catch (err: any) {
      console.error("❌ [Coey] Error contacting Coey:", err.message);
      toast({ title: "Error contacting Coey", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCode = async () => {
    if (!codeResponse || !user) return;
    
    const isNewPage = selectedFile === "__CREATE_NEW__";
    const targetFile = isNewPage 
      ? `client/src/pages/${newPageName.replace(/[^a-zA-Z0-9]/g, '')}.tsx`
      : selectedFile;
    
    console.log("🔧 [Coey] Applying code changes");
    console.log("📁 File:", targetFile);
    console.log("👤 User ID:", user.id);
    console.log("📏 Code size:", codeResponse.length, "characters");
    console.log("🆕 Is new page:", isNewPage);
    
    try {
      console.log("⏳ [Coey] Sending apply request to /api/code/apply...");
      const res = await fetch("/api/code/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: targetFile,
          code: codeResponse,
          userId: user.id,
          isNewPage,
          route: isNewPage ? newPageRoute : undefined,
        }),
      });

      console.log("📡 [Coey] Apply response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("✅ [Coey] Code applied successfully", data);
        setFileContent(codeResponse);
        setCodeResponse("");
        setCodeRequest("");
        if (isNewPage) {
          setNewPageName("");
          setNewPageRoute("");
          setNewPageDescription("");
          toast({ title: `✓ New page "${newPageName}" created! Add it to App.tsx routes.` });
        } else {
          toast({ title: "✓ Code applied successfully!" });
        }
      } else {
        const errorData = await res.json();
        console.error("❌ [Coey] Failed to apply code:", errorData.message);
        toast({ title: "Failed to apply code", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("❌ [Coey] Error applying code:", err.message);
      toast({ title: "Error applying code", variant: "destructive" });
    }
  };

  const handleAddDomain = async () => {
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }

    const error = validateDomainFormat(domainInput);
    if (error) {
      toast({ title: error, variant: "destructive" });
      return;
    }

    setDomainsLoading(true);
    try {
      const res = await fetch("/api/admin/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          domainName: domainInput.trim().toLowerCase(),
          userId: user.id
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast({ title: data.message || "Failed to add domain", variant: "destructive" });
        return;
      }

      const data = await res.json();
      setAdminDomains([...adminDomains, data.domain]);
      setDomainInput("");
      toast({ title: "✓ Domain added!" });
    } catch (err) {
      toast({ title: "Error adding domain", variant: "destructive" });
    } finally {
      setDomainsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      // Use appropriate endpoint based on subdomain
      const loginEndpoint = isAdminSite ? "/api/auth/admin-login" : "/api/auth/login";
      
      // For admin site, include PIN in the request
      const loginBody = isAdminSite 
        ? { email: loginEmail, password: loginPassword, pin: loginPin }
        : { email: loginEmail, password: loginPassword };
      
      const res = await fetch(loginEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginBody),
      });

      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.message || "Login failed");
        return;
      }

      const data = await res.json();
      
      // On admin site, verify they are actually admin
      if (isAdminSite && !data.user?.isAdmin) {
        setLoginError("Admin access required");
        return;
      }
      
      // On user backend, verify they are NOT admin
      if (isUserBackend && data.user?.isAdmin) {
        setLoginError("Please use backoffice576.rentapog.com for admin access");
        return;
      }
      
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setLoginEmail("");
      setLoginPassword("");
      toast({ title: "✓ Logged in successfully!" });
      fetchStats(data.user.id);
      fetchAdminDomains(data.user.id);
      fetchTeamMembers(data.user.id);
      fetchDeploymentSettings(data.user.id);
      fetchUserSubdomain(data.user.id);
      fetchBrandingSubscriptions(data.user.id);
      fetchPurchasedDomains(data.user.id);
      fetchUserSiteProjects();
    } catch (err) {
      setLoginError("An error occurred. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    // Clear the cookie on the server
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("Logout API error:", err);
    }
    
    // Also clear client-side cookie manually
    document.cookie = "user=; domain=.rentapog.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    localStorage.removeItem("user");
    setUser(null);
    setStats({
      referralCount: 0,
      referrals: [],
      referralBalance: 0,
      dailyEarnings: 0,
      activeDomains: 0,
    });
    setLoginEmail("");
    setLoginPassword("");
    setLoginPin("");
    setLoginError("");
    toast({ title: "✓ Logged out" });
  };

  const handleForgotPassword = async () => {
    console.log("[ForgotPassword] handleForgotPassword called");
    console.log("[ForgotPassword] Email:", forgotPasswordEmail);
    
    if (!forgotPasswordEmail) {
      console.log("[ForgotPassword] No email provided");
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }
    
    setForgotPasswordLoading(true);
    try {
      console.log("[ForgotPassword] Sending request to /api/auth/forgot-password");
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });
      
      console.log("[ForgotPassword] Response status:", res.status);
      const data = await res.json();
      console.log("[ForgotPassword] Response data:", data);
      
      if (res.ok) {
        console.log("[ForgotPassword] Success - showing confirmation");
        setForgotPasswordSent(true);
        toast({ title: "Check your email", description: "If an account exists, a reset link has been sent." });
      } else {
        console.log("[ForgotPassword] Error response:", data.message);
        toast({ title: "Error", description: data.message || "Failed to send reset email", variant: "destructive" });
      }
    } catch (err) {
      console.error("[ForgotPassword] Catch error:", err);
      toast({ title: "Error", description: "Failed to send reset email", variant: "destructive" });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const fetchStats = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/referral-stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setStats({
          referralCount: 0,
          referrals: [],
          referralBalance: 0,
          dailyEarnings: 0,
          activeDomains: 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setStats({
        referralCount: 0,
        referrals: [],
        referralBalance: 0,
        dailyEarnings: 0,
        activeDomains: 0,
      });
    } finally {
      setStatsLoading(false);
    }
    
    // Also fetch level data
    try {
      const levelRes = await fetch("/api/user/my-sales", { credentials: "include" });
      if (levelRes.ok) {
        const levelInfo = await levelRes.json();
        setLevelData(levelInfo);
      }
    } catch (err) {
      console.error("Failed to fetch level data:", err);
    }
    
    // Fetch niche preferences
    try {
      const nicheRes = await fetch("/api/user/niche-preferences", { credentials: "include" });
      if (nicheRes.ok) {
        const nicheData = await nicheRes.json();
        setNichePreferences(nicheData.nichePreferences || []);
        setEmailNotificationsEnabled(nicheData.emailNotificationsEnabled ?? true);
        setAvailableNiches(nicheData.availableNiches || []);
      }
    } catch (err) {
      console.error("Failed to fetch niche preferences:", err);
    }
  };

  const saveNichePreferences = async () => {
    setNicheLoading(true);
    try {
      const res = await fetch("/api/user/niche-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ niches: nichePreferences, emailNotificationsEnabled }),
      });
      if (res.ok) {
        toast({ title: "✓ Notification preferences saved!" });
      } else {
        toast({ title: "Failed to save preferences", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error saving preferences", variant: "destructive" });
    } finally {
      setNicheLoading(false);
    }
  };

  const toggleNiche = (niche: string) => {
    setNichePreferences(prev => 
      prev.includes(niche) 
        ? prev.filter(n => n !== niche)
        : [...prev, niche]
    );
  };

  const fetchStripeStatus = async () => {
    setStripeStatusLoading(true);
    try {
      const res = await fetch("/api/admin/stripe-status", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setStripeStatus(data);
      } else {
        toast({ title: "Failed to fetch Stripe status", variant: "destructive" });
      }
    } catch (err) {
      console.error("Failed to fetch Stripe status:", err);
      toast({ title: "Error fetching Stripe status", variant: "destructive" });
    } finally {
      setStripeStatusLoading(false);
    }
  };

  const fetchEnvVars = async () => {
    setEnvVarsLoading(true);
    try {
      const res = await fetch("/api/agent/env-vars", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setEnvVars(data.envVars);
      } else {
        toast({ title: "Failed to fetch environment variables", variant: "destructive" });
      }
    } catch (err) {
      console.error("Failed to fetch env vars:", err);
      toast({ title: "Error fetching environment variables", variant: "destructive" });
    } finally {
      setEnvVarsLoading(false);
    }
  };

  const testAffiliateLink = async () => {
    if (!affiliateTestCode.trim()) {
      toast({ title: "Please enter an affiliate code", variant: "destructive" });
      return;
    }
    setAffiliateTestLoading(true);
    setAffiliateTestResult(null);
    try {
      const res = await fetch(`/api/admin/test-affiliate/${affiliateTestCode.trim()}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAffiliateTestResult(data);
      } else {
        toast({ title: "Failed to test affiliate link", variant: "destructive" });
      }
    } catch (err) {
      console.error("Failed to test affiliate:", err);
      toast({ title: "Error testing affiliate", variant: "destructive" });
    } finally {
      setAffiliateTestLoading(false);
    }
  };

  const simulatePayment = async () => {
    if (!paymentTestCode.trim()) {
      toast({ title: "Please enter an affiliate code", variant: "destructive" });
      return;
    }
    setPaymentTestLoading(true);
    try {
      const res = await fetch("/api/admin/simulate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          affiliateCode: paymentTestCode.trim(),
          packageId: paymentTestPackage 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentTestResult(data);
        toast({ title: `Sale #${data.simulation.saleNumber} simulated!` });
      } else {
        toast({ title: data.error || "Simulation failed", variant: "destructive" });
      }
    } catch (err) {
      console.error("Payment simulation failed:", err);
      toast({ title: "Error simulating payment", variant: "destructive" });
    } finally {
      setPaymentTestLoading(false);
    }
  };

  const resetAffiliateSales = async () => {
    if (!paymentTestCode.trim()) {
      toast({ title: "Please enter an affiliate code first", variant: "destructive" });
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch("/api/admin/reset-affiliate-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ affiliateCode: paymentTestCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: `Reset ${paymentTestCode} to 0 sales - ready for testing!` });
        setPaymentTestResult({
          success: true,
          simulation: {
            saleNumber: 0,
            packageAmount: "$0.00",
            creditedTo: "N/A",
            balanceAfter: "$0.00",
          },
          explanation: `Reset complete! ${paymentTestCode} now has 0 sales. Click "Simulate Payment" to test the pass-up logic.`,
          salesHistory: [],
          nextSale: {
            willBeSaleNumber: 1,
            willGoTo: "Affiliate (100%)"
          }
        });
      } else {
        toast({ title: data.error || "Reset failed", variant: "destructive" });
      }
    } catch (err) {
      console.error("Reset failed:", err);
      toast({ title: "Error resetting affiliate", variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  const fetchPassedUpSales = async () => {
    setPassedUpLoading(true);
    try {
      const res = await fetch("/api/admin/passed-up-sales", {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setPassedUpSales(data);
      } else {
        console.error("Failed to fetch passed-up sales");
      }
    } catch (err) {
      console.error("Error fetching passed-up sales:", err);
    } finally {
      setPassedUpLoading(false);
    }
  };

  const fetchAllPlatformSales = async () => {
    setAllPlatformSalesLoading(true);
    try {
      const res = await fetch("/api/admin/all-platform-sales", {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setAllPlatformSales(data);
      } else {
        console.error("Failed to fetch all platform sales");
      }
    } catch (err) {
      console.error("Error fetching all platform sales:", err);
    } finally {
      setAllPlatformSalesLoading(false);
    }
  };

  // Branding subscription functions
  const fetchBrandingSubscriptions = async (userId: string) => {
    setBrandingLoading(true);
    try {
      const res = await fetch(`/api/branding/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBrandingSubscriptions(data.brands || []);
      }
    } catch (err) {
      console.error("Error fetching branding subscriptions:", err);
    } finally {
      setBrandingLoading(false);
    }
  };

  // Check domain availability
  const checkDomainAvailability = async (domain: string) => {
    if (!domain.trim()) return;
    
    // Basic domain format validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      setDomainAvailable(false);
      setDomainCheckError("Invalid domain format. Example: mybrand.com");
      return;
    }
    
    setDomainCheckLoading(true);
    setDomainCheckError("");
    try {
      const res = await fetch("/api/branding/check-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.toLowerCase() }),
      });
      
      const data = await res.json();
      setDomainAvailable(data.available);
      if (!data.available) {
        setDomainCheckError(data.error || "This domain is not available");
      }
    } catch (err) {
      setDomainAvailable(false);
      setDomainCheckError("Failed to check domain availability");
    } finally {
      setDomainCheckLoading(false);
    }
  };

  const handleBrandingCheckout = async () => {
    if (!newBrandName.trim()) {
      toast({ title: "Please enter a brand name", variant: "destructive" });
      return;
    }
    
    if (!newCustomDomain.trim()) {
      toast({ title: "Please enter a custom domain", variant: "destructive" });
      return;
    }
    
    const brandSlug = newBrandName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (brandSlug.length < 3) {
      toast({ title: "Brand name must be at least 3 characters", variant: "destructive" });
      return;
    }
    
    if (domainAvailable !== true) {
      toast({ title: "Please check domain availability first", variant: "destructive" });
      return;
    }
    
    setBrandingCheckoutLoading(true);
    try {
      const res = await fetch("/api/branding/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          brandName: newBrandName,
          customDomain: newCustomDomain.toLowerCase()
        }),
      });
      
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: data.error || "Checkout failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Failed to start checkout", variant: "destructive" });
    } finally {
      setBrandingCheckoutLoading(false);
    }
  };

  const handleCancelBranding = async (brandId: number) => {
    if (!confirm("Are you sure you want to cancel this branding subscription? Your branded site will be deactivated.")) {
      return;
    }
    
    try {
      const res = await fetch("/api/branding/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, userId: user.id }),
      });
      
      const data = await res.json();
      if (data.success) {
        toast({ title: "Branding subscription cancelled" });
        fetchBrandingSubscriptions(user.id);
      } else {
        toast({ title: data.error || "Cancellation failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Failed to cancel subscription", variant: "destructive" });
    }
  };

  // Domain purchase functions
  const checkPurchaseDomainAvailability = async () => {
    if (!purchaseDomain.trim()) return;
    
    setPurchaseDomainCheckLoading(true);
    setPurchaseDomainAvailable(null);
    setPurchaseDomainPrice(null);
    try {
      const res = await fetch("/api/branding/check-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: purchaseDomain.toLowerCase() }),
      });
      
      const data = await res.json();
      setPurchaseDomainAvailable(data.available);
      if (data.price) {
        setPurchaseDomainPrice(data.price);
      }
      if (!data.available) {
        toast({ title: data.error || "Domain not available", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Failed to check domain", variant: "destructive" });
    } finally {
      setPurchaseDomainCheckLoading(false);
    }
  };

  const handleDomainPurchaseCheckout = async () => {
    if (!purchaseDomain.trim() || purchaseDomainAvailable !== true) {
      toast({ title: "Please check domain availability first", variant: "destructive" });
      return;
    }
    
    setPurchaseDomainCheckoutLoading(true);
    try {
      const res = await fetch("/api/domain-purchase/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          domain: purchaseDomain.toLowerCase()
        }),
      });
      
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: data.error || "Checkout failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Failed to start checkout", variant: "destructive" });
    } finally {
      setPurchaseDomainCheckoutLoading(false);
    }
  };

  // Fetch purchased domains
  const fetchPurchasedDomains = async (userId: string) => {
    setPurchasedDomainsLoading(true);
    try {
      const res = await fetch(`/api/domains/purchased/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setPurchasedDomains(data.domains || []);
      }
    } catch (err) {
      console.error("Error fetching purchased domains:", err);
    } finally {
      setPurchasedDomainsLoading(false);
    }
  };

  // Fetch DNS records for a domain
  const fetchDnsRecords = async (domain: string) => {
    setDnsLoading(true);
    setSelectedDomain(domain);
    try {
      const res = await fetch(`/api/domains/${domain}/dns`);
      if (res.ok) {
        const data = await res.json();
        setDnsRecords(data.records || []);
      } else {
        toast({ title: "Failed to load DNS records", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error loading DNS", variant: "destructive" });
    } finally {
      setDnsLoading(false);
    }
  };

  // Add DNS record
  const addDnsRecord = async () => {
    if (!selectedDomain || !newDnsRecord.address) {
      toast({ title: "Please fill in the address", variant: "destructive" });
      return;
    }
    
    setDnsLoading(true);
    try {
      const updatedRecords = [...dnsRecords, newDnsRecord];
      const res = await fetch(`/api/domains/${selectedDomain}/dns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: updatedRecords }),
      });
      
      const data = await res.json();
      if (data.success) {
        toast({ title: "DNS record added!" });
        setNewDnsRecord({ hostname: "@", type: "A", address: "" });
        fetchDnsRecords(selectedDomain);
      } else {
        toast({ title: data.error || "Failed to add record", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error adding DNS record", variant: "destructive" });
    } finally {
      setDnsLoading(false);
    }
  };

  // Fetch AI activity logs
  const fetchAiActivityLogs = async () => {
    setAiLogsLoading(true);
    try {
      const res = await fetch("/api/ai-activity-logs");
      if (res.ok) {
        const data = await res.json();
        setAiActivityLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error fetching AI logs:", err);
    } finally {
      setAiLogsLoading(false);
    }
  };

  // Website Builder functions
  const fetchWebsiteProjects = async () => {
    setWebsiteProjectsLoading(true);
    try {
      const res = await fetch("/api/admin/websites");
      if (res.ok) {
        const data = await res.json();
        setWebsiteProjects(data);
      }
    } catch (err) {
      console.error("Error fetching website projects:", err);
    } finally {
      setWebsiteProjectsLoading(false);
    }
  };

  const createWebsiteProject = async () => {
    if (!newWebsiteName.trim()) {
      toast({ title: "Please enter a project name", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/api/admin/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWebsiteName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Website project created!" });
        setNewWebsiteName("");
        fetchWebsiteProjects();
        selectWebsite(data.project);
      } else {
        toast({ title: data.message || "Failed to create project", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error creating project", variant: "destructive" });
    }
  };

  const selectWebsite = (project: any) => {
    setSelectedWebsite(project);
    setWebsiteHtml(project.htmlContent || "");
    setWebsiteCss(project.cssContent || "");
    setWebsiteJs(project.jsContent || "");
  };

  const saveWebsiteProject = async () => {
    if (!selectedWebsite) return;
    setWebsiteSaving(true);
    try {
      const res = await fetch(`/api/admin/websites/${selectedWebsite.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htmlContent: websiteHtml,
          cssContent: websiteCss,
          jsContent: websiteJs,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Website saved!" });
        setSelectedWebsite(data.project);
        fetchWebsiteProjects();
      } else {
        toast({ title: data.message || "Failed to save", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error saving project", variant: "destructive" });
    } finally {
      setWebsiteSaving(false);
    }
  };

  const deployWebsiteProject = async () => {
    if (!selectedWebsite) return;
    setWebsiteDeploying(true);
    try {
      const res = await fetch(`/api/admin/websites/${selectedWebsite.id}/deploy`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Deployed successfully!", description: `Live at: ${data.url}` });
        setSelectedWebsite(data.project);
        fetchWebsiteProjects();
      } else {
        toast({ title: data.message || "Deployment failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error deploying", variant: "destructive" });
    } finally {
      setWebsiteDeploying(false);
    }
  };

  const deleteWebsiteProject = async (id: number) => {
    if (!confirm("Are you sure you want to delete this website project?")) return;
    try {
      const res = await fetch(`/api/admin/websites/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Project deleted" });
        if (selectedWebsite?.id === id) {
          setSelectedWebsite(null);
          setWebsiteHtml("");
          setWebsiteCss("");
          setWebsiteJs("");
        }
        fetchWebsiteProjects();
      }
    } catch (err) {
      toast({ title: "Error deleting project", variant: "destructive" });
    }
  };

  const generateWithCoey = async () => {
    if (!websiteBuilderPrompt.trim()) {
      toast({ title: "Please describe what you want to build", variant: "destructive" });
      return;
    }
    setWebsiteBuilderLoading(true);
    try {
      const res = await fetch("/api/coey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Generate a complete HTML webpage based on this request. Return ONLY valid HTML code with inline CSS in a <style> tag. Do NOT include any explanation or markdown. The request is: ${websiteBuilderPrompt}`,
          userId: user?.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.response) {
        // Extract HTML from response
        let html = data.response;
        // Remove markdown code blocks if present
        html = html.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
        setWebsiteHtml(html);
        toast({ title: "Website generated! Review and deploy when ready." });
      } else {
        toast({ title: "Failed to generate website", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error generating website", variant: "destructive" });
    } finally {
      setWebsiteBuilderLoading(false);
    }
  };

  // Custom domain management for website builder
  const addCustomDomainToProject = async () => {
    if (!selectedWebsite || !websiteCustomDomain.trim()) return;
    setAddingDomain(true);
    try {
      const res = await fetch(`/api/admin/websites/${selectedWebsite.id}/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: websiteCustomDomain.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Custom domain added!", description: data.message });
        setWebsiteCustomDomain("");
        // Refresh project data
        const updated = await fetch(`/api/admin/websites/${selectedWebsite.id}`);
        if (updated.ok) {
          const projectData = await updated.json();
          setSelectedWebsite(projectData);
        }
        fetchWebsiteProjects();
      } else {
        toast({ title: data.message || "Failed to add domain", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error adding custom domain", variant: "destructive" });
    } finally {
      setAddingDomain(false);
    }
  };

  const removeCustomDomainFromProject = async (domain: string) => {
    if (!selectedWebsite) return;
    if (!confirm(`Remove custom domain: ${domain}?`)) return;
    try {
      const res = await fetch(`/api/admin/websites/${selectedWebsite.id}/domains/${encodeURIComponent(domain)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Custom domain removed" });
        // Refresh project data
        const updated = await fetch(`/api/admin/websites/${selectedWebsite.id}`);
        if (updated.ok) {
          const projectData = await updated.json();
          setSelectedWebsite(projectData);
        }
        fetchWebsiteProjects();
      } else {
        toast({ title: data.message || "Failed to remove domain", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error removing domain", variant: "destructive" });
    }
  };

  // User Site Projects functions (AI-generated websites)
  const fetchUserSiteProjects = async () => {
    if (!user?.id) return;
    setUserSitesLoading(true);
    try {
      const res = await fetch(`/api/user/sites?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserSiteProjects(data.sites || []);
      }
    } catch (err) {
      console.error("Error fetching user sites:", err);
    } finally {
      setUserSitesLoading(false);
    }
  };

  const createAndGenerateSite = async (domainName: string, purchasedDomainId?: number, description?: string) => {
    if (!user?.id) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }
    setGeneratingSiteForDomain(domainName);
    try {
      // First create the site project
      const createRes = await fetch("/api/user/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainName, purchasedDomainId, userId: user.id }),
      });
      
      if (!createRes.ok) {
        const errorData = await createRes.json();
        toast({ title: errorData.message || "Failed to create site", variant: "destructive" });
        return;
      }
      
      const createData = await createRes.json();
      const siteId = createData.site.id;
      
      // If site already exists, generate content for it
      if (createData.alreadyExists) {
        toast({ title: "Found existing project, generating content...", description: "This may take a minute" });
      }
      
      // Now generate content with AI
      toast({ title: "Creating your website with AI...", description: "This may take a minute" });
      
      const genRes = await fetch(`/api/user/sites/${siteId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, businessDescription: description }),
      });
      
      if (!genRes.ok) {
        const errorData = await genRes.json();
        toast({ title: errorData.message || "Failed to generate site", variant: "destructive" });
        return;
      }
      
      toast({ title: "Website generated!", description: "Preview it and deploy when ready" });
      fetchUserSiteProjects();
    } catch (err) {
      toast({ title: "Error creating site", variant: "destructive" });
    } finally {
      setGeneratingSiteForDomain(null);
    }
  };

  const useTemplate = async (domainName: string, purchasedDomainId: number, templateId: string) => {
    if (!user?.id) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }
    
    const template = getTemplateById(templateId);
    if (!template) {
      toast({ title: "Template not found", variant: "destructive" });
      return;
    }
    
    setGeneratingSiteForDomain(domainName);
    try {
      const createRes = await fetch("/api/user/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainName, purchasedDomainId, userId: user.id }),
      });
      
      if (!createRes.ok) {
        const errorData = await createRes.json();
        toast({ title: errorData.message || "Failed to create site", variant: "destructive" });
        return;
      }
      
      const createData = await createRes.json();
      const siteId = createData.site.id;
      
      const affiliateCode = user.username || user.id.toString();
      
      const customization = templateCustomizations[domainName] || {
        headline: template.defaultHeadline,
        subheadline: template.defaultSubheadline,
        features: [...template.defaultFeatures]
      };
      
      const selectedColorId = selectedColorSchemes[domainName] || 'blue';
      const colorScheme = getColorSchemeById(selectedColorId);
      const baseHtml = template.getHtml(domainName, affiliateCode, customization);
      const colorOverrideCSS = `<style>.hero { background: linear-gradient(135deg, ${colorScheme.gradientFrom} 0%, ${colorScheme.gradientTo} 100%) !important; } .signup-form button { background: ${colorScheme.buttonBg} !important; } .signup-form button:hover { background: ${colorScheme.secondary} !important; } .features h2, .feature-card h3 { color: ${colorScheme.primary} !important; }</style>`;
      const htmlContent = baseHtml.replace('</head>', colorOverrideCSS + '</head>');
      
      const updateRes = await fetch(`/api/user/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlContent, userId: user.id }),
      });
      
      if (!updateRes.ok) {
        toast({ title: "Failed to apply template", variant: "destructive" });
        return;
      }
      
      toast({ title: "Template applied!", description: "Preview it and deploy when ready" });
      fetchUserSiteProjects();
    } catch (err) {
      toast({ title: "Error applying template", variant: "destructive" });
    } finally {
      setGeneratingSiteForDomain(null);
    }
  };

  const regenerateSite = async (siteId: number, description?: string) => {
    const site = userSiteProjects.find(s => s.id === siteId);
    if (site) {
      setGeneratingSiteForDomain(site.domainName);
    }
    try {
      if (!user?.id) {
        toast({ title: "Please log in again", description: "Your session may have expired", variant: "destructive" });
        return;
      }
      
      toast({ title: "Regenerating your website...", description: "Creating a fresh new design" });
      
      const res = await fetch(`/api/user/sites/${siteId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user.id, businessDescription: description }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        toast({ title: errorData.message || "Failed to regenerate", variant: "destructive" });
        return;
      }
      
      toast({ title: "New design ready!", description: "Check it out below" });
      fetchUserSiteProjects();
    } catch (err) {
      toast({ title: "Error regenerating site", variant: "destructive" });
    } finally {
      setGeneratingSiteForDomain(null);
    }
  };

  const deploySite = async (siteId: number) => {
    setDeployingSiteId(siteId);
    try {
      if (!user?.id) {
        toast({ title: "Please log in again", description: "Your session may have expired", variant: "destructive" });
        return;
      }
      
      toast({ title: "Deploying your website...", description: "Making it live on the internet" });
      
      const res = await fetch(`/api/user/sites/${siteId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user.id }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast({ title: data.message || "Deploy failed", variant: "destructive" });
        return;
      }
      
      toast({ 
        title: "Website is LIVE!", 
        description: `Visit: ${data.url}`,
      });
      fetchUserSiteProjects();
    } catch (err) {
      toast({ title: "Error deploying site", variant: "destructive" });
    } finally {
      setDeployingSiteId(null);
    }
  };

  const getSiteForDomain = (domainName: string) => {
    return userSiteProjects.find(s => s.domainName === domainName.toLowerCase());
  };

  const handleCoeyChat = async () => {
    if (!message.trim()) {
      toast({ title: "Please enter a message", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/coey/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        toast({ title: "Error getting response", variant: "destructive" });
        return;
      }

      const data = await res.json();
      setCoeyResponse(data.response);
    } catch (err) {
      toast({ title: "Failed to get response", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className={`${isAdminSite ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white rounded-t-lg`}>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {isAdminSite ? "Admin Login" : "Affiliate Login"}
            </CardTitle>
            <p className={`${isAdminSite ? 'text-purple-100' : 'text-blue-100'} text-sm mt-1`}>
              {isAdminSite ? "Admin access only" : "Access your affiliate dashboard"}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  {isAdminSite ? "Admin Email" : "Email Address"}
                </label>
                <Input
                  type="email"
                  placeholder={isAdminSite ? "admin@email.com" : "your@email.com"}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="mt-1"
                  required
                  data-testid="input-login-email"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  {isAdminSite ? "Admin Password" : "Password"}
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="mt-1"
                  required
                  data-testid="input-login-password"
                />
              </div>

              {isAdminSite && (
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Secret PIN
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="mt-1"
                    required
                    data-testid="input-login-pin"
                  />
                  <p className="text-xs text-slate-500 mt-1">Enter your 3-part authentication PIN</p>
                </div>
              )}

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{loginError}</p>
                </div>
              )}

              <Button
                type="submit"
                className={`w-full ${isAdminSite ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={loginLoading}
                data-testid="button-login-submit"
              >
                {loginLoading ? "Logging in..." : "Login"}
              </Button>
              
              {/* Forgot password link - only for user backend */}
              {isUserBackend && !showForgotPassword && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    data-testid="link-forgot-password"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </form>
            
            {/* Forgot password section - OUTSIDE the login form to avoid nested form issues */}
            {isUserBackend && showForgotPassword && (
              <div className="border-t pt-4 mt-4">
                {forgotPasswordSent ? (
                  <div className="text-center space-y-3">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
                    <p className="text-green-700 font-medium">Reset link sent!</p>
                    <p className="text-sm text-slate-600">Check your email inbox (and spam folder) for the password reset link.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordSent(false);
                        setForgotPasswordEmail("");
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Back to login
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 mb-2">Enter your email to receive a password reset link:</p>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      data-testid="input-forgot-email"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={forgotPasswordLoading}
                        onClick={handleForgotPassword}
                      >
                        {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotPasswordEmail("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name}!</h1>
            <p className="text-slate-600 mt-1">Your RentAPog Affiliate Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell userId={user.id?.toString() || ""} />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Stripe Connect Section - Show at TOP only if NOT connected */}
          {!user.stripeAccountId && (
            <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-blue-600" />
                  💳 Connect Stripe to Get Paid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">
                  Connect your Stripe account to receive commissions from domain sales and daily rentals.
                </p>

                <Button
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/stripe/connect-url");
                      const data = await res.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        toast({ title: "Error", description: data.error || "Could not get Stripe link" });
                      }
                    } catch (err) {
                      toast({ title: "Error", description: "Failed to connect to Stripe" });
                    }
                  }}
                >
                  <ExternalLink className="h-5 w-5" />
                  Connect Stripe Account
                </Button>

                <p className="text-xs text-slate-600 text-center">
                  🔒 Secure connection • Your account details never shared
                </p>
              </CardContent>
            </Card>
          )}

          {/* Your Level Card - Prominent Display */}
          {!statsLoading && user && !user.isAdmin && (
            <Card className="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-200 text-sm font-medium mb-1">Your Current Level</p>
                    <p className="text-5xl font-bold" data-testid="stat-user-level">
                      {levelData?.userLevelFormatted || (user.packagePurchased ? `$${(user.packagePurchased / 100).toFixed(0)}` : "$0")}
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
          )}

          {/* Stats Grid */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-2 border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-red-600" />
                    Total Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-700">{stats.referralCount}</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Your Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">{levelData?.totalEarningsFormatted || "$0.00"}</div>
                  <p className="text-xs text-green-600 mt-1">{levelData?.creditedSalesCount || 0} sales</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    Referral Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">${(stats.referralBalance / 100).toFixed(2)}</div>
                  <p className="text-xs text-blue-600 mt-1">Pending earnings</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    {levelData?.isAdmin ? "Passed Up Received" : "Passed Up to Admin"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700">
                    {levelData?.isAdmin ? levelData?.adminPassedUpAmountFormatted : levelData?.passedUpAmountFormatted || "$0.00"}
                  </div>
                  <p className="text-xs text-orange-600 mt-1">
                    {levelData?.isAdmin 
                      ? `${levelData?.adminPassedUpCount || 0} sales received` 
                      : `${levelData?.passedUpCount || 0} sales passed up`}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* RentAPog Template - Prominent Feature for Users with Domains */}
          {purchasedDomains.length > 0 && !user?.isAdmin && (
            <Card className="my-6 border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Rocket className="h-6 w-6 text-blue-600" />
                  🚀 Deploy Your RentAPog Landing Page
                </CardTitle>
                <p className="text-slate-600 text-sm mt-1">
                  Turn your domain into a professional RentAPog affiliate page with your link embedded!
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Deployed Sites Section */}
                  {purchasedDomains.some((d: any) => d.hasRentAPogTemplate) && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-4">
                      <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <span className="text-lg">✅</span> Your Deployed RentAPog Sites
                      </h3>
                      <div className="space-y-2">
                        {purchasedDomains
                          .filter((d: any) => d.hasRentAPogTemplate)
                          .map((domain: any) => (
                            <div key={domain.id} className="flex items-center justify-between bg-white p-3 rounded border border-green-100">
                              <span className="text-sm font-medium text-slate-700">{domain.domainName}</span>
                              <a
                                href={`https://${domain.domainName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md font-medium transition-colors"
                              >
                                View Site
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-slate-700 mb-3">
                      <strong>What you get:</strong> A fully branded RentAPog landing page with signup form, your affiliate code, and unique AI-generated content. Every page is different!
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {purchasedDomains.map((domain: any) => (
                        <Button
                          key={domain.id}
                          onClick={async () => {
                            const btn = document.querySelector(`[data-testid="quick-rentapog-${domain.id}"]`) as HTMLButtonElement;
                            if (btn) {
                              btn.disabled = true;
                              btn.textContent = 'Deploying...';
                            }
                            try {
                              const res = await fetch(`/api/domains/${domain.domainName}/deploy-rentapog-template`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: user?.id })
                              });
                              const data = await res.json();
                              if (data.success) {
                                alert(`✅ RentAPog page deployed to ${domain.domainName}!\n\nYour affiliate link is embedded.\nVisit ${domain.domainName} to see it!`);
                              } else {
                                alert('Error: ' + (data.error || 'Failed to deploy'));
                              }
                            } catch (err) {
                              alert('Error deploying template');
                            }
                            if (btn) {
                              btn.disabled = false;
                              btn.textContent = `Deploy to ${domain.domainName}`;
                            }
                          }}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold"
                          data-testid={`quick-rentapog-${domain.id}`}
                        >
                          <Rocket className="h-4 w-4 mr-2" />
                          Deploy to {domain.domainName}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stripe Status Panel - Admin Only */}
          {user?.isAdmin && (
            <Card className="mb-6 border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                  💳 Stripe Configuration & Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={fetchStripeStatus}
                    disabled={stripeStatusLoading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${stripeStatusLoading ? 'animate-spin' : ''}`} />
                    {stripeStatusLoading ? "Checking..." : "Check Stripe Status"}
                  </Button>
                </div>

                {stripeStatus && (
                  <div className="space-y-4">
                    {/* Key Status */}
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold text-slate-800 mb-3">API Keys Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Stripe API Key:</span>
                          <span className={`flex items-center gap-1 ${stripeStatus.stripeApiKey.configured ? 'text-green-600' : 'text-red-600'}`}>
                            {stripeStatus.stripeApiKey.configured ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            {stripeStatus.stripeApiKey.configured ? stripeStatus.stripeApiKey.masked : "Not configured"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Stripe Connect ID:</span>
                          <span className={`flex items-center gap-1 ${stripeStatus.stripeConnectClientId.configured ? 'text-green-600' : 'text-red-600'}`}>
                            {stripeStatus.stripeConnectClientId.configured ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            {stripeStatus.stripeConnectClientId.configured ? stripeStatus.stripeConnectClientId.masked : "Not configured"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Webhook Secret:</span>
                          <span className={`flex items-center gap-1 ${stripeStatus.stripeWebhookSecret.configured ? 'text-green-600' : 'text-red-600'}`}>
                            {stripeStatus.stripeWebhookSecret.configured ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            {stripeStatus.stripeWebhookSecret.configured ? stripeStatus.stripeWebhookSecret.masked : "Not configured"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Connection Test */}
                    {stripeStatus.connectionTest && (
                      <div className={`rounded-lg p-4 border ${stripeStatus.connectionTest.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          {stripeStatus.connectionTest.success ? <CheckCircle className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-red-600" />}
                          Connection Test
                        </h4>
                        <p className={stripeStatus.connectionTest.success ? 'text-green-700' : 'text-red-700'}>
                          {stripeStatus.connectionTest.message}
                        </p>
                        {stripeStatus.connectionTest.success && stripeStatus.connectionTest.availableBalance && (
                          <div className="mt-2 text-sm">
                            <p className="text-green-700">
                              Available: {stripeStatus.connectionTest.availableBalance.map((b: any) => `$${b.amount.toFixed(2)} ${b.currency}`).join(", ") || "$0.00"}
                            </p>
                            <p className="text-green-600">
                              Pending: {stripeStatus.connectionTest.pendingBalance.map((b: any) => `$${b.amount.toFixed(2)} ${b.currency}`).join(", ") || "$0.00"}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recent Payments */}
                    {stripeStatus.recentPayments && stripeStatus.recentPayments.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-slate-800 mb-3">Recent Payments</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {stripeStatus.recentPayments.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2">
                              <div>
                                <span className="font-medium">${p.amount} {p.currency}</span>
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${p.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {p.status}
                                </span>
                              </div>
                              <span className="text-slate-500 text-xs">{p.created}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Affiliate Link Tester */}
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Test Affiliate Link
                  </h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter affiliate code (e.g., rentapog)"
                      value={affiliateTestCode}
                      onChange={(e) => setAffiliateTestCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={testAffiliateLink}
                      disabled={affiliateTestLoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {affiliateTestLoading ? "Testing..." : "Test"}
                    </Button>
                  </div>

                  {affiliateTestResult && (
                    <div className={`mt-3 p-3 rounded ${affiliateTestResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      {affiliateTestResult.valid ? (
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-green-700 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" /> Affiliate Found!
                          </p>
                          <p><strong>Name:</strong> {affiliateTestResult.affiliateName}</p>
                          <p><strong>Email:</strong> {affiliateTestResult.affiliateEmail}</p>
                          <p><strong>Stripe Connected:</strong> {affiliateTestResult.stripeConnected ? "Yes" : "No"}</p>
                          <p><strong>Total Sales:</strong> {affiliateTestResult.totalSales}</p>
                          <p><strong>Total Earnings:</strong> ${affiliateTestResult.totalEarnings.toFixed(2)}</p>
                        </div>
                      ) : (
                        <p className="text-red-700 flex items-center gap-1">
                          <X className="h-4 w-4" /> {affiliateTestResult.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Environment Variables & Agent API Panel - Admin Only */}
          {user?.isAdmin && (
            <Card className="mb-6 border-2 border-teal-200 bg-teal-50" data-testid="env-vars-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-6 w-6 text-teal-600" />
                  🔐 Environment Variables & Agent API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={fetchEnvVars}
                    disabled={envVarsLoading}
                    className="bg-teal-600 hover:bg-teal-700"
                    data-testid="button-fetch-env-vars"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${envVarsLoading ? 'animate-spin' : ''}`} />
                    {envVarsLoading ? "Loading..." : "View Environment Variables"}
                  </Button>
                  <Button
                    onClick={() => setShowAgentDocs(!showAgentDocs)}
                    variant="outline"
                    className="border-teal-400"
                    data-testid="button-toggle-agent-docs"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    {showAgentDocs ? "Hide" : "Show"} Agent API Docs
                  </Button>
                </div>

                {envVars && (
                  <div className="space-y-4">
                    {Object.entries(envVars).map(([category, vars]: [string, any]) => (
                      <div key={category} className="bg-white rounded-lg p-4 border border-teal-200">
                        <h4 className="font-semibold text-slate-800 mb-3 capitalize">{category}</h4>
                        <div className="space-y-2">
                          {Object.entries(vars).map(([key, val]: [string, any]) => (
                            <div key={key} className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 font-mono text-xs">{key}</span>
                              <span className={`flex items-center gap-1 ${val.configured ? 'text-green-600' : 'text-red-600'}`}>
                                {val.configured ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                {val.value || val.masked || (val.configured ? "Configured" : "Not set")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showAgentDocs && (
                  <div className="bg-white rounded-lg p-4 border border-teal-200">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      External AI Agent API Documentation
                    </h4>
                    <div className="text-sm space-y-4">
                      <div className="bg-slate-50 p-3 rounded border">
                        <p className="font-medium text-slate-700 mb-2">Authentication</p>
                        <p className="text-slate-600 mb-2">All agent API endpoints require API key authentication:</p>
                        <code className="block bg-slate-100 p-2 rounded text-xs">
                          Header: X-API-Key: YOUR_ADMIN_PIN
                        </code>
                        <p className="text-slate-500 mt-2 text-xs">Your ADMIN_PIN is the API key for external agents.</p>
                      </div>

                      <div className="space-y-3">
                        <p className="font-medium text-slate-700">Available Endpoints:</p>
                        
                        <div className="border-l-4 border-teal-400 pl-3">
                          <p className="font-mono text-xs font-medium">GET /api/agent/env-vars</p>
                          <p className="text-slate-600 text-xs">View all environment variables (masked)</p>
                        </div>
                        
                        <div className="border-l-4 border-teal-400 pl-3">
                          <p className="font-mono text-xs font-medium">GET /api/agent/dns-records</p>
                          <p className="text-slate-600 text-xs">List all Cloudflare DNS records</p>
                        </div>
                        
                        <div className="border-l-4 border-teal-400 pl-3">
                          <p className="font-mono text-xs font-medium">POST /api/agent/fix-subdomain-proxy/:subdomain</p>
                          <p className="text-slate-600 text-xs">Enable Cloudflare proxy for a subdomain</p>
                        </div>
                        
                        <div className="border-l-4 border-teal-400 pl-3">
                          <p className="font-mono text-xs font-medium">POST /api/agent/fix-all-subdomain-proxies</p>
                          <p className="text-slate-600 text-xs">Enable proxy for all subdomains at once</p>
                        </div>
                        
                        <div className="border-l-4 border-teal-400 pl-3">
                          <p className="font-mono text-xs font-medium">GET /api/agent/users</p>
                          <p className="text-slate-600 text-xs">List all users (sanitized data)</p>
                        </div>
                        
                        <div className="border-l-4 border-teal-400 pl-3">
                          <p className="font-mono text-xs font-medium">GET /api/agent/domains</p>
                          <p className="text-slate-600 text-xs">List all rental domains</p>
                        </div>
                        
                        <div className="border-l-4 border-teal-400 pl-3">
                          <p className="font-mono text-xs font-medium">POST /api/agent/create-subdomain</p>
                          <p className="text-slate-600 text-xs">Create a new subdomain for a user</p>
                          <code className="block bg-slate-100 p-1 rounded text-xs mt-1">
                            Body: {"{"} "subdomain": "name", "userId": "uuid" {"}"}
                          </code>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p className="font-medium text-yellow-800 text-xs">Example cURL Request:</p>
                        <code className="block bg-yellow-100 p-2 rounded text-xs mt-2 whitespace-pre-wrap break-all">
{`curl -X GET https://rentapog.com/api/agent/users \\
  -H "X-API-Key: YOUR_ADMIN_PIN"`}
                        </code>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Test Panel - Admin Only */}
          {user?.isAdmin && (
            <Card className="mb-6 border-2 border-orange-200 bg-orange-50" data-testid="payment-test-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-orange-600" />
                  🧪 Payment Simulation (Test Pass-Up Logic)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <p className="text-sm text-slate-600 mb-4">
                    Simulate payments to test the affiliate pass-up logic. Sale #2 goes to admin, all others go to the affiliate.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Affiliate Code</label>
                      <Input
                        placeholder="Enter affiliate code (e.g., rentacubicle)"
                        value={paymentTestCode}
                        onChange={(e) => setPaymentTestCode(e.target.value)}
                        className="mt-1"
                        data-testid="input-payment-test-code"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700">Package ($20 default)</label>
                      <select
                        value={paymentTestPackage}
                        onChange={(e) => setPaymentTestPackage(Number(e.target.value))}
                        className="mt-1 w-full border rounded-md p-2 text-sm"
                        data-testid="select-payment-test-package"
                      >
                        <option value={1}>Package 1 - $20</option>
                        <option value={2}>Package 2 - $49</option>
                        <option value={3}>Package 3 - $79</option>
                        <option value={4}>Package 4 - $99</option>
                        <option value={5}>Package 5 - $149</option>
                        <option value={6}>Package 6 - $199</option>
                        <option value={7}>Package 7 - $249</option>
                        <option value={8}>Package 8 - $299</option>
                        <option value={9}>Package 9 - $349</option>
                        <option value={10}>Package 10 - $399</option>
                        <option value={11}>Package 11 - $499</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={simulatePayment}
                        disabled={paymentTestLoading || !paymentTestCode.trim()}
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                        data-testid="button-simulate-payment"
                      >
                        <Zap className={`h-4 w-4 mr-2 ${paymentTestLoading ? 'animate-pulse' : ''}`} />
                        {paymentTestLoading ? "Simulating..." : "Simulate Payment"}
                      </Button>
                      <Button
                        onClick={resetAffiliateSales}
                        disabled={resetLoading || !paymentTestCode.trim()}
                        variant="outline"
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        data-testid="button-reset-affiliate"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${resetLoading ? 'animate-spin' : ''}`} />
                        Reset to 0
                      </Button>
                    </div>
                  </div>
                </div>

                {paymentTestResult && (
                  <div className="bg-white rounded-lg p-4 border border-orange-200 space-y-3">
                    <div className={`p-3 rounded-lg ${paymentTestResult.simulation.saleNumber === 2 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                      <p className={`font-semibold ${paymentTestResult.simulation.saleNumber === 2 ? 'text-yellow-700' : 'text-green-700'}`}>
                        {paymentTestResult.explanation}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-slate-500">Sale #</span>
                        <p className="font-bold text-lg">{paymentTestResult.simulation.saleNumber}</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-slate-500">Amount</span>
                        <p className="font-bold text-lg">{paymentTestResult.simulation.packageAmount}</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-slate-500">Credited To</span>
                        <p className="font-semibold">{paymentTestResult.simulation.creditedTo}</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-slate-500">Balance After</span>
                        <p className="font-bold text-green-600">{paymentTestResult.simulation.balanceAfter}</p>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-slate-700 mb-2">Next Sale Preview:</p>
                      <p className={`text-sm ${paymentTestResult.nextSale.willBeSaleNumber === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                        Sale #{paymentTestResult.nextSale.willBeSaleNumber} will go to: <strong>{paymentTestResult.nextSale.willGoTo}</strong>
                      </p>
                    </div>

                    {paymentTestResult.salesHistory && paymentTestResult.salesHistory.length > 0 && (
                      <div className="border-t pt-3">
                        <p className="text-sm font-medium text-slate-700 mb-2">Sales History:</p>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {paymentTestResult.salesHistory.map((sale: any, idx: number) => (
                            <div key={idx} className={`text-xs p-2 rounded flex justify-between ${sale.passedUpTo === 'admin' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                              <span>Sale #{sale.saleNumber} - {sale.amount}</span>
                              <span className={sale.passedUpTo === 'admin' ? 'text-yellow-600' : 'text-green-600'}>
                                → {sale.passedUpTo === 'admin' ? 'Admin' : 'Affiliate'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>How Pass-Up Works:</strong><br/>
                    • Sale #1 → Affiliate gets 100%<br/>
                    • Sale #2 → Admin gets 100% (pass-up)<br/>
                    • Sale #3+ → Affiliate gets 100%
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Passed-Up Sales Panel - Admin Only */}
          {user?.isAdmin && (
            <Card className="mb-6 border-2 border-green-200 bg-green-50" data-testid="passed-up-sales-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  💰 Passed-Up Sales (Your Earnings)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-600">
                    Sales passed up from affiliates: Sale #2 + Under-leveled sales
                  </p>
                  <Button
                    onClick={fetchPassedUpSales}
                    disabled={passedUpLoading}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-load-passed-up"
                  >
                    {passedUpLoading ? "Loading..." : "Load Passed-Up Sales"}
                  </Button>
                </div>

                {passedUpSales && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-slate-500">Total Passed Up</p>
                        <p className="text-3xl font-bold text-green-600" data-testid="text-passed-up-count">
                          {passedUpSales.totalPassedUp}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-slate-500">Total Amount</p>
                        <p className="text-3xl font-bold text-green-600" data-testid="text-passed-up-total">
                          {passedUpSales.totalAmountFormatted}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-slate-500">Sale #2 Pass-ups</p>
                        <p className="text-2xl font-bold text-blue-600" data-testid="text-sale2-passed-up">
                          {passedUpSales.sale2PassedUpCount || 0}
                        </p>
                        <p className="text-xs text-blue-500">{passedUpSales.sale2PassedUpAmountFormatted || "$0.00"}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <p className="text-sm text-slate-500">Under-Leveled</p>
                        <p className="text-2xl font-bold text-orange-600" data-testid="text-level-passed-up">
                          {passedUpSales.levelPassedUpCount || 0}
                        </p>
                        <p className="text-xs text-orange-500">{passedUpSales.levelPassedUpAmountFormatted || "$0.00"}</p>
                      </div>
                    </div>

                    {passedUpSales.sales && passedUpSales.sales.length > 0 ? (
                      <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                        <div className="max-h-64 overflow-y-auto">
                          {passedUpSales.sales.map((sale: any, idx: number) => (
                            <div 
                              key={sale.id || idx}
                              className={`flex items-center justify-between p-3 border-b border-green-100 last:border-b-0 ${sale.passedUpReason === 'under_leveled' ? 'bg-orange-50' : ''}`}
                              data-testid={`passed-up-row-${idx}`}
                            >
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {sale.sellerName} <span className="text-slate-500 text-sm">({sale.sellerReferralCode})</span>
                                </p>
                                <p className="text-xs text-slate-500">{sale.sellerEmail}</p>
                                <p className="text-xs text-slate-400">{sale.date}</p>
                                {sale.passedUpReason === 'under_leveled' && (
                                  <p className="text-xs text-orange-600 font-medium mt-1">
                                    ⬆️ Under-leveled: Seller ${sale.sellerLevel ? (sale.sellerLevel / 100).toFixed(0) : '0'} &lt; Buyer ${sale.buyerLevel ? (sale.buyerLevel / 100).toFixed(0) : '0'}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-green-600">{sale.amountFormatted}</p>
                                <p className={`text-xs ${sale.passedUpReason === 'under_leveled' ? 'text-orange-600' : 'text-blue-600'}`}>
                                  {sale.passedUpReason === 'under_leveled' ? 'Under-Leveled' : `Sale #${sale.saleNumber}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <p>No passed-up sales yet.</p>
                        <p className="text-sm mt-2">When affiliates make their 2nd sale or sell above their level, it will appear here!</p>
                      </div>
                    )}
                  </div>
                )}

                {!passedUpSales && (
                  <div className="text-center py-6 text-slate-500">
                    <p>Click "Load Passed-Up Sales" to view your earnings from the pass-up system.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* All Platform Sales - Admin Only */}
          {user?.isAdmin && (
            <Card className="mb-6 border-2 border-emerald-200 bg-emerald-50" data-testid="all-platform-sales-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                  📊 All Platform Sales
                </CardTitle>
                <p className="text-sm text-emerald-600">View every affiliate sale across the platform</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={fetchAllPlatformSales}
                  disabled={allPlatformSalesLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="button-load-all-platform-sales"
                >
                  {allPlatformSalesLoading ? "Loading..." : "Load All Platform Sales"}
                </Button>

                {allPlatformSales && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-emerald-200 text-center">
                        <p className="text-3xl font-bold text-emerald-600">{allPlatformSales.totalSales}</p>
                        <p className="text-sm text-slate-600">Total Sales</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-emerald-200 text-center">
                        <p className="text-3xl font-bold text-emerald-600">{allPlatformSales.totalAmountFormatted}</p>
                        <p className="text-sm text-slate-600">Total Revenue</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                        <p className="text-3xl font-bold text-blue-600">{allPlatformSales.creditedAmountFormatted}</p>
                        <p className="text-sm text-slate-600">To Affiliates ({allPlatformSales.creditedCount})</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
                        <p className="text-3xl font-bold text-purple-600">{allPlatformSales.passedUpAmountFormatted}</p>
                        <p className="text-sm text-slate-600">Passed to Admin ({allPlatformSales.passedUpCount})</p>
                      </div>
                    </div>

                    {allPlatformSales.sales && allPlatformSales.sales.length > 0 ? (
                      <div className="bg-white rounded-lg border border-emerald-200 p-4">
                        <h4 className="font-semibold text-slate-700 mb-3">All Sales ({allPlatformSales.sales.length})</h4>
                        <div className="max-h-96 overflow-y-auto space-y-3">
                          {allPlatformSales.sales.map((sale: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                              <div>
                                <p className="font-medium text-slate-800">{sale.sellerName}</p>
                                <p className="text-xs text-indigo-600 font-medium">@{sale.sellerReferralCode}</p>
                                <p className="text-xs text-slate-500">{sale.sellerEmail}</p>
                                <p className="text-xs text-slate-400">{sale.date} | Sale #{sale.saleNumber}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-emerald-600">{sale.amountFormatted}</p>
                                <p className={`text-xs ${sale.wasPassedUp ? 'text-purple-600' : 'text-blue-600'}`}>
                                  {sale.wasPassedUp ? 'Passed to Admin' : 'Credited to Affiliate'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <p>No sales recorded yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {!allPlatformSales && (
                  <div className="text-center py-6 text-slate-500">
                    <p>Click "Load All Platform Sales" to view all affiliate sales across the platform.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Your Affiliate Link */}
          {user && (
            <Card className="mb-6 border-2 border-indigo-200 bg-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-indigo-600" />
                  🔗 Your Affiliate Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white border-2 border-indigo-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Promote This Link</p>
                      <p className="font-mono text-indigo-700 font-semibold text-lg">rentapog.com/?aff={user.referralCode || user.affiliateLink}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://rentapog.com/?aff=${user.referralCode || user.affiliateLink}`);
                        toast({ title: "✓ Affiliate Link Copied!" });
                      }}
                      className="bg-indigo-100 hover:bg-indigo-200 border-indigo-300"
                      data-testid="button-copy-affiliate-link"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  💡 <strong>Tip:</strong> Share this link everywhere - social media, emails, forums - to start earning commissions!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Live Upgrade Feed */}
          <LiveUpgradeFeed />

          {/* Referrals List */}
          {!statsLoading && stats && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⏱️ <strong>Important:</strong> We're not sure how long it will take for the system to match your first 3 referrals. If you don't know anyone who will upgrade, don't rely on the system—focus on promoting yourself!
                  </p>
                </div>

                {stats.referralCount === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No referrals yet</p>
                    <p className="text-sm text-slate-500">Share your referral link to start building your team!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats.referrals.map((ref: any, idx: number) => (
                      <div key={ref.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <p className="font-medium text-slate-900">{idx + 1}. {ref.name}</p>
                          <p className="text-xs text-indigo-600 font-medium">@{ref.referralCode || "N/A"}</p>
                          <p className="text-xs text-slate-600">{ref.email}</p>
                          {ref.packagePurchased > 0 && (
                            <p className="text-xs text-green-600 font-semibold mt-1">📦 ${(ref.packagePurchased / 100).toFixed(0)} Package</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-700">{ref.salesCount}</p>
                          <p className="text-xs text-slate-500">sales</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Coey AI Assistant Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-purple-600" />
                🤖 Ask Coey - Your Marketing AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Get instant marketing advice, copy ideas, and strategies to grow your affiliate business.
              </p>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Question</label>
                  <textarea
                    placeholder="E.g., How do I promote my domain on TikTok? What's a good email subject line?"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleCoeyChat}
                  disabled={loading}
                >
                  {loading ? "Thinking..." : "Ask Coey"}
                </Button>
              </div>

              {coeyResponse && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-900">{coeyResponse}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* FREE Subdomain Registration */}
          {user && (
            <Card className="border-2 border-cyan-200">
              <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  FREE Subdomain - Get Your Custom Link!
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Intro Explanation */}
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                  <p className="text-cyan-800 mb-3">
                    Instead of sharing ugly links like <span className="text-slate-500 line-through">rentapog.com/?aff=abc123</span>, 
                    get a clean link like <strong className="text-cyan-700">yourname.rentapog.com</strong> - for FREE!
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-white border border-cyan-300 rounded p-3">
                      <p className="font-bold text-cyan-700 mb-1">FREE Subdomain</p>
                      <ul className="text-slate-600 text-xs space-y-1">
                        <li>✓ 100% FREE forever</li>
                        <li>✓ Ready in seconds</li>
                        <li>✓ Perfect for beginners</li>
                      </ul>
                    </div>
                    <div className="bg-white border border-emerald-300 rounded p-3">
                      <p className="font-bold text-emerald-700 mb-1">Own Domain ($8.99/yr)</p>
                      <ul className="text-slate-600 text-xs space-y-1">
                        <li>✓ 100% your brand</li>
                        <li>✓ More professional</li>
                        <li>✓ Build long-term value</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {userSubdomain ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-bold">Your Subdomain is Active!</span>
                    </div>
                    <div className="bg-white border-2 border-green-300 rounded-lg p-4 mb-4">
                      <p className="text-cyan-700 text-xl font-mono font-bold" data-testid="text-user-subdomain">
                        {userSubdomain}.rentapog.com
                      </p>
                    </div>
                    <div className="bg-green-100 border border-green-300 rounded p-3 mb-4">
                      <p className="text-green-800 font-bold mb-2">How to Use:</p>
                      <ol className="text-green-700 text-sm space-y-1">
                        <li><strong>1.</strong> Share your link on social media, emails, anywhere!</li>
                        <li><strong>2.</strong> Visitors are automatically sent to your signup page</li>
                        <li><strong>3.</strong> They signup with YOUR code = You earn commissions!</li>
                      </ol>
                    </div>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://${userSubdomain}.rentapog.com`);
                        toast({ title: "✓ Subdomain Link Copied!" });
                      }}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                      data-testid="button-copy-subdomain"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Your Subdomain Link
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 3 Steps */}
                    <div className="bg-white border border-cyan-200 rounded-lg p-4">
                      <h4 className="text-cyan-800 font-bold mb-3">How It Works (3 Easy Steps):</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="bg-cyan-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                          <div>
                            <p className="font-bold text-slate-800">Choose Your Name</p>
                            <p className="text-slate-600 text-sm">Pick your name, nickname, or brand</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-cyan-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                          <div>
                            <p className="font-bold text-slate-800">Click Register</p>
                            <p className="text-slate-600 text-sm">We create it instantly - no payment!</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-cyan-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                          <div>
                            <p className="font-bold text-slate-800">Share Your Link</p>
                            <p className="text-slate-600 text-sm">Copy and share everywhere!</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Registration Form */}
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
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* My Purchased Domains */}
          {purchasedDomains.length > 0 && (
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  My Domains ({purchasedDomains.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* How to Deploy Your Website Guide */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    How to Put Your Website on Your Domain (3 Easy Steps)
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <div>
                        <p className="font-bold text-slate-800">Choose a Template or Build with AI</p>
                        <p className="text-slate-600 text-sm">Select a pre-made template from the dropdown (recommended!) or describe your business and let AI create a custom site for you.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <div>
                        <p className="font-bold text-slate-800">Preview Your Website</p>
                        <p className="text-slate-600 text-sm">Click "Preview" to see how your site looks. Not happy? Click "Try Again" to generate a new design or pick a different template.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <div>
                        <p className="font-bold text-slate-800">Click "Go Live!" to Publish</p>
                        <p className="text-slate-600 text-sm">Hit the green "Go Live!" button and your website will be uploaded to your domain instantly. Anyone who visits your domain will see your site!</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg border border-purple-100">
                    <p className="text-sm text-purple-700">
                      <strong>Pro Tip:</strong> Each template includes a signup form. When visitors fill it out, they become YOUR referrals and you earn commissions on their purchases!
                    </p>
                  </div>
                </div>

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
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Button
                            onClick={() => fetchDnsRecords(domain.domainName)}
                            variant="outline"
                            size="sm"
                            className="border-purple-300"
                            data-testid={`button-manage-dns-${domain.id}`}
                          >
                            Manage DNS
                          </Button>
                          <Button
                            onClick={async () => {
                              if (!user?.id) return;
                              const btn = document.querySelector(`[data-testid="button-regenerate-${domain.id}"]`) as HTMLButtonElement;
                              if (btn) btn.disabled = true;
                              try {
                                const res = await fetch(`/api/domains/${domain.domainName}/regenerate-placeholder`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: user.id })
                                });
                                const data = await res.json();
                                if (data.success) {
                                  alert(`Coming Soon page updated!\n\nColor: ${data.colorScheme}\nTagline: ${data.tagline}\n\nVisit ${domain.domainName} to see it!`);
                                } else {
                                  alert('Error: ' + (data.error || 'Failed to regenerate'));
                                }
                              } catch (err) {
                                alert('Error regenerating page');
                              }
                              if (btn) btn.disabled = false;
                            }}
                            variant="outline"
                            size="sm"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                            data-testid={`button-regenerate-${domain.id}`}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Regenerate Coming Soon
                          </Button>
                          <Button
                            onClick={async () => {
                              if (!user?.id) return;
                              const btn = document.querySelector(`[data-testid="button-rentapog-template-${domain.id}"]`) as HTMLButtonElement;
                              if (btn) {
                                btn.disabled = true;
                                btn.textContent = 'Deploying...';
                              }
                              try {
                                const res = await fetch(`/api/domains/${domain.domainName}/deploy-rentapog-template`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: user.id })
                                });
                                const data = await res.json();
                                if (data.success) {
                                  alert(`RentAPog branded page deployed!\n\nYour affiliate link is embedded.\nVisit ${domain.domainName} to see it!`);
                                } else {
                                  alert('Error: ' + (data.error || 'Failed to deploy template'));
                                }
                              } catch (err) {
                                alert('Error deploying template');
                              }
                              if (btn) {
                                btn.disabled = false;
                                btn.innerHTML = '<svg class="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>Use RentAPog Template';
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            data-testid={`button-rentapog-template-${domain.id}`}
                          >
                            <Rocket className="h-3 w-3 mr-1" />
                            Use RentAPog Template
                          </Button>
                        </div>
                          
                        {/* AI Site Generator Section */}
                        {(() => {
                          const site = getSiteForDomain(domain.domainName);
                          const isGenerating = generatingSiteForDomain === domain.domainName;
                          const isDeploying = deployingSiteId === site?.id;
                          const description = siteDescriptions[domain.domainName] || "";
                          const selectedTemplate = selectedTemplates[domain.domainName] || "";
                          
                          return (
                            <div className="mb-3">
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  <Layout className="h-4 w-4 inline mr-1" />
                                  Choose a Pre-Made Template (Recommended)
                                </label>
                                <select
                                  value={selectedTemplate}
                                  onChange={(e) => setSelectedTemplates(prev => ({ ...prev, [domain.domainName]: e.target.value }))}
                                  className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white"
                                  data-testid={`select-template-${domain.id}`}
                                >
                                  <option value="">-- Select a Template --</option>
                                  {websiteTemplates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} - {t.niche}</option>
                                  ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Each template includes a signup form with name, email, username, password, and referrer fields</p>
                                
                                {/* Template Preview & Editor */}
                                {selectedTemplate && (() => {
                                  const template = getTemplateById(selectedTemplate);
                                  if (!template) return null;
                                  
                                  const selectedColorId = selectedColorSchemes[domain.domainName] || 'blue';
                                  const currentWordingIndex = wordingVariantIndex[domain.domainName] || 0;
                                  const colorScheme = getColorSchemeById(selectedColorId) || { gradientFrom: '#1e40af', gradientTo: '#3b82f6', buttonBg: '#2563eb', secondary: '#1e40af', primary: '#2563eb' };
                                  
                                  const customization = templateCustomizations[domain.domainName] || {
                                    headline: template.defaultHeadline,
                                    subheadline: template.defaultSubheadline,
                                    features: [...template.defaultFeatures]
                                  };
                                  
                                  const baseHtml = template.getHtml(domain.domainName, user?.username || 'yourname', customization);
                                  const colorOverrideCSS = `<style>.hero { background: linear-gradient(135deg, ${colorScheme.gradientFrom} 0%, ${colorScheme.gradientTo} 100%) !important; } .signup-form button { background: ${colorScheme.buttonBg} !important; } .signup-form button:hover { background: ${colorScheme.secondary} !important; } .features h2, .feature-card h3 { color: ${colorScheme.primary} !important; }</style>`;
                                  const previewHtml = baseHtml.replace('</head>', colorOverrideCSS + '</head>');
                                  
                                  const updateCustomization = (field: string, value: any) => {
                                    setTemplateCustomizations(prev => ({
                                      ...prev,
                                      [domain.domainName]: {
                                        ...customization,
                                        [field]: value
                                      }
                                    }));
                                  };
                                  
                                  const handleRedo = () => {
                                    const nextColorIndex = (colorSchemes.findIndex(c => c.id === selectedColorId) + 1) % colorSchemes.length;
                                    const nextWordingIndex = currentWordingIndex + 1;
                                    const variant = getWordingVariant(selectedTemplate, nextWordingIndex);
                                    
                                    setSelectedColorSchemes(prev => ({ ...prev, [domain.domainName]: colorSchemes[nextColorIndex].id }));
                                    setWordingVariantIndex(prev => ({ ...prev, [domain.domainName]: nextWordingIndex }));
                                    
                                    if (variant) {
                                      setTemplateCustomizations(prev => ({
                                        ...prev,
                                        [domain.domainName]: {
                                          ...customization,
                                          headline: variant.headline,
                                          subheadline: variant.subheadline
                                        }
                                      }));
                                    }
                                  };
                                  
                                  return (
                                    <div className="mt-3 border-2 border-green-300 rounded-lg overflow-hidden">
                                      <div className="bg-green-100 px-3 py-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-green-800">
                                          {template.name} for {domain.domainName}
                                        </span>
                                        <span className="text-xs text-green-600">{template.niche}</span>
                                      </div>
                                      
                                      {/* Color Scheme & Redo Controls */}
                                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 p-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                          <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs font-semibold text-purple-700 mb-1">Color Scheme</label>
                                            <select
                                              value={selectedColorId}
                                              onChange={(e) => setSelectedColorSchemes(prev => ({ ...prev, [domain.domainName]: e.target.value }))}
                                              className="w-full p-2 border border-purple-300 rounded text-sm bg-white"
                                              data-testid={`select-color-${domain.id}`}
                                            >
                                              {colorSchemes.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                              ))}
                                            </select>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div 
                                              className="w-8 h-8 rounded-full border-2 border-white shadow-md" 
                                              style={{ background: `linear-gradient(135deg, ${colorScheme.gradientFrom}, ${colorScheme.gradientTo})` }}
                                              title={colorScheme.name}
                                            />
                                            <Button
                                              onClick={handleRedo}
                                              size="sm"
                                              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600"
                                              data-testid={`button-redo-${domain.id}`}
                                            >
                                              <RefreshCw className="h-4 w-4 mr-1" />
                                              Redo (New Colors & Words)
                                            </Button>
                                          </div>
                                        </div>
                                        <p className="text-xs text-purple-600 mt-2">Click "Redo" to cycle through 10 different color schemes and 5 wording variations!</p>
                                      </div>
                                      
                                      {/* Instructions */}
                                      <div className="bg-blue-50 border-b border-blue-200 p-3">
                                        <p className="text-sm font-semibold text-blue-800 mb-2">How to Customize Your Website:</p>
                                        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                                          <li><strong>Edit the Headline</strong> - This is the big text visitors see first. Make it catchy and describe what you offer.</li>
                                          <li><strong>Edit the Subheadline</strong> - Add more details about your rental business. What makes you special?</li>
                                          <li><strong>Edit the 3 Features</strong> - These highlight your best selling points. Keep them short and punchy.</li>
                                          <li><strong>Preview updates instantly</strong> - See your changes in the preview below as you type.</li>
                                          <li><strong>Click "Use This Template"</strong> - When happy, click the button to save and prepare for publishing.</li>
                                        </ol>
                                        <p className="text-xs text-blue-600 mt-2 italic">Your domain name "{domain.domainName}" will appear automatically on the website!</p>
                                      </div>
                                      
                                      {/* Editing Fields */}
                                      <div className="bg-white p-4 space-y-3 border-b border-slate-200">
                                        <div>
                                          <label className="block text-xs font-semibold text-slate-600 mb-1">Main Headline (the big text at the top)</label>
                                          <input
                                            type="text"
                                            value={customization.headline}
                                            onChange={(e) => updateCustomization('headline', e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded text-sm"
                                            placeholder="e.g., Rent Premium Equipment Today"
                                            data-testid={`input-headline-${domain.id}`}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold text-slate-600 mb-1">Subheadline (explains more about your service)</label>
                                          <textarea
                                            value={customization.subheadline}
                                            onChange={(e) => updateCustomization('subheadline', e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded text-sm resize-none"
                                            rows={2}
                                            placeholder="e.g., Professional-grade equipment available for daily rental..."
                                            data-testid={`input-subheadline-${domain.id}`}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold text-slate-600 mb-1">Feature 1 (your first selling point)</label>
                                          <input
                                            type="text"
                                            value={customization.features[0] || ''}
                                            onChange={(e) => {
                                              const newFeatures = [...customization.features];
                                              newFeatures[0] = e.target.value;
                                              updateCustomization('features', newFeatures);
                                            }}
                                            className="w-full p-2 border border-slate-300 rounded text-sm"
                                            placeholder="e.g., Wide Selection"
                                            data-testid={`input-feature1-${domain.id}`}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold text-slate-600 mb-1">Feature 2 (your second selling point)</label>
                                          <input
                                            type="text"
                                            value={customization.features[1] || ''}
                                            onChange={(e) => {
                                              const newFeatures = [...customization.features];
                                              newFeatures[1] = e.target.value;
                                              updateCustomization('features', newFeatures);
                                            }}
                                            className="w-full p-2 border border-slate-300 rounded text-sm"
                                            placeholder="e.g., Fast Delivery"
                                            data-testid={`input-feature2-${domain.id}`}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold text-slate-600 mb-1">Feature 3 (your third selling point)</label>
                                          <input
                                            type="text"
                                            value={customization.features[2] || ''}
                                            onChange={(e) => {
                                              const newFeatures = [...customization.features];
                                              newFeatures[2] = e.target.value;
                                              updateCustomization('features', newFeatures);
                                            }}
                                            className="w-full p-2 border border-slate-300 rounded text-sm"
                                            placeholder="e.g., Great Prices"
                                            data-testid={`input-feature3-${domain.id}`}
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Live Preview */}
                                      <div className="bg-slate-100 px-3 py-2">
                                        <span className="text-xs font-medium text-slate-600">Live Preview (updates as you type):</span>
                                      </div>
                                      <iframe
                                        srcDoc={previewHtml}
                                        className="w-full h-80 bg-white"
                                        title={`Preview of ${template.name}`}
                                        sandbox="allow-scripts"
                                      />
                                    </div>
                                  );
                                })()}
                              </div>
                              
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Or describe your website (for AI generation)
                                </label>
                                <textarea
                                  value={description}
                                  onChange={(e) => setSiteDescriptions(prev => ({ ...prev, [domain.domainName]: e.target.value }))}
                                  placeholder="e.g., A dog walking service in Miami, FL. We offer daily walks, pet sitting, and dog training."
                                  className="w-full p-2 border border-slate-300 rounded-md text-sm resize-none"
                                  rows={2}
                                  data-testid={`input-site-description-${domain.id}`}
                                />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {!site ? (
                                  <>
                                    {selectedTemplate && (
                                      <Button
                                        onClick={() => useTemplate(domain.domainName, domain.id, selectedTemplate)}
                                        disabled={isGenerating}
                                        size="sm"
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                        data-testid={`button-use-template-${domain.id}`}
                                      >
                                        <Layout className="h-4 w-4 mr-1" />
                                        {isGenerating ? "Creating..." : "Use This Template"}
                                      </Button>
                                    )}
                                    <Button
                                      onClick={() => createAndGenerateSite(domain.domainName, domain.id, description)}
                                      disabled={isGenerating}
                                      size="sm"
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                      data-testid={`button-build-site-${domain.id}`}
                                    >
                                      <Zap className="h-4 w-4 mr-1" />
                                      {isGenerating ? "Building..." : "Build with AI Instead"}
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    {selectedTemplate && (
                                      <Button
                                        onClick={() => useTemplate(domain.domainName, domain.id, selectedTemplate)}
                                        disabled={isGenerating}
                                        size="sm"
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                        data-testid={`button-reapply-template-${domain.id}`}
                                      >
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        {isGenerating ? "Applying..." : "Apply New Colors"}
                                      </Button>
                                    )}
                                    <Button
                                      onClick={() => regenerateSite(site.id, description)}
                                      disabled={isGenerating}
                                      variant="outline"
                                      size="sm"
                                      className="border-orange-400 text-orange-600 hover:bg-orange-50"
                                      data-testid={`button-try-again-${domain.id}`}
                                    >
                                      <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                                      {isGenerating ? "Regenerating..." : "AI Regenerate"}
                                    </Button>
                                    {site.htmlContent && (
                                      <>
                                        <Button
                                          onClick={() => setShowSitePreview(showSitePreview === site.id ? null : site.id)}
                                          variant="outline"
                                          size="sm"
                                          className="border-blue-400"
                                          data-testid={`button-preview-site-${domain.id}`}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          {showSitePreview === site.id ? "Hide Preview" : "Preview"}
                                        </Button>
                                        <Button
                                          onClick={() => deploySite(site.id)}
                                          disabled={isDeploying}
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700 text-white"
                                          data-testid={`button-deploy-site-${domain.id}`}
                                        >
                                          <Rocket className="h-4 w-4 mr-1" />
                                          {isDeploying ? "Deploying..." : site.liveUrl ? "Update Live Site" : "Go Live!"}
                                        </Button>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                              
                              {/* Live URL Display Box */}
                              {(() => {
                                const site = getSiteForDomain(domain.domainName);
                                if (site?.liveUrl) {
                                  return (
                                    <div className="mt-3 p-3 bg-green-50 border-2 border-green-300 rounded-lg" data-testid={`live-url-box-${domain.id}`}>
                                      <p className="text-xs font-semibold text-green-700 mb-1">Your Live Website:</p>
                                      <a
                                        href={site.liveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:text-green-800 hover:underline font-medium flex items-center gap-2 break-all"
                                        data-testid={`live-url-link-${domain.id}`}
                                      >
                                        <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                        {site.liveUrl}
                                      </a>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          );
                        })()}
                        
                        {/* Site Preview */}
                        {(() => {
                          const site = getSiteForDomain(domain.domainName);
                          if (site && showSitePreview === site.id && site.htmlContent) {
                            return (
                              <div className="mb-3 border-2 border-blue-200 rounded-lg overflow-hidden">
                                <div className="bg-blue-100 px-3 py-2 flex justify-between items-center">
                                  <span className="text-sm font-medium text-blue-800">Site Preview</span>
                                  {site.liveUrl && (
                                    <a
                                      href={site.liveUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      Live: {site.liveUrl} <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                                <iframe
                                  srcDoc={site.htmlContent}
                                  className="w-full h-96 bg-white"
                                  title={`Preview of ${domain.domainName}`}
                                  sandbox="allow-scripts"
                                />
                              </div>
                            );
                          }
                          return null;
                        })()}
                        
                        {/* DNS Management Panel */}
                        {selectedDomain === domain.domainName && (
                          <div className="mt-4 pt-4 border-t border-purple-200 space-y-3">
                            <h5 className="font-semibold text-slate-800">DNS Records</h5>
                            
                            {dnsLoading ? (
                              <p className="text-slate-500 text-sm">Loading DNS records...</p>
                            ) : (
                              <>
                                {dnsRecords.length > 0 ? (
                                  <div className="space-y-2">
                                    {dnsRecords.map((record: any, idx: number) => (
                                      <div key={idx} className="bg-slate-50 p-2 rounded text-sm flex justify-between">
                                        <span><strong>{record.hostname}</strong> ({record.type})</span>
                                        <span className="text-slate-600">{record.address}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-slate-500 text-sm">No DNS records found</p>
                                )}
                                
                                {/* Add DNS Record */}
                                <div className="bg-purple-50 p-3 rounded space-y-2">
                                  <p className="text-sm font-semibold text-purple-800">Add DNS Record</p>
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="@"
                                      value={newDnsRecord.hostname}
                                      onChange={(e) => setNewDnsRecord({...newDnsRecord, hostname: e.target.value})}
                                      className="w-20"
                                    />
                                    <select
                                      value={newDnsRecord.type}
                                      onChange={(e) => setNewDnsRecord({...newDnsRecord, type: e.target.value})}
                                      className="border rounded px-2"
                                    >
                                      <option value="A">A</option>
                                      <option value="CNAME">CNAME</option>
                                      <option value="TXT">TXT</option>
                                      <option value="MX">MX</option>
                                    </select>
                                    <Input
                                      placeholder="IP or value"
                                      value={newDnsRecord.address}
                                      onChange={(e) => setNewDnsRecord({...newDnsRecord, address: e.target.value})}
                                      className="flex-1"
                                    />
                                    <Button onClick={addDnsRecord} size="sm" className="bg-purple-600 hover:bg-purple-700">
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Branding - White-Label Franchise Sites */}
          <Card className="border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Your Own Brand - $29/month
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-indigo-900 font-semibold mb-2">Create Your White-Label Franchise Site with YOUR OWN Domain!</p>
                <p className="text-slate-700 text-sm mb-3">
                  Get your own branded "Rent a ___" website on YOUR custom domain. 
                  We register the domain for you - it's included in your $29/month!
                </p>
                <ul className="text-slate-700 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500" />
                    Your custom domain (e.g., rentaprofit.com)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500" />
                    Domain registration included in your $29/month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500" />
                    All sales through your site use YOUR affiliate link
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500" />
                    Full pass-up system applies (you keep all except 1st sale)
                  </li>
                </ul>
              </div>

              {/* Existing Branded Sites */}
              {brandingSubscriptions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800">Your Branded Sites:</h4>
                  {brandingSubscriptions.map((brand: any) => (
                    <div key={brand.id} className="bg-white border-2 border-indigo-300 rounded-lg p-4 space-y-2" data-testid={`brand-card-${brand.id}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-indigo-700 text-lg">{brand.brandName}</p>
                          {brand.customDomain ? (
                            <a 
                              href={`https://${brand.customDomain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline text-sm flex items-center gap-1"
                            >
                              {brand.customDomain} <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <a 
                              href={`https://${brand.brandSlug}.rentapog.com`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline text-sm flex items-center gap-1"
                            >
                              {brand.brandSlug}.rentapog.com <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {brand.customDomain && (
                            <p className={`text-xs mt-1 ${brand.domainRegistered ? 'text-green-600' : 'text-orange-600'}`}>
                              {brand.domainRegistered ? '✓ Domain registered' : '⏳ Domain registration pending'}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${brand.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {brand.status === 'active' ? 'Active' : 'Cancelled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-slate-600 text-sm">Sales: {brand.salesCount || 0}</p>
                        {brand.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelBranding(brand.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            data-testid={`button-cancel-brand-${brand.id}`}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create New Branded Site */}
              <div className="border-t border-indigo-200 pt-4">
                <h4 className="font-semibold text-slate-800 mb-3">Create a New Branded Site:</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-600 block mb-1">Brand Name (e.g., "Rent a Profit", "Domain Empire")</label>
                    <Input
                      placeholder="Your Brand Name"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      className="text-lg"
                      data-testid="input-brand-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 block mb-1">Custom Domain (e.g., rentaprofit.com)</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="yourdomain.com"
                        value={newCustomDomain}
                        onChange={(e) => {
                          setNewCustomDomain(e.target.value.toLowerCase());
                          setDomainAvailable(null);
                          setDomainCheckError("");
                        }}
                        className="text-lg flex-1"
                        data-testid="input-custom-domain"
                      />
                      <Button
                        onClick={() => checkDomainAvailability(newCustomDomain)}
                        disabled={domainCheckLoading || !newCustomDomain.trim()}
                        variant="outline"
                        className="border-indigo-300"
                        data-testid="button-check-domain"
                      >
                        {domainCheckLoading ? "Checking..." : "Check"}
                      </Button>
                    </div>
                    {domainAvailable === true && (
                      <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> {newCustomDomain} is available!
                      </p>
                    )}
                    {domainAvailable === false && (
                      <p className="text-red-600 text-sm mt-1">
                        {domainCheckError || "This domain is not available"}
                      </p>
                    )}
                    <p className="text-slate-500 text-xs mt-1">
                      We'll register this domain for you. It's included in your $29/month subscription!
                    </p>
                  </div>
                  <Button
                    onClick={handleBrandingCheckout}
                    disabled={brandingCheckoutLoading || newBrandName.length < 3 || domainAvailable !== true}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-lg"
                    data-testid="button-create-brand"
                  >
                    {brandingCheckoutLoading ? "Loading..." : "Create My Brand - $29/month"}
                  </Button>
                </div>
              </div>

              <p className="text-slate-500 text-xs text-center">
                Monthly subscription. Cancel anytime. 1st payment covers domain registration.
              </p>
            </CardContent>
          </Card>

          {/* Admin Domain Forwarding */}
          <Card className="border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
              <CardTitle>Admin Domain Forwarding</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-slate-600">
                Add your own domains and get instant forwarding links to set up at your registrar.
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="rentariz (from rentariz.com)"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value.toLowerCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
                />
                <Button
                  onClick={handleAddDomain}
                  disabled={domainsLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {domainsLoading ? "Adding..." : "Add"}
                </Button>
              </div>

              {adminDomains.length > 0 && (
                <div className="space-y-3 mt-6">
                  {adminDomains.map((domain) => (
                    <div key={domain.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{domain.domainName}</p>
                          <p className="text-xs text-slate-500">Forwarding link</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(domain.forwardingLink);
                            toast({ title: "✓ Link Copied!" });
                          }}
                          className="bg-orange-100 hover:bg-orange-200 border-orange-300"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Link
                        </Button>
                      </div>

                      <div className="bg-white border-2 border-orange-400 rounded p-3 space-y-1">
                        <p className="text-xs text-slate-500 font-medium">PASTE THIS INTO YOUR REGISTRAR:</p>
                        <p className="text-sm font-mono font-bold text-slate-900 break-all">
                          {domain.forwardingLink}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => window.open(domain.forwardingLink, "_blank")}
                        variant="outline"
                        className="w-full text-xs"
                      >
                        Test Link
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Management Section */}
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-600" />
                👥 Team Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Invite team members like Coey to help manage and update your website.
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="coey@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInviteTeamMember()}
                  data-testid="input-invite-email"
                />
                <Button
                  onClick={handleInviteTeamMember}
                  disabled={inviteLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                  data-testid="button-invite-member"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {inviteLoading ? "Inviting..." : "Invite"}
                </Button>
              </div>

              {teamMembers.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold text-slate-900">Team Members</h4>
                  {teamMembers.map((member) => (
                    <div key={member.id} className="bg-white border border-purple-200 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{member.memberEmail}</p>
                        <p className="text-xs text-slate-500">{member.status === "pending" ? "Pending invitation" : "Active"} • {member.role} role</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          fetch(`/api/team/members/${member.id}`, { method: "DELETE" });
                          fetchTeamMembers(user.id);
                        }}
                        data-testid={`button-remove-member-${member.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deployment Control Section - Admin Only */}
          {isAdminSite && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-6 w-6 text-green-600" />
                  🚀 Deployment Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">
                  Enable deployment mode when you're ready to let team members publish changes to your live website.
                </p>

                <div className="bg-white border-2 border-green-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">Deployment Status</p>
                      <p className="text-sm text-slate-600">
                        {deploymentSettings?.deploymentEnabled ? "✓ Enabled" : "✗ Disabled"}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleToggleDeployment(!deploymentSettings?.deploymentEnabled)}
                      variant={deploymentSettings?.deploymentEnabled ? "default" : "outline"}
                      className={deploymentSettings?.deploymentEnabled ? "bg-green-600 hover:bg-green-700" : ""}
                      data-testid="button-toggle-deployment"
                    >
                      {deploymentSettings?.deploymentEnabled ? "Disable Deployment" : "Enable Deployment"}
                    </Button>
                  </div>

                  {deploymentSettings?.deploymentEnabled && (
                    <div className="pt-3 border-t border-green-200">
                      <Button
                        onClick={handleDeploy}
                        disabled={deployLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 gap-2"
                        data-testid="button-deploy"
                      >
                        <Rocket className="h-5 w-5" />
                        {deployLoading ? "Deploying..." : "🚀 Deploy Now"}
                      </Button>
                      {deploymentSettings?.lastDeployedAt && (
                        <p className="text-xs text-slate-600 mt-2 text-center">
                          Last deployed: {new Date(deploymentSettings.lastDeployedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                  <p className="text-xs text-yellow-800">
                    <strong>⚠️ Important:</strong> Enable this only when you're ready to allow deployment. Once enabled, authorized team members can publish live changes.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Code Editor Section - Ask Coey to Code - Admin Only */}
          {isAdminSite && (
            <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-6 w-6 text-blue-600" />
                💻 Ask Coey to Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                <strong>✨ Ready to use!</strong> No team member needed - Tell Coey what you want to change or add to your website, and he'll generate the code for you to apply instantly.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-2">Select File</label>
                  <select 
                    value={selectedFile} 
                    onChange={(e) => setSelectedFile(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="select-file"
                  >
                    <optgroup label="➕ Create New">
                      <option value="__CREATE_NEW__">✨ Create New Page...</option>
                    </optgroup>
                    <optgroup label="📊 User Backend (backend.rentapog.com)">
                      <option value="client/src/pages/Backoffice.tsx">Backoffice.tsx - User Dashboard</option>
                      <option value="client/src/pages/BackendLogin.tsx">BackendLogin.tsx - User Login Page</option>
                      <option value="client/src/pages/UserBackend.tsx">UserBackend.tsx - User Backend View</option>
                      <option value="client/src/pages/ResetPassword.tsx">ResetPassword.tsx - Password Reset</option>
                    </optgroup>
                    <optgroup label="💰 Sales & Registration (sales.rentapog.com)">
                      <option value="client/src/pages/Register.tsx">Register.tsx - User Registration</option>
                      <option value="client/src/pages/Login.tsx">Login.tsx - User Login</option>
                      <option value="client/src/pages/Sales.tsx">Sales.tsx - Sales Page</option>
                    </optgroup>
                    <optgroup label="📦 Packages (packages.rentapog.com)">
                      <option value="client/src/pages/Packages.tsx">Packages.tsx - Pricing Packages</option>
                    </optgroup>
                    <optgroup label="🌐 Domain Registration">
                      <option value="client/src/pages/DomainRegistration.tsx">DomainRegistration.tsx - Domain Signup</option>
                      <option value="client/src/pages/DomainRegistry.tsx">DomainRegistry.tsx - Domain Registry</option>
                      <option value="client/src/pages/DomainControlPanel.tsx">DomainControlPanel.tsx - Domain Control</option>
                      <option value="client/src/pages/DomainRental.tsx">DomainRental.tsx - Domain Rental</option>
                    </optgroup>
                    <optgroup label="🏠 Main Site (rentapog.com)">
                      <option value="client/src/pages/Home.tsx">Home.tsx - Homepage</option>
                      <option value="client/src/pages/HowItWorks.tsx">HowItWorks.tsx - How It Works</option>
                      <option value="client/src/pages/Features.tsx">Features.tsx - Features Page</option>
                      <option value="client/src/pages/Blog.tsx">Blog.tsx - Blog</option>
                    </optgroup>
                    <optgroup label="🎨 Branded Pages">
                      <option value="client/src/pages/BrandedAffiliate.tsx">BrandedAffiliate.tsx - Affiliate Page</option>
                      <option value="client/src/pages/BrandedBlog.tsx">BrandedBlog.tsx - Branded Blog</option>
                      <option value="client/src/pages/BrandedContact.tsx">BrandedContact.tsx - Contact Page</option>
                      <option value="client/src/pages/BrandedFeatures.tsx">BrandedFeatures.tsx - Features</option>
                      <option value="client/src/pages/BrandedFAQ.tsx">BrandedFAQ.tsx - FAQ Page</option>
                      <option value="client/src/pages/MarketingGuides.tsx">MarketingGuides.tsx - Marketing Guides</option>
                    </optgroup>
                    <optgroup label="🤖 AI & Tools">
                      <option value="client/src/pages/CoeyChat.tsx">CoeyChat.tsx - Coey Chat Interface</option>
                    </optgroup>
                    <optgroup label="⚙️ Admin">
                      <option value="client/src/pages/AdminDashboard.tsx">AdminDashboard.tsx - Admin Dashboard</option>
                      <option value="client/src/pages/AdminSetup.tsx">AdminSetup.tsx - Admin Setup</option>
                    </optgroup>
                    <optgroup label="🧩 Components">
                      <option value="client/src/components/LogoGenerator.tsx">LogoGenerator.tsx - Logo Generator</option>
                      <option value="client/src/components/BrandedFooter.tsx">BrandedFooter.tsx - Footer</option>
                    </optgroup>
                    <optgroup label="⚡ Backend API">
                      <option value="server/routes.ts">routes.ts - API Routes</option>
                      <option value="server/storage.ts">storage.ts - Database Operations</option>
                      <option value="shared/schema.ts">schema.ts - Database Schema</option>
                    </optgroup>
                  </select>
                </div>

                {/* Create New Page Form */}
                {selectedFile === "__CREATE_NEW__" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-green-800 flex items-center gap-2">
                      ✨ Create New Page
                    </h4>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Page Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Testimonials, Pricing, About Us"
                        value={newPageName}
                        onChange={(e) => {
                          setNewPageName(e.target.value);
                          const route = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                          setNewPageRoute(route);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        data-testid="input-new-page-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">URL Route</label>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">/</span>
                        <input
                          type="text"
                          placeholder="testimonials"
                          value={newPageRoute}
                          onChange={(e) => setNewPageRoute(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          data-testid="input-new-page-route"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Page Description</label>
                      <textarea
                        placeholder="Describe what this page should contain and do..."
                        value={newPageDescription}
                        onChange={(e) => setNewPageDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        data-testid="textarea-new-page-description"
                      />
                    </div>
                    <p className="text-xs text-green-700">
                      Coey will generate a complete React page based on your description. The page will be saved as <code className="bg-green-100 px-1 rounded">{newPageName || "PageName"}.tsx</code> and accessible at <code className="bg-green-100 px-1 rounded">/{newPageRoute || "route"}</code>
                    </p>
                  </div>
                )}

                {/* Live Page Preview */}
                {selectedFile !== "__CREATE_NEW__" && (() => {
                  const previewUrls: Record<string, string> = {
                    "client/src/pages/Backoffice.tsx": "/backoffice",
                    "client/src/pages/BackendLogin.tsx": "/login",
                    "client/src/pages/UserBackend.tsx": "/backend",
                    "client/src/pages/ResetPassword.tsx": "/reset-password",
                    "client/src/pages/Register.tsx": "/register",
                    "client/src/pages/Login.tsx": "/login",
                    "client/src/pages/Sales.tsx": "/sales",
                    "client/src/pages/Packages.tsx": "/packages",
                    "client/src/pages/DomainRegistration.tsx": "/register",
                    "client/src/pages/DomainRegistry.tsx": "/domain-registry",
                    "client/src/pages/DomainControlPanel.tsx": "/domains/control",
                    "client/src/pages/DomainRental.tsx": "/domain-rental",
                    "client/src/pages/Home.tsx": "/",
                    "client/src/pages/Features.tsx": "/features",
                    "client/src/pages/Blog.tsx": "/blog",
                    "client/src/pages/BrandedAffiliate.tsx": "/affiliate/demo",
                    "client/src/pages/BrandedBlog.tsx": "/affiliate/demo/blog",
                    "client/src/pages/BrandedContact.tsx": "/affiliate/demo/contact",
                    "client/src/pages/BrandedFeatures.tsx": "/affiliate/demo/features",
                    "client/src/pages/BrandedFAQ.tsx": "/affiliate/demo/faq",
                    "client/src/pages/MarketingGuides.tsx": "/marketing-guides",
                    "client/src/pages/CoeyChat.tsx": "/coey-chat",
                    "client/src/pages/AdminDashboard.tsx": "/admin/dashboard",
                    "client/src/pages/AdminSetup.tsx": "/admin/setup",
                    "client/src/pages/HowItWorks.tsx": "/how-it-works",
                  };
                  const previewUrl = previewUrls[selectedFile];
                  return previewUrl ? (
                    <div className="border border-slate-300 rounded-lg overflow-hidden">
                      <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">📄 Page Preview: {previewUrl}</span>
                        <a 
                          href={previewUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Open in new tab ↗
                        </a>
                      </div>
                      <iframe 
                        src={previewUrl}
                        className="w-full h-64 bg-white"
                        title="Page Preview"
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-100 rounded-lg p-4 text-center text-sm text-slate-500">
                      <span>📁 Backend/API files don't have a visual preview</span>
                    </div>
                  );
                })()}

                <div>
                  <label className="text-sm font-medium block mb-2">Your Request</label>
                  <textarea
                    placeholder="E.g., Add a new button to the header, Change the color scheme to dark mode, Add form validation to..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    value={codeRequest}
                    onChange={(e) => setCodeRequest(e.target.value)}
                    data-testid="textarea-code-request"
                  />
                </div>

                <Button
                  className={`w-full gap-2 ${selectedFile === "__CREATE_NEW__" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                  onClick={handleAskCoeyForCode}
                  disabled={loading}
                  data-testid="button-ask-coey-code"
                >
                  <Code className="h-4 w-4" />
                  {loading ? "Coey is thinking..." : selectedFile === "__CREATE_NEW__" ? "✨ Create New Page" : "Ask Coey to Code"}
                </Button>
              </div>

              {codeResponse && (
                <div className="space-y-3 pt-4 border-t border-blue-200">
                  <div className="bg-white border border-blue-300 rounded-lg p-4">
                    <p className="text-sm font-semibold text-slate-900 mb-2">Code from Coey:</p>
                    <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-xs overflow-x-auto max-h-64 overflow-y-auto">
                      <pre>{codeResponse}</pre>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                      onClick={handleApplyCode}
                      data-testid="button-apply-code"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {selectedFile === "__CREATE_NEW__" ? "Save New Page" : "Apply Code"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setCodeResponse(""); setCodeRequest(""); }}
                      data-testid="button-discard-code"
                    >
                      <X className="h-4 w-4" />
                      Discard
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-xs text-yellow-800">
                <strong>💡 Tip:</strong> Coey will generate code suggestions. Review them carefully before applying to your website.
              </div>
            </CardContent>
          </Card>
          )}

          {/* AI Activity Log - Admin Only */}
          {isAdminSite && (
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                  AI Activity Log
                  <Button 
                    onClick={fetchAiActivityLogs} 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto"
                    disabled={aiLogsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${aiLogsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-600 text-sm">
                  See what Coey is doing for your users in plain language.
                </p>
                
                {aiLogsLoading ? (
                  <p className="text-center text-slate-500 py-4">Loading activity...</p>
                ) : aiActivityLogs.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">No AI activity yet. When users chat with Coey, their interactions will appear here.</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {aiActivityLogs.map((log: any) => (
                      <div 
                        key={log.id} 
                        className={`p-3 rounded-lg border ${
                          log.status === 'failed' ? 'bg-red-50 border-red-200' : 
                          log.action_type === 'chat' ? 'bg-blue-50 border-blue-200' : 
                          'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">
                              {log.action_type === 'chat' ? '💬 Question' : 
                               log.action_type === 'response' ? '✅ Answered' : 
                               log.action_type === 'code' ? '💻 Code Request' :
                               log.action_type === 'error' ? '❌ Error' : '📝 Activity'}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">{log.description}</p>
                            {log.user_email && (
                              <p className="text-xs text-slate-400 mt-1">User: {log.user_email}</p>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Website Builder - Admin Only */}
          {isAdminSite && (
            <Card className="border-2 border-cyan-200 bg-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-cyan-600" />
                  Website Builder
                  <Button
                    onClick={() => {
                      setShowWebsiteBuilder(!showWebsiteBuilder);
                      if (!showWebsiteBuilder && websiteProjects.length === 0) {
                        fetchWebsiteProjects();
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    data-testid="button-toggle-website-builder"
                  >
                    {showWebsiteBuilder ? "Hide" : "Show"}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showWebsiteBuilder && (
                <CardContent className="space-y-4">
                  <p className="text-slate-600 text-sm">
                    Create and deploy static websites to Cloudflare Pages with Coey's help.
                  </p>

                  {/* Create New Project */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="New project name..."
                      value={newWebsiteName}
                      onChange={(e) => setNewWebsiteName(e.target.value)}
                      className="flex-1"
                      data-testid="input-new-website-name"
                    />
                    <Button
                      onClick={createWebsiteProject}
                      className="bg-cyan-600 hover:bg-cyan-700"
                      data-testid="button-create-website"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create
                    </Button>
                  </div>

                  {/* Project List */}
                  {websiteProjectsLoading ? (
                    <p className="text-center text-slate-500 py-4">Loading projects...</p>
                  ) : websiteProjects.length === 0 ? (
                    <p className="text-center text-slate-500 py-4">No website projects yet. Create your first one above!</p>
                  ) : (
                    <div className="space-y-2">
                      {websiteProjects.map((project: any) => (
                        <div
                          key={project.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedWebsite?.id === project.id
                              ? "bg-cyan-100 border-cyan-400"
                              : "bg-white border-slate-200 hover:border-cyan-300"
                          }`}
                          onClick={() => selectWebsite(project)}
                          data-testid={`website-project-${project.id}`}
                        >
                          <div>
                            <p className="font-medium text-slate-800">{project.name}</p>
                            <div className="flex gap-2 text-xs text-slate-500">
                              <span className={project.status === "published" ? "text-green-600" : "text-yellow-600"}>
                                {project.status === "published" ? "Live" : "Draft"}
                              </span>
                              {project.liveUrl && (
                                <a
                                  href={project.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {project.liveUrl}
                                </a>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteWebsiteProject(project.id);
                            }}
                            data-testid={`delete-website-${project.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Editor for Selected Project */}
                  {selectedWebsite && (
                    <div className="space-y-4 pt-4 border-t border-cyan-200">
                      <h4 className="font-semibold text-slate-800">Editing: {selectedWebsite.name}</h4>

                      {/* AI Generation */}
                      <div className="bg-white p-3 rounded-lg border border-cyan-200">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Ask Coey to Build (AI Generation)
                        </label>
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Describe the website you want... e.g., 'A landing page for a crypto trading course with a hero section, testimonials, and CTA button'"
                            value={websiteBuilderPrompt}
                            onChange={(e) => setWebsiteBuilderPrompt(e.target.value)}
                            className="flex-1 min-h-20"
                            data-testid="textarea-website-prompt"
                          />
                        </div>
                        <Button
                          onClick={generateWithCoey}
                          disabled={websiteBuilderLoading}
                          className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                          data-testid="button-generate-website"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          {websiteBuilderLoading ? "Generating..." : "Generate with Coey"}
                        </Button>
                      </div>

                      {/* HTML Editor */}
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">HTML Content</label>
                        <Textarea
                          value={websiteHtml}
                          onChange={(e) => setWebsiteHtml(e.target.value)}
                          className="font-mono text-xs min-h-48"
                          placeholder="<!DOCTYPE html>..."
                          data-testid="textarea-website-html"
                        />
                      </div>

                      {/* CSS Editor */}
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">CSS (optional, added to &lt;style&gt;)</label>
                        <Textarea
                          value={websiteCss}
                          onChange={(e) => setWebsiteCss(e.target.value)}
                          className="font-mono text-xs min-h-24"
                          placeholder="body { font-family: sans-serif; }"
                          data-testid="textarea-website-css"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={saveWebsiteProject}
                          disabled={websiteSaving}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          data-testid="button-save-website"
                        >
                          {websiteSaving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          onClick={deployWebsiteProject}
                          disabled={websiteDeploying}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          data-testid="button-deploy-website"
                        >
                          <Rocket className="h-4 w-4 mr-2" />
                          {websiteDeploying ? "Deploying..." : "Deploy to Cloudflare"}
                        </Button>
                      </div>

                      {selectedWebsite.liveUrl && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800">
                            Live at:{" "}
                            <a
                              href={selectedWebsite.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold hover:underline"
                            >
                              {selectedWebsite.liveUrl}
                            </a>
                          </p>
                        </div>
                      )}

                      {/* Custom Domains Section */}
                      {selectedWebsite.cloudflareProjectName && (
                        <div className="bg-white border border-cyan-200 rounded-lg p-4 space-y-3">
                          <h5 className="font-medium text-slate-800 flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-cyan-600" />
                            Custom Domains
                          </h5>
                          
                          <div className="flex gap-2">
                            <Input
                              placeholder="example.com"
                              value={websiteCustomDomain}
                              onChange={(e) => setWebsiteCustomDomain(e.target.value)}
                              className="flex-1"
                              data-testid="input-website-custom-domain"
                            />
                            <Button
                              onClick={addCustomDomainToProject}
                              disabled={addingDomain || !websiteCustomDomain.trim()}
                              size="sm"
                              className="bg-cyan-600 hover:bg-cyan-700"
                              data-testid="button-add-website-domain"
                            >
                              {addingDomain ? "Adding..." : "Add Domain"}
                            </Button>
                          </div>

                          {(selectedWebsite.customDomains?.length ?? 0) > 0 && (
                            <div className="space-y-2">
                              {selectedWebsite.customDomains?.map((domain: string) => (
                                <div key={domain} className="flex items-center justify-between bg-slate-50 p-2 rounded border">
                                  <span className="text-sm font-mono text-slate-700">{domain}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCustomDomainFromProject(domain)}
                                    data-testid={`remove-domain-${domain}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          <p className="text-xs text-slate-500">
                            Add custom domains and configure DNS CNAME records to point to your Pages project.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-cyan-100 border-l-4 border-cyan-400 p-3 rounded text-xs text-cyan-800">
                    <strong>How it works:</strong> Create a project, use Coey to generate HTML, review/edit, then deploy directly to Cloudflare Pages. Your sites will be live at [project-name].pages.dev
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Stripe Connect Section - Show at BOTTOM when already connected */}
          {user.stripeAccountId && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  ✅ Stripe Connected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">
                  Your Stripe account is connected and ready to receive payouts.
                </p>
                <div className="bg-white border border-green-300 rounded-lg p-3">
                  <p className="text-sm text-slate-600">Account ID:</p>
                  <p className="font-mono text-green-700 font-semibold">{user.stripeAccountId}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-100"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/stripe/connect-url");
                      const data = await res.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        toast({ title: "Error", description: data.error || "Could not get Stripe link" });
                      }
                    } catch (err) {
                      toast({ title: "Error", description: "Failed to connect to Stripe" });
                    }
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Stripe Account
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Packages Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #0033a0 0%, #0052cc 100%)",
              borderRadius: "12px",
              padding: "40px 32px",
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 51, 160, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={() => {
              const affLink = localStorage.getItem("affiliateLink") || "rentapog";
              window.location.href = `https://rentapog.com/packages?aff=${affLink}`;
            }}
          >
            <h2 style={{
              color: "#fff",
              fontSize: "1.8em",
              fontWeight: "bold",
              margin: "0 0 12px 0",
            }}>
              🎁 Upgrade Your Package
            </h2>
            <p style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "1.1em",
              margin: "0 0 20px 0",
            }}>
              Get access to premium features, higher earning potential, and exclusive tools
            </p>
            <Button style={{
              background: "#fff",
              color: "#0033a0",
              fontSize: "1em",
              fontWeight: "bold",
              padding: "12px 32px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}>
              View Packages
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
