import { Link } from "wouter";
import { DesignThemeName, designThemes } from "@/components/DesignThemes";

interface BrandedFooterProps {
  theme: DesignThemeName;
  brandName: string;
  slug?: string;
}

export function BrandedFooter({ theme, brandName, slug }: BrandedFooterProps) {
  const currentTheme = designThemes[theme];

  const slugPath = slug ? `/affiliate/${slug}` : "";

  return (
    <footer className={`${currentTheme.colors.footer} py-12 border-t-4 border-opacity-50 mt-auto`}>
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`${slugPath}/features`}>
                  <a className="hover:text-white transition">Features</a>
                </Link>
              </li>
              <li>
                <a href="https://rentapog.com" className="hover:text-white transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="https://packages.rentapog.com" className="hover:text-white transition">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`${slugPath}/blog`}>
                  <a className="hover:text-white transition">Blog</a>
                </Link>
              </li>
              <li>
                <Link href={`${slugPath}/contact`}>
                  <a className="hover:text-white transition">Contact</a>
                </Link>
              </li>
              <li>
                <a href="https://rentapog.com" className="hover:text-white transition">
                  About Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://rentapog.com/privacy" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://rentapog.com/terms" className="hover:text-white transition">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="https://rentapog.com" className="hover:text-white transition">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`${slugPath}/faq`}>
                  <a className="hover:text-white transition">FAQ</a>
                </Link>
              </li>
              <li>
                <Link href={`${slugPath}/contact`}>
                  <a className="hover:text-white transition">Get Help</a>
                </Link>
              </li>
              <li>
                <a href="mailto:support@rentapog.com" className="hover:text-white transition">
                  Email Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-opacity-50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm opacity-75">
            © 2025 {brandName}. All rights reserved. | Powered by RentAPog
          </p>
          <div className="flex gap-4 mt-4 md:mt-0 text-sm">
            <a href="https://rentapog.com/privacy" className="opacity-75 hover:text-white transition">
              Privacy
            </a>
            <a href="https://rentapog.com/terms" className="opacity-75 hover:text-white transition">
              Terms
            </a>
            <Link href={`${slugPath}/contact`}>
              <a className="opacity-75 hover:text-white transition">Contact</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
