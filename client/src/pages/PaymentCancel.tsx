import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function PaymentCancel() {
  const [, navigate] = useLocation();

  return (
    <div className="flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border-2 border-orange-400">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <AlertCircle className="h-7 w-7" />
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-gray-800">
              Your payment was not completed
            </p>
            <p className="text-sm text-gray-600">
              No charges have been made to your account. You can try again anytime.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <p className="text-sm text-orange-800">
              If you have questions or experienced issues during checkout, please contact our support team.
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              className="flex-1"
              onClick={() => navigate("/domains")}
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/")}
            >
              Back Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
