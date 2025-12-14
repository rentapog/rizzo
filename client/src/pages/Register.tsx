import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User, AlertCircle, Link as LinkIcon, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const COUNTRIES = ["United States", "Canada", "Australia", "United Kingdom", "India", "Mexico", "Germany", "France", "Japan", "China", "Brazil", "Spain", "Italy", "Netherlands", "South Korea", "Switzerland", "Sweden", "Norway", "Denmark", "Belgium", "Austria", "Ireland", "New Zealand", "Singapore", "Hong Kong", "UAE", "Saudi Arabia", "Qatar", "South Africa", "Nigeria", "Kenya"];

const STATES_BY_COUNTRY: { [key: string]: string[] } = {
  "United States": ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"],
  "Canada": ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
  "Australia": ["NSW", "QLD", "SA", "TAS", "VIC", "WA", "ACT", "NT"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  "India": ["AP", "AR", "AS", "BR", "CT", "GA", "GJ", "HR", "HP", "JK", "JH", "KA", "KL", "MP", "MH", "MN", "ML", "MZ", "NL", "OR", "PB", "RJ", "SK", "TN", "TR", "UP", "UK", "WB"],
  "Mexico": ["AGS", "BC", "BCS", "CAM", "CHIS", "CHIH", "CX", "COL", "DGO", "GRO", "GTO", "HGO", "JAL", "MEX", "MICH", "MOR", "NAY", "OAX", "PUE", "QRO", "QR", "SLP", "SIN", "SON", "TAB", "TAMS", "TLX", "VER", "YUC", "ZAC"],
};

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [referrerName, setReferrerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const filteredCountries = COUNTRIES.filter(c => c.toLowerCase().includes(country.toLowerCase()));
  const statesForCountry = STATES_BY_COUNTRY[country] || [];
  const filteredStates = statesForCountry.filter(s => s.toLowerCase().includes(state.toLowerCase()));

  const handleAddressChange = async (value: string) => {
    setAddress(value);
    if (value.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`,
          { headers: { 'Accept': 'application/json' } }
        );
        const data = await response.json();
        setAddressSuggestions(data.slice(0, 5));
        setShowAddressSuggestions(true);
      } catch (error) {
        setAddressSuggestions([]);
      }
    } else {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    }
  };

  const selectAddress = (suggestion: any) => {
    // Build complete address from components: house_number + road
    const addressParts = [];
    if (suggestion.address?.house_number) addressParts.push(suggestion.address.house_number);
    if (suggestion.address?.road) addressParts.push(suggestion.address.road);
    const fullAddress = addressParts.length > 0 ? addressParts.join(' ') : (suggestion.display_name || '');
    
    setAddress(fullAddress);
    setShowAddressSuggestions(false);
    if (suggestion.address?.city) setCity(suggestion.address.city);
    if (suggestion.address?.state) setState(suggestion.address.state);
    if (suggestion.address?.postcode) setZip(suggestion.address.postcode);
    if (suggestion.address?.country) setCountry(suggestion.address.country);
  };

  useEffect(() => {
    // Get affiliate link from URL parameter (supports both ?aff= and ?ref=) - default to "rentapog"
    const params = new URLSearchParams(window.location.search);
    const aff = params.get("aff") || params.get("ref") || "rentapog";
    setAffiliateLink(aff);
    
    // Fetch referrer's name
    fetch(`/api/referral/${encodeURIComponent(aff)}`)
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          setReferrerName(data.name);
        }
      })
      .catch(() => {
        // Silently fail if referrer not found
      });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          username,
          email, 
          address,
          city,
          state,
          zip,
          country,
          affiliateLink: affiliateLink || "rentapog" 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Registration failed");
        return;
      }

      // Registration successful - password sent to email
      const data = await res.json();
      
      toast({
        title: "✓ Account created! Check your email for login password.",
        description: "Your password has been sent to " + email,
      });
      
      // Redirect to login page after showing message
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-8">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create Your Account</CardTitle>
          <p className="text-center text-slate-600 text-sm mt-1">Register to start renting domains</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Your name"
                  className="pl-9"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="input-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Affiliate Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="yourname (your affiliate code)"
                  className="pl-9"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  required
                  data-testid="input-username"
                />
              </div>
              <p className="text-xs text-slate-500">This will be your personal affiliate code for sharing</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
            </div>



            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address Information
              </h3>

              <div className="space-y-3">
                <div className="space-y-1 relative">
                  <label className="text-xs font-medium text-slate-600">Street Address</label>
                  <Input
                    type="text"
                    placeholder="Type your address..."
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onFocus={() => addressSuggestions.length > 0 && setShowAddressSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                    data-testid="input-address"
                  />
                  {showAddressSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                      {addressSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm text-slate-700 border-b last:border-b-0"
                          onClick={() => selectAddress(suggestion)}
                        >
                          {suggestion.display_name?.substring(0, 60)}...
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">City</label>
                    <Input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      data-testid="input-city"
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-xs font-medium text-slate-600">State/Province</label>
                    <Input
                      type="text"
                      placeholder="Type to search..."
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        setShowStateSuggestions(true);
                      }}
                      onFocus={() => setShowStateSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowStateSuggestions(false), 200)}
                      data-testid="input-state"
                    />
                    {showStateSuggestions && filteredStates.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                        {filteredStates.map(s => (
                          <button
                            key={s}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm"
                            onClick={() => {
                              setState(s);
                              setShowStateSuggestions(false);
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">ZIP Code</label>
                    <Input
                      type="text"
                      placeholder="12345"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      data-testid="input-zip"
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-xs font-medium text-slate-600">Country</label>
                    <Input
                      type="text"
                      placeholder="Type to search..."
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setState("");
                        setShowCountrySuggestions(true);
                      }}
                      onFocus={() => setShowCountrySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 200)}
                      data-testid="input-country"
                    />
                    {showCountrySuggestions && filteredCountries.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                        {filteredCountries.map(c => (
                          <button
                            key={c}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm"
                            onClick={() => {
                              setCountry(c);
                              setState("");
                              setShowCountrySuggestions(false);
                            }}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {affiliateLink && affiliateLink !== "admin" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Affiliate Link</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Affiliate link"
                    className="pl-9 bg-gray-50"
                    value={affiliateLink}
                    disabled
                    readOnly
                  />
                </div>
                {referrerName && (
                  <p className="text-xs text-green-600">Referred by: <span className="font-semibold">{referrerName}</span></p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
