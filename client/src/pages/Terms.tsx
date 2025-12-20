import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function Terms() {
  return (
    <div className="container py-16 max-w-4xl space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground">
          Please read these terms carefully before using RentAPog.<br/>
          <strong>Legal Entity:</strong> RentAPog is operated by Grant Rizzoli (sole proprietor).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            By accessing and using RentAPog, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. User Responsibilities</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            Users are responsible for maintaining the confidentiality of their account information and password. You agree to accept responsibility for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Payment Terms</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            All domain rentals are $20 per day (.com only). Payments are processed through Stripe. Once payment is received and verified, your rental becomes active. Refunds are non-refundable except where required by law.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Earnings & Payouts</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            Your earnings are based on successful domain rentals through your referral link. Payouts are processed instantly to your connected Stripe account. We reserve the right to investigate and withhold payments for suspicious activity or policy violations.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Prohibited Activities</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            You agree not to:
          </p>
          <ul className="list-disc pl-6">
            <li>Use the platform for any illegal purpose</li>
            <li>Violate any local, state, national or international law</li>
            <li>Engage in fraud or deceptive practices</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Harass or abuse other users</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            RentAPog is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of our service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            We reserve the right to modify these terms at any time. Your continued use of the service following any changes constitutes your acceptance of the new terms.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Contact</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            If you have any questions about these Terms of Service, please contact us at support@rentapog.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
