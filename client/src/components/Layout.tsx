import { Link, useLocation } from "wouter";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LiveUpgradeFeed from "./LiveUpgradeFeed";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  
  const isBackendOrFamily = hostname.includes("backend.rentapog.com") || 
                            hostname.includes("backoffice576.rentapog.com") ||
                            hostname.includes("family.rentapog.com") ||
                            hostname.includes("packages.rentapog.com") ||
                            hostname.startsWith("family") ||
                            hostname.startsWith("packages");

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/howitworks", label: "How It Works" },
    { href: "/affiliate", label: "Affiliate Program" },
  ];

  if (isBackendOrFamily) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-sans">
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-90 transition-opacity cursor-pointer">
              <Shield className="h-6 w-6" />
              <span>RentAPog</span>
            </Link>
          </div>

          {/* Desktop Nav - Show on all pages */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "transition-colors hover:text-primary cursor-pointer text-sm",
                  location === link.href ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Nav Toggle */}
          <button 
            className="md:hidden p-2 text-foreground" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b bg-background p-4 space-y-4 animate-in slide-in-from-top-5">
             {navLinks.map(link => (
               <Link 
                 key={link.href} 
                 href={link.href} 
                 className="block py-2 text-sm font-medium hover:text-primary cursor-pointer"
                 onClick={() => setIsMobileMenuOpen(false)}
               >
                 {link.label}
               </Link>
             ))}
          </div>
        )}
      </header>

      {/* Affiliate Disclosure Banner - Required by FTC on all pages with affiliate links */}
      <div className="bg-slate-100 border-b text-center py-2 px-4">
        <p className="text-xs text-slate-600">
          <strong>Affiliate Disclosure:</strong> This site contains affiliate links. We may earn a commission if you make a purchase through our links, at no extra cost to you. 
          Results vary and are not guaranteed. <Link href="/legal" className="underline hover:text-slate-900">See full disclaimer</Link>.
        </p>
      </div>

      {/* Live Upgrade Feed - Show on all pages except backoffice */}
      {!location.includes("/backoffice") && !window.location.hostname.includes("backend.rentapog.com") && !window.location.hostname.includes("backoffice576.rentapog.com") && (
        <div className="container px-4 py-4">
          <LiveUpgradeFeed />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/howitworks" className="hover:text-white transition">How It Works</Link></li>
                <li><Link href="/packages" className="hover:text-white transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/affiliate" className="hover:text-white transition">Become Affiliate</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><a href="mailto:support@rentapog.com" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Disclaimer</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@rentapog.com" className="hover:text-white transition">Help Center</a></li>
                <li><a href="mailto:support@rentapog.com" className="hover:text-white transition">FAQ</a></li>
                <li><a href="mailto:support@rentapog.com" className="hover:text-white transition">Email Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 space-y-4">
            <p className="text-xs text-slate-500 text-center max-w-3xl mx-auto leading-relaxed">
              <strong>Earnings Disclaimer:</strong> Results vary. The income examples shown are not typical and are not guarantees. 
              Your success depends on your effort, skills, and market conditions. We make no guarantees regarding income or results.
            </p>
            <p className="text-sm text-slate-400 text-center">
              © 2025 RentAPog. All rights reserved. | The world's first daily-pay pog rental platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
