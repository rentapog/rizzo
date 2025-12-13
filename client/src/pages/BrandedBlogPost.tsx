import { useRoute } from "wouter";
import { designThemes, DesignThemeName } from "@/components/DesignThemes";
import { useState, useEffect } from "react";
import { LogoGenerator } from "@/components/LogoGenerator";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { BrandedFooter } from "@/components/BrandedFooter";

const blogContent: Record<string, { title: string; category: string; date: string; content: string }> = {
  "getting-started": {
    title: "Getting Started with Daily Payouts",
    category: "Guide",
    date: "Dec 1, 2025",
    content: `Learn how to maximize your earnings with our daily payout system and get paid instantly every time a pog is rented.

## Why Daily Payouts Matter

Most affiliate programs make you wait 30, 60, or even 90 days for your earnings. Not us. With RentAPog's daily payout system, the moment a customer completes a rental, the funds hit your Stripe account within 24 hours.

## How It Works

1. Customer signs up with your affiliate link
2. They rent a pog from our marketplace
3. Daily rental income is generated
4. Funds automatically transfer to your Stripe account

## Pro Tips for Success

- Share your affiliate link in communities where pog enthusiasts hang out
- Create content around pog trends and maximizing rental profits
- Build relationships with other affiliates for cross-promotion
- Track your analytics to see which promotions work best

## Getting Started

Sign up today and get your unique affiliate link. You'll have access to our dashboard showing real-time earnings, referral metrics, and performance analytics.`,
  },
  "fair-affiliate-system": {
    title: "Understanding the Fair Affiliate System",
    category: "Education",
    date: "Nov 28, 2025",
    content: `How our 2nd sale pass-up keeps the platform sustainable for everyone while ensuring you profit.

## The Challenge with Most Affiliate Programs

Many platforms run unsustainable affiliate models where affiliates earn unlimited commissions, forcing the business to either:
- Shut down after running out of money
- Institute high platform fees that hurt users
- Get sold to a larger company

We built a different way.

## How Our System Works

### Your Earnings:
- 1st sale: 100% commission to you
- 2nd sale: 100% commission to admin (to sustain the platform)
- 3rd+ sales: 100% commission to you

### Why This Model Works

By dedicating every 2nd sale to platform sustainability, we create a self-funding system that:
- Keeps the platform alive long-term
- Eliminates monthly fees for users
- Provides stable recurring revenue
- Creates fair value for all participants

## Real Example

You refer 10 customers:
- Sales 1, 3, 5, 7, 9: You earn 100% ✓
- Sales 2, 4, 6, 8, 10: Admin keeps 100%
- Your earnings: 50% of referral commission pool

This ensures the platform thrives while you still earn significantly.`,
  },
  "top-strategies": {
    title: "Top Strategies for Affiliate Success",
    category: "Strategy",
    date: "Nov 25, 2025",
    content: `Real tips from top earners on how to scale your referral income and build sustainable income streams.

## Strategy 1: Niche Targeting

Focus on specific communities rather than broad marketing:
- Reddit communities for collectors
- Discord servers for hobbyists
- Niche forums and discussion boards
- Telegram groups for enthusiasts

## Strategy 2: Content Creation

Build authority through content:
- YouTube videos about pog collecting trends
- Blog posts comparing different pog types
- TikTok/Instagram content about ROI
- Podcast mentions and sponsorships

## Strategy 3: Email Marketing

Build an email list and nurture relationships:
- Weekly pog market updates
- Earnings tips and strategies
- Exclusive deals for your audience
- New feature announcements

## Strategy 4: Community Building

Create your own community:
- Discord server for your affiliates
- Facebook group for pog enthusiasts
- Slack workspace for high-earners
- Monthly webinars and strategy sessions

## Strategy 5: Tiered Incentives

Offer bonuses to your best referrals:
- Extra rewards for top performers
- Group challenges and contests
- Leaderboard competitions
- Exclusive early access to new features

## Success Metrics to Track

- Conversion rate (clicks to signups)
- Referral quality (customer lifetime value)
- Repeat referrals (network growth)
- Monthly payout trend (growth trajectory)`,
  },
  "success-stories": {
    title: "Monthly Spotlight: Success Stories",
    category: "Stories",
    date: "Nov 20, 2025",
    content: `Meet our top affiliates and hear how they built their income streams and grew their earnings month after month.

## Affiliate Spotlight: Alex Chen

Alex started with 5 referrals and turned it into a thriving business. By focusing on YouTube content, Alex grew to 50+ active referrals generating $5,000+ monthly.

**What Alex did:**
- Created weekly pog collecting tutorials
- Embedded affiliate links in video descriptions
- Built community through Discord
- Networked with other content creators

**Key Insight:** "Authenticity matters. People can tell when you genuinely use and believe in the product."

## Affiliate Spotlight: Jordan Martinez

Starting from scratch, Jordan used targeted Facebook advertising combined with organic content marketing to build a network of 100+ referrals.

**What Jordan did:**
- Ran small, focused ad campaigns ($5-10/day)
- Created comparison content vs competitors
- Hosted weekly Q&A sessions
- Partnered with micro-influencers

**Key Insight:** "Testing and optimization are everything. What works this month might need tweaking next month."

## Affiliate Spotlight: Sam Park

As a long-time collector, Sam leveraged existing community credibility to refer customers naturally. Now earning $8,000+ monthly through word-of-mouth.

**What Sam did:**
- Participated in collector communities first
- Shared genuine recommendations naturally
- Became a trusted resource
- Built reputation over time

**Key Insight:** "Slow and steady wins. Don't push hard—let your genuine passion speak for itself."

## Common Success Factors

All top earners share these traits:
- Consistency in effort and content
- Genuine belief in the product
- Focus on community, not just sales
- Willingness to experiment and adapt
- Long-term thinking over quick gains`,
  },
};

