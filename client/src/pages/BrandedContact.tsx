import { useRoute } from "wouter";
import { designThemes, DesignThemeName } from "@/components/DesignThemes";
import { useState, useEffect } from "react";
import { LogoGenerator } from "@/components/LogoGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";
import { BrandedFooter } from "@/components/BrandedFooter";

export default function BrandedContact() {
  const [match, params] = useRoute("/affiliate/:slug/contact");
  const [brandName, setBrandName] = useState("RentAPog");
  const [theme, setTheme] = useState<DesignThemeName>("modern");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (match && params?.slug) {
      const name = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
      setBrandName(name);
      const saved = localStorage.getItem(`theme-${params.slug}`);
      if (saved) setTheme(saved as DesignThemeName);
    }
  }, [match, params]);

  const currentTheme = designThemes[theme];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Send to admin support email
      await fetch("/api/email/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fromBrand: brandName,
          toEmail: "support@rentapog.com",
        }),
      });

      toast({ title: "✓ Message sent! We'll get back to you soon." });
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      toast({ title: "Error sending message", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full min-h-screen ${currentTheme.colors.bg}`}>
      {/* Header */}
      <header className={`${currentTheme.colors.header} border-b-4`}>
        <div className="container px-4 md:px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <LogoGenerator brandName={brandName} style={currentTheme.logoStyle} />
            <h1 className={`text-2xl font-bold ${currentTheme.colors.accent}`}>{brandName}</h1>
          </div>
          <p className="text-sm opacity-75">Get in Touch</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className={`text-3xl font-bold mb-6 ${currentTheme.colors.accent}`}>Contact Us</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-2">Name</label>
                <Input
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-2">Message</label>
                <textarea
                  placeholder="Your message"
                  rows={5}
                  className="w-full p-3 border rounded-lg"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className={`w-full ${currentTheme.colors.button} text-white font-bold`}
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className={`text-3xl font-bold ${currentTheme.colors.accent}`}>Other Ways to Reach Us</h2>

            <div className={`${currentTheme.colors.card} p-6 rounded-lg`}>
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email Support</h3>
                  <p className="text-sm opacity-75">support@rentapog.com</p>
                  <p className="text-xs opacity-60 mt-2">We typically respond within 24 hours</p>
                </div>
              </div>
            </div>

            <div className={`${currentTheme.colors.card} p-6 rounded-lg`}>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Response Time</h3>
                  <p className="text-sm opacity-75">Monday - Friday, 9 AM - 5 PM EST</p>
                  <p className="text-xs opacity-60 mt-2">Weekend support available for urgent issues</p>
                </div>
              </div>
            </div>

            <div className={`${currentTheme.colors.card} p-6 rounded-lg`}>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Help Resources</h3>
                  <p className="text-sm opacity-75">Check our FAQ and Knowledge Base first</p>
                  <p className="text-xs opacity-60 mt-2">Many questions are answered there instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <BrandedFooter theme={theme} brandName={brandName} slug={params?.slug} />
    </div>
  );
}
