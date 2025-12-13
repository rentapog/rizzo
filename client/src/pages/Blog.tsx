import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

const blogPosts = [
  {
    slug: "getting-started",
    title: "Getting Started with Daily Payouts",
    excerpt: "Learn how to maximize your earnings with our daily payout system.",
    date: "Dec 1, 2025",
    category: "Guide",
    color: "blue",
  },
  {
    slug: "fair-affiliate-system",
    title: "Understanding the Fair Affiliate System",
    excerpt: "How our 2nd sale pass-up keeps the platform sustainable for everyone.",
    date: "Nov 28, 2025",
    category: "Education",
    color: "green",
  },
  {
    slug: "top-strategies",
    title: "Top Strategies for Affiliate Success",
    excerpt: "Real tips from top earners on how to scale your referral income.",
    date: "Nov 25, 2025",
    category: "Strategy",
    color: "purple",
  },
  {
    slug: "success-stories",
    title: "Monthly Spotlight: Success Stories",
    excerpt: "Meet our top affiliates and hear how they built their income streams.",
    date: "Nov 20, 2025",
    category: "Stories",
    color: "indigo",
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { border: string; bg: string; badge: string; text: string }> = {
    blue: { border: "border-blue-200", bg: "bg-blue-100", badge: "text-blue-700", text: "text-blue-600" },
    green: { border: "border-green-200", bg: "bg-green-100", badge: "text-green-700", text: "text-green-600" },
    purple: { border: "border-purple-200", bg: "bg-purple-100", badge: "text-purple-700", text: "text-purple-600" },
    indigo: { border: "border-indigo-200", bg: "bg-indigo-100", badge: "text-indigo-700", text: "text-indigo-600" },
  };
  return colors[color] || colors.blue;
};

export default function Blog() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4 text-white">
            <h1 className="text-4xl md:text-5xl font-bold">Blog & Resources</h1>
            <p className="text-lg opacity-90">
              Tips, strategies, and insights to help you maximize your RentAPog earnings
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-24">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post) => {
              const colors = getColorClasses(post.color);
              return (
                <Card key={post.slug} className={`border-2 ${colors.border} bg-white shadow-lg hover:shadow-xl transition-shadow`}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.bg} ${colors.badge}`}>
                        {post.category}
                      </span>
                      <span className="text-xs text-slate-500">{post.date}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">{post.title}</h3>
                      <p className="text-slate-700 leading-relaxed mb-4">
                        {post.excerpt}
                      </p>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <a className={`inline-flex items-center gap-2 font-semibold ${colors.text} hover:opacity-75 transition`}>
                        Read More <ArrowRight className="h-4 w-4" />
                      </a>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
