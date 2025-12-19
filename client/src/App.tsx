import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Affiliate from "@/pages/Affiliate";
import Dashboard from "@/pages/Dashboard";
import Legal from "@/pages/Legal";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Features from "@/pages/Features";
import HowItWorks from "@/pages/HowItWorks";
import DomainRental from "@/pages/DomainRental";
import Sales from "@/pages/Sales";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPackages from "@/pages/AdminPackages";
import AdminSetup from "@/pages/AdminSetup";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";
import DomainControlPanel from "@/pages/DomainControlPanel";
import DomainRegistry from "@/pages/DomainRegistry";
import DomainRegistration from "@/pages/DomainRegistration";
import DomainRegistrationSuccess from "@/pages/DomainRegistrationSuccess";
import Backoffice from "@/pages/Backoffice";
import UserBackend from "@/pages/UserBackend";
import BackendLogin from "@/pages/BackendLogin";
import ResetPassword from "@/pages/ResetPassword";
import Packages from "@/pages/Packages";
import PackageTier from "@/pages/PackageTier";
import BrandedAffiliate from "@/pages/BrandedAffiliate";
import BrandedBlog from "@/pages/BrandedBlog";
import BrandedBlogPost from "@/pages/BrandedBlogPost";
import BrandedContact from "@/pages/BrandedContact";
import BrandedFeatures from "@/pages/BrandedFeatures";
import BrandedFAQ from "@/pages/BrandedFAQ";
import MarketingGuides from "@/pages/MarketingGuides";
import CoeyChat from "@/pages/CoeyChat";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import DomainEducation from "@/pages/DomainEducation";
import SubAdminDashboard from "@/pages/SubAdminDashboard";
import SubAdminLogin from "@/pages/SubAdminLogin";
import BrandedFranchise from "@/pages/BrandedFranchise";

