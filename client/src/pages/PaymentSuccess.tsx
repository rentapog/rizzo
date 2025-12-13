import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Globe } from "lucide-react";

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    // Get session ID from URL
    const params = new URLSearchParams(window.location.search);
    const session = params.get("session_id");
    if (session) {
      setSessionId(session);
    }
  }, []);

  return (
    <div className="flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border-2 border-green-500">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <CheckCircle2 className="h-7 w-7" />
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-gray-800">
              Your domain rental is now active
            </p>
            <p className="text-sm text-gray-600">
              Your daily payouts will start tomorrow and go directly to your connected Stripe account.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-green-900">What's next?</p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Check your dashboard to manage your domains</li>
              <li>✓ Set up domain forwarding to your affiliate link</li>
              <li>✓ Start sharing your affiliate link to earn commissions</li>
            </ul>
          </div>

          {sessionId && (
            <div className="text-xs text-gray-500 text-center break-all">
              Session ID: {sessionId}
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => window.location.href = "https://backend.rentapog.com/"}
            >
              <Globe className="h-4 w-4 mr-2" />
              Set Up Domain
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => window.location.href = "https://backend.rentapog.com/"}
            >
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
