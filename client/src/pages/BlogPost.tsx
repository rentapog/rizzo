import { useRoute, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const blogContent: Record<string, { title: string; category: string; date: string; content: string }> = {
  "getting-started": {
    title: "Getting Started with Daily Payouts",
    category: "Guide",
    date: "Dec 1, 2025",
    content: `Learn how to maximize your earnings with our daily payout system and get paid directly to your account.

## Why Daily Payouts Matter

Most affiliate programs make you wait 30, 60, or even 90 days for your earnings. With RentAPog's daily payout system, your earnings are processed and transferred quickly, giving you faster access to your commissions.

## How the Process Works

1. A customer signs up using your unique referral link
2. They select a package that fits their needs
3. When the purchase is complete, your commission is calculated
4. Funds are transferred to your connected payment account

## Tips for Getting Started

- Share your referral link in communities where people are interested in digital opportunities
- Create helpful content that provides value to your audience
- Build genuine relationships rather than just pushing links
- Track your results to understand what works best for your audience

## Setting Up Your Account

Sign up and complete your profile to receive your unique referral link. Connect your payment account to ensure smooth payouts. You'll have access to a dashboard showing your referrals and earnings.

**Disclaimer:** Individual results vary based on effort, skills, and market conditions. The information provided is for educational purposes and does not guarantee specific income results.`,
  },
  "fair-affiliate-system": {
    title: "Understanding the Fair Affiliate System",
    category: "Education",
    date: "Nov 28, 2025",
    content: `Our unique commission structure is designed to keep the platform sustainable while rewarding affiliates fairly.

## The Challenge with Traditional Affiliate Programs

Many platforms struggle with sustainability because they promise unlimited commissions without a clear funding model. This often leads to:
- Platforms shutting down unexpectedly
- High fees being introduced later
- Reduced commission rates over time

We designed a different approach.

## How Our Commission Structure Works

Our model allocates commissions in a rotating pattern:
- Some sales generate commissions for you
- Other sales help fund platform operations and development

This creates a balanced system where both affiliates and the platform can thrive long-term.

## Why This Approach Benefits Everyone

By building sustainability into the business model from day one:
- The platform remains operational and well-maintained
- Affiliates can build long-term income streams
- Users get consistent service quality
- Everyone knows the rules upfront

## Transparency Matters

We believe in being upfront about how our system works. There are no hidden fees or surprise changes. You know exactly how commissions are calculated before you start.

**Disclaimer:** This information explains our business model. Actual earnings depend on individual effort and results are not guaranteed.`,
  },
  "top-strategies": {
    title: "Top Strategies for Affiliate Success",
    category: "Strategy",
    date: "Nov 25, 2025",
    content: `Effective strategies that affiliates use to build their referral networks and grow their earnings over time.

## Strategy 1: Know Your Audience

Success starts with understanding who you're talking to:
- Identify communities interested in digital opportunities
- Understand their challenges and goals
- Provide solutions that genuinely help them
- Build trust before promoting anything

## Strategy 2: Create Valuable Content

Quality content attracts and retains an audience:
- Write helpful blog posts or articles
- Create educational videos or tutorials
- Share insights on social media
- Answer questions in relevant communities

## Strategy 3: Build an Email List

Email remains one of the most effective marketing channels:
- Offer something valuable in exchange for email signups
- Send regular, helpful updates
- Share tips and insights, not just promotions
- Respect your subscribers' time and inbox

## Strategy 4: Focus on Relationships

People buy from people they trust:
- Engage genuinely in communities
- Help others without expecting immediate returns
- Be honest about what you're promoting
- Build a reputation over time

## Strategy 5: Track and Improve

Data helps you make better decisions:
- Monitor which content performs best
- Understand where your referrals come from
- Test different approaches
- Double down on what works

## The Long-Term Mindset

Sustainable affiliate income comes from consistent effort over time, not quick schemes. Focus on providing value and building trust.

**Disclaimer:** Strategies shared are for educational purposes. Individual results vary based on implementation and market conditions.`,
  },
  "success-stories": {
    title: "Monthly Spotlight: Success Stories",
    category: "Stories",
    date: "Nov 20, 2025",
    content: `Learn from affiliates who have built successful referral networks through dedication and smart strategies.

## Common Traits of Successful Affiliates

After studying what works, we've identified patterns among top performers:

### Consistency Over Intensity

Rather than bursts of activity followed by silence, successful affiliates show up regularly. They post content, engage with their audience, and refine their approach week after week.

### Authentic Recommendations

The most effective affiliates genuinely believe in what they promote. They share honest experiences, including both positives and areas for improvement.

### Community First

Top earners often build communities around shared interests rather than just products. They create value through connection and education.

### Patience and Persistence

Building a sustainable affiliate income takes time. Those who succeed often spent months developing their audience before seeing significant results.

## Learning from Others

While specific earnings vary widely based on individual circumstances, these principles can guide your own approach:

1. Start with providing value, not promoting
2. Build genuine relationships in your niche
3. Be consistent in your efforts
4. Learn continuously and adapt your strategies
5. Think long-term, not get-rich-quick

## Your Journey

Every successful affiliate started somewhere. Focus on learning, improving, and serving your audience well. Results come to those who persist.

**Disclaimer:** Stories shared are for inspiration and education. Individual results vary significantly based on effort, skills, timing, and market conditions. We make no guarantees about income or outcomes.`,
  },
};

export default function BlogPost() {
  const [match, params] = useRoute("/blog/:postSlug");
  const post = params?.postSlug ? blogContent[params.postSlug] : null;

  if (!post) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-xl font-bold">Post Not Found</h2>
            <p className="text-slate-600">The article you're looking for doesn't exist.</p>
            <Link href="/blog" className="text-blue-600 hover:underline">
              ← Back to Blog
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8">
        <div className="container px-4 md:px-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-white">
              {post.category}
            </span>
            <span className="text-sm text-white/80">{post.date}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{post.title}</h1>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-12">
        <article className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="prose prose-slate max-w-none">
            {post.content.split('\n\n').map((paragraph: string, idx: number) => (
              <div key={idx} className="mb-4">
                {paragraph.startsWith('## ') ? (
                  <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">
                    {paragraph.replace('## ', '')}
                  </h2>
                ) : paragraph.startsWith('### ') ? (
                  <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">
                    {paragraph.replace('### ', '')}
                  </h3>
                ) : paragraph.startsWith('- ') ? (
                  <ul className="space-y-2 ml-4 text-slate-700">
                    {paragraph.split('\n').map((item: string, i: number) => (
                      <li key={i} className="list-disc">{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                ) : paragraph.startsWith('1. ') ? (
                  <ol className="space-y-2 ml-4 text-slate-700 list-decimal">
                    {paragraph.split('\n').map((item: string, i: number) => (
                      <li key={i}>{item.replace(/^\d+\.\s/, '')}</li>
                    ))}
                  </ol>
                ) : paragraph.startsWith('**Disclaimer:') ? (
                  <p className="text-sm text-slate-500 italic mt-8 p-4 bg-slate-50 rounded-lg border">
                    {paragraph.replace(/\*\*/g, '')}
                  </p>
                ) : (
                  <p className="leading-relaxed text-slate-700">{paragraph}</p>
                )}
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