function Router() {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";

  // If on backend.rentapog.com or backend.airizzos.com, show full backoffice dashboard
  // Sub-admins see SubAdminDashboard, regular users/admin see Backoffice
  if (hostname.includes("backend.rentapog.com") || hostname.includes("backend.airizzos.com")) {
    // Check if user is a sub-admin from localStorage
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;
    const isSubAdmin = user?.isSubAdmin === true;
    
    return (
      <Switch>
        <Route path="/reset-password">{() => <ResetPassword />}</Route>
        <Route path="/login">{() => <BackendLogin />}</Route>
        <Route path="/admin/login">{() => <AdminLogin />}</Route>
        <Route path="/sub-admin">{() => <SubAdminDashboard />}</Route>
        <Route>{() => isSubAdmin ? <SubAdminDashboard /> : <Backoffice />}</Route>
      </Switch>
    );
  }

  // If on backoffice576.rentapog.com or backoffice.rentapog.com, show admin backoffice
  if (hostname.includes("backoffice576.rentapog.com") || hostname.includes("backoffice.rentapog.com")) {
    return (
      <Switch>
        <Route path="/privacy">{() => <Privacy />}</Route>
        <Route path="/terms">{() => <Terms />}</Route>
        <Route path="/how-it-works">{() => <HowItWorks />}</Route>
        <Route>{() => <Backoffice />}</Route>
      </Switch>
    );
  }

  // If on packages.rentapog.com or packages.airizzos.com, show packages with tier support
  if (hostname.includes("packages.rentapog.com") || hostname.includes("packages.airizzos.com")) {
    return (
      <Switch>
        <Route path="/tier/:tier">{(props: any) => <PackageTier tierPrice={parseInt(props.params.tier)} />}</Route>
        <Route path="/20">{() => <PackageTier tierPrice={20} />}</Route>
        <Route path="/49">{() => <PackageTier tierPrice={49} />}</Route>
        <Route path="/99">{() => <PackageTier tierPrice={99} />}</Route>
        <Route path="/149">{() => <PackageTier tierPrice={149} />}</Route>
        <Route path="/199">{() => <PackageTier tierPrice={199} />}</Route>
        <Route path="/249">{() => <PackageTier tierPrice={249} />}</Route>
        <Route path="/299">{() => <PackageTier tierPrice={299} />}</Route>
        <Route path="/349">{() => <PackageTier tierPrice={349} />}</Route>
        <Route path="/399">{() => <PackageTier tierPrice={399} />}</Route>
        <Route path="/449">{() => <PackageTier tierPrice={449} />}</Route>
        <Route path="/499">{() => <PackageTier tierPrice={499} />}</Route>
        <Route>{() => <PackageTier />}</Route>
      </Switch>
    );
  }

  // If on domain.rentapog.com, show domain registration
  if (hostname.includes("domain.rentapog.com")) {
    return (
      <Switch>
        <Route path="/payment/success">{() => <PaymentSuccess />}</Route>
        <Route path="/payment/cancel">{() => <PaymentCancel />}</Route>
        <Route path="/domains/control">{() => <DomainControlPanel />}</Route>
        <Route>{() => <DomainRegistration />}</Route>
      </Switch>
    );
  }

  // If on sales.rentapog.com, show account registration
  if (hostname.includes("sales.rentapog.com")) {
    return (
      <Switch>
        <Route path="/login">{() => <Login />}</Route>
        <Route path="/register">{() => <Register />}</Route>
        <Route path="/admin/login">{() => <AdminLogin />}</Route>
        <Route path="/admin/setup">{() => <AdminSetup />}</Route>
        <Route path="/admin/dashboard">{() => <AdminDashboard />}</Route>
        <Route path="/admin/packages">{() => <AdminPackages />}</Route>
        <Route>{() => <Register />}</Route>
      </Switch>
    );
  }

  // If on family.rentapog.com or family1-5.rentapog.com, show sub-admin dashboard for family members
  const familySubdomains = ['family', 'family1', 'family2', 'family3', 'family4', 'family5', 'family6', 'family7'];
  const currentSubdomain = hostname.split('.')[0];
  if (hostname.includes("rentapog.com") && familySubdomains.includes(currentSubdomain)) {
    return (
      <Switch>
        <Route path="/reset-password">{() => <ResetPassword />}</Route>
        <Route path="/login">{() => <SubAdminLogin />}</Route>
        <Route>{() => <SubAdminDashboard />}</Route>
      </Switch>
    );
  }

  // Check for custom domain branding (not rentapog.com, not airizzos.com, not localhost, not replit.dev, not render.com)
  const mainDomains = ["rentapog.com", "airizzos.com"];
  const isMainDomain = mainDomains.some(domain => hostname.includes(domain));
  const isLocalDev = hostname.includes("localhost") || 
                     hostname.includes("replit.dev") || 
                     hostname.includes("replit.app") ||
                     hostname.includes("render.com") ||
                     hostname.includes("onrender.com");
  const isCustomDomain = !isMainDomain && !isLocalDev && hostname.includes(".");
  
  if (isCustomDomain) {
    // This is a custom branded domain - serve the branded franchise page
    return <BrandedFranchise customDomain={hostname} />;
  }

  // Check for branded franchise subdomains (*.rentapog.com or *.airizzos.com but not known subdomains)
  const knownSubdomains = ["backend", "backoffice", "packages", "domain", "sales", "family", "family1", "family2", "family3", "family4", "family5", "family6", "family7", "www", "localhost"];
  const hostParts = hostname.split(".");
  if ((hostname.includes("rentapog.com") || hostname.includes("airizzos.com")) && hostParts.length >= 3) {
    const subdomain = hostParts[0].toLowerCase();
    if (!knownSubdomains.includes(subdomain)) {
      return <BrandedFranchise brandSlug={subdomain} />;
    }
  }

  // Default: Main rentapog.com or airizzos.com domain
  return (
    <Switch>
      <Route path="/">{() => <Home />}</Route>
      <Route path="/backend">{() => <Backoffice />}</Route>
      <Route path="/backoffice">{() => <Backoffice />}</Route>
      <Route path="/login">{() => <Backoffice />}</Route>
      <Route path="/admin/login">{() => <AdminLogin />}</Route>
      <Route path="/admin/dashboard">{() => <AdminDashboard />}</Route>
      <Route path="/register">{() => <Register />}</Route>
      <Route path="/reset-password">{() => <ResetPassword />}</Route>
      <Route path="/sales">{() => <Sales />}</Route>
      <Route path="/packages/tier/:tier">{(props: any) => <PackageTier tierPrice={parseInt(props.params.tier)} />}</Route>
      <Route path="/packages/20">{() => <PackageTier tierPrice={20} />}</Route>
      <Route path="/packages/49">{() => <PackageTier tierPrice={49} />}</Route>
      <Route path="/packages/99">{() => <PackageTier tierPrice={99} />}</Route>
      <Route path="/packages/149">{() => <PackageTier tierPrice={149} />}</Route>
      <Route path="/packages/199">{() => <PackageTier tierPrice={199} />}</Route>
      <Route path="/packages/249">{() => <PackageTier tierPrice={249} />}</Route>
      <Route path="/packages/299">{() => <PackageTier tierPrice={299} />}</Route>
      <Route path="/packages/349">{() => <PackageTier tierPrice={349} />}</Route>
      <Route path="/packages/399">{() => <PackageTier tierPrice={399} />}</Route>
      <Route path="/packages/449">{() => <PackageTier tierPrice={449} />}</Route>
      <Route path="/packages/499">{() => <PackageTier tierPrice={499} />}</Route>
      <Route path="/packages">{() => <PackageTier />}</Route>
      <Route path="/affiliate">{() => <Affiliate />}</Route>
      <Route path="/dashboard">{() => <Dashboard />}</Route>
      <Route path="/legal">{() => <Legal />}</Route>
      <Route path="/privacy">{() => <Privacy />}</Route>
      <Route path="/terms">{() => <Terms />}</Route>
      <Route path="/features">{() => <Features />}</Route>
      <Route path="/how-it-works">{() => <HowItWorks />}</Route>
      <Route path="/howitworks">{() => <HowItWorks />}</Route>
      <Route path="/blog">{() => <Blog />}</Route>
      <Route path="/blog/:postSlug">{() => <BlogPost />}</Route>
      <Route path="/domain-rental">{() => <DomainRental />}</Route>
      <Route path="/domain-education">{() => <DomainEducation />}</Route>
      <Route path="/domain-registry">{() => <DomainRegistry />}</Route>
      <Route path="/marketing-guides">{() => <MarketingGuides />}</Route>
      <Route path="/coey-chat">{() => <CoeyChat />}</Route>

      {/* Branded Affiliate Routes */}
      <Route path="/affiliate/:slug">{() => <BrandedAffiliate />}</Route>
      <Route path="/affiliate/:slug/blog">{() => <BrandedBlog />}</Route>
      <Route path="/affiliate/:slug/blog/:postId">{() => <BrandedBlogPost />}</Route>
      <Route path="/affiliate/:slug/contact">{() => <BrandedContact />}</Route>
      <Route path="/affiliate/:slug/features">{() => <BrandedFeatures />}</Route>
      <Route path="/affiliate/:slug/faq">{() => <BrandedFAQ />}</Route>

      {/* Check Email Instructions Route */}
      <Route path="/check-email-instructions">{() => import("@/pages/CheckEmailInstructions").then(mod => <mod.default />)}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout>
          <Router />
          <Toaster />
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