export default function BrandedBlogPost() {
  const [match, params] = useRoute("/affiliate/:slug/blog/:postSlug");
  const [brandName, setBrandName] = useState("RentAPog");
  const [theme, setTheme] = useState<DesignThemeName>("modern");
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (match && params?.slug) {
      const name = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
      setBrandName(name);
      const saved = localStorage.getItem(`theme-${params.slug}`);
      if (saved) setTheme(saved as DesignThemeName);

      const postSlug = params.postSlug as keyof typeof blogContent;
      if (postSlug in blogContent) {
        setPost(blogContent[postSlug]);
      }
    }
  }, [match, params]);

  const currentTheme = designThemes[theme];

  if (!post) {
    return (
      <div className={`w-full min-h-screen ${currentTheme.colors.bg} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-xl opacity-75">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${currentTheme.colors.bg}`}>
      {/* Header */}
      <header className={`${currentTheme.colors.header} border-b-4`}>
        <div className="container px-4 md:px-6 py-6">
          <Link href={`/affiliate/${params?.slug}/blog`}>
            <a className="flex items-center gap-2 text-sm mb-4 opacity-75 hover:opacity-100">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <LogoGenerator brandName={brandName} style={currentTheme.logoStyle} />
            <h1 className={`text-2xl font-bold ${currentTheme.colors.accent}`}>{brandName}</h1>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="container px-4 md:px-6 py-12">
        <article className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-3 py-1 rounded ${currentTheme.colors.button} text-white`}>
                {post.category}
              </span>
              <span className="text-sm opacity-60">{post.date}</span>
            </div>
            <h1 className={`text-4xl font-bold mb-6 ${currentTheme.colors.accent}`}>{post.title}</h1>
          </div>

          <div className={`prose prose-invert max-w-none opacity-90`}>
            {post.content.split('\n\n').map((paragraph: string, idx: number) => (
              <div key={idx} className="mb-4">
                {paragraph.startsWith('## ') ? (
                  <h2 className={`text-2xl font-bold mt-6 mb-3 ${currentTheme.colors.accent}`}>
                    {paragraph.replace('## ', '')}
                  </h2>
                ) : paragraph.startsWith('- ') ? (
                  <ul className="space-y-2 ml-4">
                    {paragraph.split('\n').map((item: string, i: number) => (
                      <li key={i} className="list-disc">{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="leading-relaxed">{paragraph}</p>
                )}
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* Footer */}
      <BrandedFooter theme={theme} brandName={brandName} slug={params?.slug} />
    </div>
  );
}
