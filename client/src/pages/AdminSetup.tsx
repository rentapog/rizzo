import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ExternalLink, Copy, Link } from "lucide-react";

export default function AdminSetup() {
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const affiliateLink = "https://rentapog.com/?aff=rentapog";
  const paymentLink = "https://buy.stripe.com/test_fZu28q2QKeD7fYcghygA800";

  const handleMarkComplete = () => {
    setCompleted(true);
    toast({
      title: "✓ Setup Complete!",
      description: "Your 7-email affiliate sequence is now active in Mailchimp!",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Your Links Card */}
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">🔗 Your Links</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Your Affiliate Link (share on your domain registrar):</p>
                <div className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-200">
                  <code className="flex-1 text-sm font-mono break-all text-slate-700">{affiliateLink}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(affiliateLink, "Affiliate link")}
                    className="flex-shrink-0"
                    data-testid="button-copy-affiliate"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Payment Link ($20 rental):</p>
                <div className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-200">
                  <code className="flex-1 text-sm font-mono break-all text-slate-700">{paymentLink}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(paymentLink, "Payment link")}
                    className="flex-shrink-0"
                    data-testid="button-copy-payment"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900"><span className="font-semibold">Setup:</span> Put your affiliate link on your landing page. When people sign up via it, they become your referrals. Then they use the payment link to rent domains!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">RentAPog Admin Setup</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">AWeber 7-Email Automation</h3>
              <p className="text-muted-foreground">
                Your affiliate email sequence is ready. Follow these steps to activate it in AWeber (we switched from Mailchimp for better support):
              </p>
            </div>

            {completed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Setup Complete!</p>
                  <p className="text-sm text-green-800">Your 7-email automation is now active. New subscribers will automatically receive the sequence on Days 0, 2, 4, 6, 8, 10, and 14.</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold text-slate-900">Log in to AWeber</p>
                    <p className="text-sm text-muted-foreground">Go to <a href="https://www.aweber.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">aweber.com</a> and log in</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold text-slate-900">Go to Automations</p>
                    <p className="text-sm text-muted-foreground">Click on "Automations" in the main menu, then "Create Automation"</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold text-slate-900">Set Trigger</p>
                    <p className="text-sm text-muted-foreground">Select "Subscriber" → "Joins list" as the trigger for your affiliate list</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-sm font-bold flex-shrink-0">4</div>
                  <div>
                    <p className="font-semibold text-slate-900">Add 7 Emails</p>
                    <p className="text-sm text-muted-foreground mb-3">Add these emails with the specified delays:</p>
                    <ul className="space-y-2 text-sm">
                      <li><span className="font-semibold">Day 0:</span> "Your Unique Affiliate Link Inside 🚀"</li>
                      <li><span className="font-semibold">Day 2:</span> "3 Ways to Earn This Week"</li>
                      <li><span className="font-semibold">Day 4:</span> "Members Earning $200+ Per Week"</li>
                      <li><span className="font-semibold">Day 6:</span> "Your Earnings Dashboard Is Ready"</li>
                      <li><span className="font-semibold">Day 8:</span> "Don't Leave Money on the Table"</li>
                      <li><span className="font-semibold">Day 10:</span> "Time to Scale Your Earnings"</li>
                      <li><span className="font-semibold">Day 14:</span> "Level Up Your Earnings (Premium)"</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900"><span className="font-semibold">Note:</span> In AWeber, use the merge tag <code className="bg-white px-2 py-1 rounded">{"{subscriber_field_REFERRAL_CODE}"}</code> for the subscriber's affiliate link. For Day 0, use your personal affiliate link instead.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={handleMarkComplete}
                disabled={completed}
                className="flex-1 h-12 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-bold text-lg"
              >
                {completed ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Setup Complete!
                  </>
                ) : (
                  "✓ I've Set Up the Emails"
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.open("https://www.aweber.com/", "_blank")}
                className="h-12"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Open AWeber
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
