import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="container py-16 max-w-4xl space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Your privacy is important to us. Please review how we handle your information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            We collect information you provide directly to us, such as when you create or modify your account, request rental services, contact customer support, or otherwise communicate with us. This information may include: name, email address, phone number, payment method, domain preferences, and other information you choose to provide.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            We use the information we collect to provide, maintain, and improve our services, including:
          </p>
          <ul className="list-disc pl-6">
            <li>Processing domain rentals and payments</li>
            <li>Sending receipts and transaction confirmations</li>
            <li>Providing customer support</li>
            <li>Developing new features and improvements</li>
            <li>Sending product updates and administrative messages</li>
            <li>Authenticating users and preventing fraud</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Cookies & Tracking</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            We use Google and Facebook remarketing pixels to aid in our marketing. This allows us to show our ads to people who have visited our site across the internet. You can disable these cookies through your browser settings.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Data Security</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            If you have any questions about this Privacy Policy, please contact us at support@rentapog.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
