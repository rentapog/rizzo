import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Globe, Check, DollarSign, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DomainRental() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const [availabilityResults, setAvailabilityResults] = useState<any[]>([]);
  const { toast } = useToast();

  // Clean domain name by removing .com if it already exists
  const cleanDomainName = (name: string): string => {
    return name.toLowerCase().replace(/\.com$/, "").trim();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!searchTerm) return;
    
    setIsSearching(true);
    setShowResults(false);
    setAvailabilityResults([]);

    try {
      const cleanedSearch = cleanDomainName(searchTerm);
      const domains = [
        `${cleanedSearch}.com`,
        `get${cleanedSearch}.com`,
      ];

      // Check availability for both domain options
      const results = await Promise.all(
        domains.map(async (domain) => {
          const response = await fetch("/api/domains/check-availability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ domain }),
          });
          const data = await response.json();
          return {
            domain,
            available: data.available,
            reason: data.reason,
          };
        })
      );

      const availableDomains = results.filter(r => r.available);
      
      if (availableDomains.length === 0) {
        const blockedDomain = results[0];
        setError(blockedDomain.reason || "These domains are not available for rental.");
        setShowResults(false);
      } else {
        setAvailabilityResults(availableDomains);
        setShowResults(true);
      }
    } catch (err) {
      setError("Failed to check domain availability. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleTestPayment = (domain: string) => {
    // Simulate payment success for testing
    localStorage.setItem("testDomain", domain);
    window.location.href = "/payment/success?session_id=test_" + Date.now();
  };

  const handleRent = (domain: string) => {
    toast({
      title: "Domain Acquired",
      description: `You have successfully rented ${domain}. Daily payouts will start tomorrow.`,
    });
  };

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          Pog Rental Market
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Find high-value pogs to rent out. Acquire them here and start receiving daily Stripe payouts immediately.
        </p>
        
        <Button 
          variant="outline" 
          className="w-fit"
          onClick={() => window.location.href = '/domain-education'}
          data-testid="button-learn-domains"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          New to Domains? Learn How They Work
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Main Search Area */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Profitable Pogs</CardTitle>
              <CardDescription>.com domains only - $20 per day rental</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input 
                  placeholder="e.g. crypto-news or crypto-news.com" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? "Searching..." : <><Search className="mr-2 h-4 w-4" /> Search</>}
                </Button>
              </form>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {showResults && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-semibold">Opportunities for "{searchTerm}"</h3>
              <div className="grid gap-3">
                {availabilityResults.map((item, i) => (
                  <Card key={i} className="overflow-hidden border-l-4 border-l-green-500">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <Check className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{item.domain}</p>
                          <p className="text-sm text-green-600 font-medium">Available for Rent</p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-xl font-bold text-primary flex items-center justify-end gap-1">
                          <DollarSign className="h-4 w-4" />20.00
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">daily rental</p>
                        <div className="flex gap-2">
                          <Button size="sm" asChild className="flex-1">
                            <a 
                              href={`https://buy.stripe.com/test_fZu28q2QKeD7fYcghygA800?client_reference_id=${item.domain}&success_url=${encodeURIComponent(window.location.origin + '/payment/success?session_id={CHECKOUT_SESSION_ID}')}&cancel_url=${encodeURIComponent(window.location.origin + '/payment/cancel')}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              Rent Now
                            </a>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTestPayment(item.domain)}
                            data-testid="button-test-payment"
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
