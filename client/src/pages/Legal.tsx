import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Legal() {
  return (
    <div className="container py-16 max-w-4xl space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Earnings Disclaimer</h1>
        <p className="text-muted-foreground">
          Important information about earnings and income claims.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            <strong>IMPORTANT:</strong> Every effort has been made to accurately represent this product and its potential. Even though this industry is one of the few where one can write their own check in terms of earnings, there is no guarantee that you will earn any money using our platform.
          </p>
          <p>
            Examples in these materials are not to be interpreted as a promise or guarantee of earnings. Earning potential is entirely dependent on the person using our product, ideas and techniques. We do not purport this as a "get rich scheme."
          </p>
          <p>
            Your level of success in attaining the results claimed in our materials depends on the time you devote to the program, your finances, knowledge and various skills. Since these factors differ according to individuals, we cannot guarantee your success or income level. Nor are we responsible for any of your actions.
          </p>
          <p>
            Past performance or examples provided are not indicative of future results. Your individual results may vary and depend on many factors outside of our control.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            <strong>FTC Disclosure:</strong> In accordance with the Federal Trade Commission's 16 CFR Part 255 guidelines concerning the use of endorsements and testimonials in advertising, please be aware of the following:
          </p>
          <p>
            This website contains affiliate links. If you click on a link and make a purchase, we may receive a commission at no additional cost to you. We only recommend products and services we believe will provide value to our users.
          </p>
          <p>
            The compensation received may influence the content, topics, or posts made on this site. All opinions expressed here are those of the author and are not influenced by compensation. Any product claims, statistics, quotes, or other representations should be verified with the manufacturer or provider.
          </p>
          <p>
            We are a participant in an affiliate marketing program. As an affiliate, we earn from qualifying purchases. This means when you click on certain links on this site and make a purchase, we may earn a commission.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Facebook & Advertising Compliance</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
           <p>
             This site is not a part of the Facebook website or Facebook Inc. Additionally, this site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.
           </p>
           <p>
             This site is not a part of the Google website or Alphabet Inc. Additionally, this site is NOT endorsed by Google in any way. GOOGLE is a trademark of ALPHABET, Inc.
           </p>
           <p>
             We use Google and Facebook remarketing pixels to aid in our marketing. This allows us to show our ads to people who have visited our site across the internet. You can manage your preferences through your browser settings.
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
