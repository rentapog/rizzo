import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { designThemes, DesignThemeName } from "@/components/DesignThemes";
import { LogoGenerator } from "@/components/LogoGenerator";
import { BrandedFooter } from "@/components/BrandedFooter";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I start earning money?",
    answer: "Sign up with your email on your branded affiliate page, and you'll receive your unique affiliate link. Share this link with others, and you'll earn commissions when they sign up and rent pogs through the platform.",
  },
  {
    question: "When do I get paid?",
    answer: "We pay directly to your Stripe account daily. As soon as a rental from your referral completes, the funds are processed and sent to you within 24 hours—no waiting for monthly payments!",
  },
  {
    question: "How much can I earn?",
    answer: "Your earnings depend on your referrals' activity. You keep 100% of sales from your 1st, 3rd, and subsequent referrals. The 2nd sale goes to admin to keep the platform running. There's no limit to how many referrals you can make or how much you can earn.",
  },
  {
    question: "What's the deal with the '2nd sale pass-up'?",
    answer: "To keep RentAPog sustainable without charging monthly fees, every 2nd sale from your referrals goes to the admin team. This means out of 10 referrals, you keep earnings from 8 of them. It's fair, transparent, and keeps the platform healthy long-term.",
  },
  {
    question: "Do my referrals need to buy something immediately?",
    answer: "Your referrals choose a package when they sign up. You earn from all their rental activity once they're active on the platform.",
  },
  {
    question: "How do I track my earnings?",
    answer: "You have access to your personal dashboard where you can see real-time earnings, active referrals, payout history, and detailed analytics about your performance.",
  },
  {
    question: "Can I customize my affiliate page?",
    answer: "Absolutely! Every affiliate gets their own branded page with 25 different design themes. You can change the theme, colors, and styling to match your brand or preferences. Your domain name is displayed prominently on your page.",
  },
  {
    question: "What if someone signs up through my link but doesn't rent?",
    answer: "You only earn on actual rental activity. If they sign up but never rent, there's no commission. This ensures quality referrals and aligns our interests—you're rewarded for bringing active users.",
  },
  {
    question: "Can I use my affiliate link on social media?",
    answer: "Yes! You can share your affiliate link everywhere—social media, blogs, emails, forums, etc. The more places you share it, the more potential referrals you can get.",
  },
  {
    question: "Is there a cap on earnings?",
    answer: "No cap at all! The more referrals you bring and the more they rent, the more you earn. Scale is unlimited.",
  },
  {
    question: "What if I have questions or need help?",
    answer: "We have a dedicated support team. You can contact us via email at support@rentapog.com or use the contact form on your branded site. We typically respond within 24 hours.",
  },
  {
    question: "Can I refer other affiliates?",
    answer: "Great question! Yes, you can build a network of affiliates under you. Check your dashboard for referral program details and multi-level earning opportunities.",
  },
];

export default function BrandedFAQ() {
  const [match, params] = useRoute("/affiliate/:slug/faq");
  const [brandName, setBrandName] = useState("RentAPog");
  const [theme, setTheme] = useState<DesignThemeName>("modern");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (match && params?.slug) {
      const name = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
      setBrandName(name);
      const saved = localStorage.getItem(`theme-${params.slug}`);
      if (saved) setTheme(saved as DesignThemeName);
    }
  }, [match, params]);

  const currentTheme = designThemes[theme];

  return (
    <div className={`w-full min-h-screen ${currentTheme.colors.bg}`}>
      {/* Header */}
      <header className={`${currentTheme.colors.header} border-b-4`}>
        <div className="container px-4 md:px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <LogoGenerator brandName={brandName} domainName={params?.slug} style={currentTheme.logoStyle} compact />
            <h1 className={`text-2xl font-bold ${currentTheme.colors.accent}`}>{brandName}</h1>
          </div>
          <p className="text-sm opacity-75">Frequently Asked Questions</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${currentTheme.colors.accent}`}>FAQ</h2>
            <p className="opacity-75 text-lg">Find answers to common questions about earning with RentAPog</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`${currentTheme.colors.card} rounded-lg overflow-hidden border transition`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:opacity-80 transition"
                  data-testid={`button-faq-${idx}`}
                >
                  <h3 className="text-left font-semibold text-lg">{faq.question}</h3>
                  <ChevronDown
                    className={`h-5 w-5 transition ${openIndex === idx ? "rotate-180" : ""}`}
                  />
                </button>

                {openIndex === idx && (
                  <div className="px-6 pb-4 border-t opacity-75 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={`${currentTheme.colors.card} p-8 rounded-lg mt-12 border`}>
            <h3 className={`text-xl font-bold mb-2 ${currentTheme.colors.accent}`}>Still have questions?</h3>
            <p className="opacity-75 mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <a
              href={`/affiliate/${params?.slug}/contact`}
              className={`inline-block px-6 py-2 rounded-lg ${currentTheme.colors.button} text-white font-semibold hover:opacity-90 transition`}
              data-testid="link-contact-support"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <BrandedFooter slug={params?.slug} theme={currentTheme as any} brandName={params?.slug || "RentAPog"} />
    </div>
  );
}
