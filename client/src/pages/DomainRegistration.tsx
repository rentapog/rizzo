import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Globe, CheckCircle2, AlertCircle, Loader2, Zap, LogOut, Mail, Lock, User, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const COUNTRIES: { [key: string]: string[] } = {
  "Australia": ["NSW", "QLD", "SA", "TAS", "VIC", "WA", "ACT", "NT"],
  "Canada": ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  "United States": ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"],
  "India": ["AP", "AR", "AS", "BR", "CT", "GA", "GJ", "HR", "HP", "JK", "JH", "KA", "KL", "MP", "MH", "MN", "ML", "MZ", "NL", "OR", "PB", "RJ", "SK", "TN", "TR", "UP", "UK", "WB"],
  "Mexico": ["Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Mexico City", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Mexico", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"],
};

const COUNTRY_LIST = Object.keys(COUNTRIES);

export default function DomainRegistration() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [domain, setDomain] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  // Register state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("admin");
  
  useEffect(() => {
    // Get affiliate link from URL parameter
    const params = new URLSearchParams(window.location.search);
    const aff = params.get("aff") || params.get("ref");
    setAffiliateLink(aff || "admin");

    // If there's an affiliate link, don't load user from storage (show registration form)
    // Otherwise, load user if they're already registered
    if (!aff) {
      // Check localStorage first
      let storedUser = localStorage.getItem("user");
      
      // If not in localStorage, check cookies (cross-subdomain session)
      if (!storedUser) {
        const cookieValue = document.cookie
          .split("; ")
          .find(row => row.startsWith("user="))
          ?.split("=")[1];
        if (cookieValue) {
          try {
            storedUser = decodeURIComponent(cookieValue);
          } catch {
            // Cookie parsing failed
          }
        }
      }
      
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } catch {
          // Failed to parse user data
        }
      }
    }
  }, []);

  const userId = user?.id;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.message || "Login failed");
        return;
      }

      const userData = await res.json();
      localStorage.setItem("user", JSON.stringify(userData.user));
      setUser(userData.user);
      setEmail("");
      setPassword("");
      toast({ title: "✓ Logged in successfully! Now pick your domain." });
    } catch (err) {
      setLoginError("An error occurred. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          address,
          city,
          state,
          zip,
          country,
          affiliateLink,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setRegisterError(data.message || "Registration failed");
        return;
      }

      toast({ title: "✓ Account created! Now logging in..." });
      
      // Auto-login after registration
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.ok) {
        const userData = await loginRes.json();
        localStorage.setItem("user", JSON.stringify(userData.user));
        localStorage.setItem("affiliateLink", affiliateLink);
        setUser(userData.user);
        resetForm();
        
        // Redirect to domain registration page after registration
        setTimeout(() => {
          window.location.href = `https://domain.rentapog.com?aff=${affiliateLink}`;
        }, 1500);
      }
    } catch (err) {
      setRegisterError("An error occurred. Please try again.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setDomain("");
    setAvailable(null);
    resetForm();
    toast({ title: "✓ Logged out" });
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setAddress("");
    setCity("");
    setState("");
    setZip("");
    setCountry("");
    setLoginError("");
    setRegisterError("");
  };

  const checkAvailability = async () => {
    if (!domain.trim()) {
      toast({ title: "Enter a subdomain name", variant: "destructive" });
      return;
    }

    setChecking(true);
    try {
      const subdomain = domain.toLowerCase().replace(/[^a-z0-9-]/g, "");
      const response = await fetch("/api/domains/check-subdomain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain }),
      });

      const data = await response.json();
      setAvailable(data.available);
      
      if (!data.available) {
        toast({ title: data.reason || "Subdomain not available", variant: "destructive" });
      } else {
        toast({ title: "Subdomain is available!", description: `${subdomain}.rentapog.com is yours!` });
      }
    } catch (error) {
      toast({ title: "Error checking availability", variant: "destructive" });
    } finally {
      setChecking(false);
    }
  };

  const registerDomain = async () => {
    if (!available || !userId || !domain.trim()) {
      toast({ title: "Please check availability first", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const subdomain = domain.toLowerCase().replace(/[^a-z0-9-]/g, "");
      // Save subdomain to localStorage so it's available after payment redirect
      localStorage.setItem("pendingDomain", subdomain);
      localStorage.setItem("pendingUserId", userId);
      
      // Redirect to Stripe payment link with metadata
      const paymentLink = "https://buy.stripe.com/test_fZu28q2QKeD7fYcghygA800";
      const params = new URLSearchParams({
        client_reference_id: subdomain,
        prefilled_email: user?.email || ""
      });
      
      window.location.href = `${paymentLink}?${params.toString()}`;
    } catch (error) {
      toast({ title: "Registration error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="container max-w-2xl mx-auto pt-10">
        {/* Logout Button */}
        {user && (
          <div className="mb-6 text-right">
            <p className="text-sm text-slate-600 mb-2">Logged in as: <span className="font-semibold">{user.email}</span></p>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-8 w-8 text-blue-600" />
              <CardTitle className="text-3xl">Rent Your Subdomain</CardTitle>
            </div>
            <p className="text-slate-600">Get your own subdomain that forwards to your affiliate link</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auth Section */}
            {!user ? (
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg space-y-4">
                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => { setAuthMode("register"); setLoginError(""); setRegisterError(""); }}
                    className={`flex-1 py-2 px-3 rounded font-medium text-sm transition ${
                      authMode === "register"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                    }`}
                    data-testid="tab-register"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => { setAuthMode("login"); setLoginError(""); setRegisterError(""); }}
                    className={`flex-1 py-2 px-3 rounded font-medium text-sm transition ${
                      authMode === "login"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                    }`}
                    data-testid="tab-login"
                  >
                    Login
                  </button>
                </div>

                {/* Register Form */}
                {authMode === "register" && (
                  <form onSubmit={handleRegister} className="space-y-3">
                    {registerError && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 flex gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        {registerError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Your name"
                          className="pl-10 text-sm"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          data-testid="input-register-name"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10 text-sm"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          data-testid="input-register-email"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 text-sm"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          data-testid="input-register-password"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-2 mt-3">
                      <p className="text-xs font-semibold text-slate-600 mb-2">Address (Optional)</p>
                      <div className="space-y-2">
                        <Input
                          type="text"
                          placeholder="Street address"
                          className="text-sm"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          data-testid="input-register-address"
                        />
                        <Input
                          type="text"
                          placeholder="City"
                          className="text-sm"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          data-testid="input-register-city"
                        />

                        <select
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={country}
                          onChange={(e) => {
                            setCountry(e.target.value);
                            setState("");
                          }}
                          data-testid="select-register-country"
                        >
                          <option value="">Select Country</option>
                          {COUNTRY_LIST.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>

                        {country && COUNTRIES[country] && (
                          <select
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            data-testid="select-register-state"
                          >
                            <option value="">Select State/Province</option>
                            {COUNTRIES[country].map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        )}

                        <Input
                          type="text"
                          placeholder="ZIP/Postal Code"
                          className="text-sm"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          data-testid="input-register-zip"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-10 bg-green-600 hover:bg-green-700 text-sm"
                      disabled={registerLoading}
                      data-testid="button-register"
                    >
                      {registerLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                )}

                {/* Login Form */}
                {authMode === "login" && (
                  <form onSubmit={handleLogin} className="space-y-3">
                    {loginError && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 flex gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        {loginError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10 text-sm"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          data-testid="input-login-email"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 text-sm"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          data-testid="input-login-password"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-sm"
                      disabled={loginLoading}
                      data-testid="button-login"
                    >
                      {loginLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                )}
              </div>
            ) : null}

            {/* Domain Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subdomain Name</label>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="yourname"
                  value={domain.replace(".rentapog.com", "").replace(".com", "")}
                  onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  disabled={checking || loading}
                  data-testid="input-domain"
                />
                <span className="text-slate-600 py-2 whitespace-nowrap">.rentapog.com</span>
              </div>
              <p className="text-xs text-slate-500">Your subdomain will forward visitors to your affiliate link</p>
            </div>

            {/* Availability Status */}
            {available !== null && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {available ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Domain is available!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    <span>Domain is not available</span>
                  </>
                )}
              </div>
            )}

            {/* Pricing Breakdown */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-slate-900">Pricing Breakdown</h3>
              <div className="flex justify-between text-sm">
                <span>Subdomain Rental (1 year)</span>
                <span className="font-medium">$20.00</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>$20.00</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">Your subdomain {domain ? `${domain}.rentapog.com` : "yourname.rentapog.com"} will forward to your affiliate link.</p>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={checkAvailability}
                  disabled={checking || !domain.trim()}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-check-availability"
                >
                  {checking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check Availability"
                  )}
                </Button>
                <Button
                  onClick={registerDomain}
                  disabled={!available || loading || !userId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-register-domain"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Register Domain - $20"
                  )}
                </Button>
              </div>
            </div>

            {!userId && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                <strong>Please log in first</strong> to register a domain
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
