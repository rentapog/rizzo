import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Facebook, Instagram, TrendingUp, Search } from "lucide-react";

export default function MarketingGuides() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Marketing Your Affiliate Link</h2>
        <p className="text-muted-foreground">Complete guides to promote RentAPog on all platforms</p>
      </div>

      {/* Facebook Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-600" />
            Facebook Marketing Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">1. Join Relevant Groups</h3>
            <p className="text-sm text-muted-foreground mb-3">Search for groups related to: entrepreneur side hustles, passive income, affiliate marketing, digital nomads, work from home.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">2. Create Engaging Posts</h3>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
              <li>"Just made $40+ in 24 hours with my first 3 referrals - zero startup costs!"</li>
              <li>"Unique affiliate system: You keep 100% on most sales. First 3 referrals are FREE!"</li>
              <li>"Passive income stream setup in 5 minutes. Payouts go straight to your Stripe account daily."</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">3. Share Your Link</h3>
            <p className="text-sm text-muted-foreground mb-2">Your affiliate link: <span className="font-mono bg-gray-100 px-2 py-1 rounded">rentapog.com/ref/rentapog</span></p>
            <p className="text-sm text-muted-foreground">Pro tip: Share testimonials and results, not just the link. People buy from people.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">4. Engagement Strategy</h3>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
              <li>Comment on posts about side hustles with your experience</li>
              <li>Answer questions in comments (builds trust)</li>
              <li>Post 3-4 times per week with different angles</li>
              <li>Use stories to show real-time earnings updates</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Instagram Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-600" />
            Instagram Marketing Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">1. Create Your Niche</h3>
            <p className="text-sm text-muted-foreground mb-3">Position yourself as: "Passive Income Expert" or "Side Hustle Creator" or "Affiliate Marketing Teacher"</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">2. Content Ideas</h3>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
              <li><strong>Reels:</strong> "How I made $40-$100+ in my first day" (screen recordings of dashboard)</li>
              <li><strong>Stories:</strong> Daily earnings updates, real-time payouts to your bank</li>
              <li><strong>Carousel Posts:</strong> 5-slide breakdown of the pass-up system and how you profit</li>
              <li><strong>Captions:</strong> Link in bio strategy - "Start earning daily. Keep 100% of most sales. Link in bio"</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">3. Hashtag Strategy</h3>
            <p className="text-sm text-muted-foreground font-mono">#PassiveIncome #SideHustle #AffiliateMarketing #EarnMoney #WorkFromHome #OnlineIncome #EasyMoney #IncomeStream #Entrepreneurship #MakeMoneyOnline</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">4. Link in Bio</h3>
            <p className="text-sm text-muted-foreground">Use a link aggregator (Linktree, Stan Store) and include: link to your ref URL, testimonials, screenshots of earnings</p>
          </div>
        </CardContent>
      </Card>

      {/* TikTok Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-black" />
            TikTok Marketing Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">1. Trending Sounds</h3>
            <p className="text-sm text-muted-foreground mb-3">Use trending sounds with text overlay: "Making $40-$100+ daily from my phone" paired with dashboard screenshots showing real payouts</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">2. Video Ideas</h3>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
              <li>"POV: Your referrals are making you money while you sleep"</li>
              <li>"This affiliate system is BROKEN (in a good way)" - show pass-up system: you keep #1, admin gets #2, you keep #3+</li>
              <li>"Started earning today and already seeing results..." (show actual dashboard)</li>
              <li>Before/after: showing Stripe account balance growing daily</li>
              <li>"No startup costs, just one link" - simple and direct</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">3. Hook Strategy (First 3 Seconds)</h3>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
              <li>"I make money while you watch this"</li>
              <li>"This has no catch (for real)"</li>
              <li>"The affiliate system nobody talks about"</li>
              <li>Show Stripe notification of payout</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">4. Call to Action</h3>
            <p className="text-sm text-muted-foreground">Say: "Link in bio" or "Comment LINK and I'll DM you" to get engagement</p>
          </div>
        </CardContent>
      </Card>

      {/* Google Search Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-red-600" />
            Google Search & SEO Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">1. Content Strategy (Start a Blog)</h3>
            <p className="text-sm text-muted-foreground mb-3">Create blog posts targeting keywords like: "best affiliate programs", "passive income ideas", "how to earn daily"</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">2. Blog Post Ideas</h3>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
              <li>"Top Affiliate Programs with Daily Payouts in 2025"</li>
              <li>"How to Make $40+ Your First Day Without Startup Costs"</li>
              <li>"Affiliate Systems That Actually Pay You 100%: RentAPog Review"</li>
              <li>"The Pass-Up Model: Why It's Different From Other Affiliate Programs"</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">3. SEO Basics</h3>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
              <li>Use your target keyword in title, first paragraph, and headers</li>
              <li>Include your affiliate link naturally in the article</li>
              <li>Aim for 1000+ words per article</li>
              <li>Link to other relevant content on your site</li>
              <li>Use tools like Google Search Console to track rankings</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">4. YouTube (Bonus)</h3>
            <p className="text-sm text-muted-foreground">Create 5-10 minute videos: "How I make $40-$100+/day with RentAPog", tutorials on the pass-up system, Q&A sessions. Include your link in description and pinned comment.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Pro Tips for All Platforms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>✓ <strong>Authenticity wins:</strong> Share real results, real struggles, real wins</p>
          <p>✓ <strong>Consistency matters:</strong> Post regularly, don't spam then disappear</p>
          <p>✓ <strong>Engage with others:</strong> Comment, reply to comments, build community</p>
          <p>✓ <strong>Test and optimize:</strong> See what posts get the most engagement and do more of that</p>
          <p>✓ <strong>Value first:</strong> Give tips, answer questions, THEN share your link</p>
          <p>✓ <strong>Track what works:</strong> Use a link shortener with analytics to see which platform converts best</p>
        </CardContent>
      </Card>
    </div>
  );
}
