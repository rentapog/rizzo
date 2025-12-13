import { useRoute } from "wouter";
import { designThemes, DesignThemeName } from "@/components/DesignThemes";
import { useState, useEffect } from "react";
import { LogoGenerator } from "@/components/LogoGenerator";
import { Link } from "wouter";
import { BrandedFooter } from "@/components/BrandedFooter";

export default function BrandedBlog() {
  const [match, params] = useRoute("/affiliate/:slug/blog");
  const [brandName, setBrandName] = useState("RentAPog");
  const [theme, setTheme] = useState<DesignThemeName>("modern");

  useEffect(() => {
    if (match && params?.slug) {
      const name = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
      setBrandName(name);
      const saved = localStorage.getItem(`theme-${params.slug}`);
      if (saved) setTheme(saved as DesignThemeName);
    }
  }, [match, params]);

  const currentTheme = designThemes[theme];

  const blogPosts = [
    {
      slug: "getting-started",
      title: "Getting Started with Daily Payouts",
      excerpt: "Learn how to maximize your earnings with our daily payout system.",
      date: "Dec 1, 2025",
      category: "Guide",
    },
    {
      slug: "fair-affiliate-system",
      title: "Understanding the Fair Affiliate System",
      excerpt: "How our 2nd sale pass-up keeps the platform sustainable for everyone.",
      date: "Nov 28, 2025",
      category: "Education",
    },
    {
      slug: "top-strategies",
      title: "Top Strategies for Affiliate Success",
      excerpt: "Real tips from top earners on how to scale your referral income.",
      date: "Nov 25, 2025",
      category: "Strategy",
    },
    {
      slug: "success-stories",
      title: "Monthly Spotlight: Success Stories",
      excerpt: "Meet our top affiliates and hear how they built their income streams.",
      date: "Nov 20, 2025",
      category: "Stories",
    },
  ];

  return (
    <div className={`w-full min-h-screen ${currentTheme.colors.bg}`}>
      {/* Header */}
      <header className={`${currentTheme.colors.header} border-b-4`}>
        <div className="container px-4 md:px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <LogoGenerator brandName={brandName} style={currentTheme.logoStyle} />
            <h1 className={`text-2xl font-bold ${currentTheme.colors.accent}`}>{brandName}</h1>
          </div>
          <p className="text-sm opacity-75">Blog & Resources</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container px-4 md:px-6 py-12">
        <div className="mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${currentTheme.colors.accent}`}>Latest Articles</h2>
          <p className="opacity-75">Tips, strategies, and insights from our community</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {blogPosts.map((post, idx) => (
            <Link key={idx} href={`/affiliate/${params?.slug}/blog/${post.slug}`}>
              <a className={`${currentTheme.colors.card} p-6 rounded-lg hover:shadow-lg transition block cursor-pointer`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${currentTheme.colors.button} text-white`}>
                    {post.category}
                  </span>
                  <span className="text-xs opacity-60">{post.date}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className="opacity-75 mb-4">{post.excerpt}</p>
                <div className={`text-sm font-semibold ${currentTheme.colors.accent} hover:opacity-75`}>
                  Read More →
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <BrandedFooter theme={theme} brandName={brandName} slug={params?.slug} />
    </div>
  );
}
