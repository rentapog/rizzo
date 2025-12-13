import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Globe, ArrowRight } from "lucide-react";

export default function DomainRegistrationSuccess() {
  const [, navigate] = useLocation();
  const [domain, setDomain] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const domainName = params.get("domain");
    if (domainName) {
      setDomain(domainName);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <Card className="w-full max-w-2xl shadow-xl border-2 border-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <CheckCircle2 className="h-7 w-7" />
            Domain Registered Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-12 space-y-8">
          {/* Domain Display */}
          <div className="text-center space-y-4">
            <div className="inline-block bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <p className="text-sm text-blue-600 font-medium mb-1">Your Domain</p>
              <p className="text-3xl font-bold text-blue-900">{domain || "Your Domain"}</p>
            </div>
            <p className="text-lg font-semibold text-slate-800">
              is registered for 1 year
            </p>
            <p className="text-slate-600">
              We've paid Namecheap $13.98 and kept the platform fee. Your domain is ready to use!
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg space-y-4">
            <p className="text-sm font-bold text-blue-900 uppercase">What's Next?</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p className="font-semibold text-slate-900">Set Up Domain Forwarding</p>
                  <p className="text-sm text-slate-600">Forward your domain to your affiliate link or sales page</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p className="font-semibold text-slate-900">Create Your Sales Funnel</p>
                  <p className="text-sm text-slate-600">Set up your domain to direct traffic to your offers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p className="font-semibold text-slate-900">Start Promoting</p>
                  <p className="text-sm text-slate-600">Share your domain everywhere and track clicks in your backoffice</p>
                </div>
              </div>
            </div>
          </div>

          {/* Renewal Info */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <p className="text-sm text-slate-700">
              <strong>Renewal Notice:</strong> Your domain will renew automatically in 1 year. You'll get a reminder email before renewal is due.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg h-12"
              onClick={() => navigate("/domains/control")}
              data-testid="button-setup-domain"
            >
              <Globe className="h-5 w-5 mr-2" />
              Set Up Domain Forwarding
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              className="flex-1 text-lg h-12"
              onClick={() => window.location.href = "https://backoffice576.rentapog.com"}
              data-testid="button-backoffice"
            >
              Go to Backoffice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
