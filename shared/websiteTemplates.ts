export interface WebsiteTemplate {
  id: string;
  name: string;
  niche: string;
  description: string;
  defaultHeadline: string;
  defaultSubheadline: string;
  defaultFeatures: string[];
  alternateHeadlines?: string[];
  alternateSubheadlines?: string[];
  getHtml: (domainName: string, affiliateCode: string, customContent?: TemplateCustomization, colorScheme?: ColorScheme) => string;
}

export interface TemplateCustomization {
  headline?: string;
  subheadline?: string;
  features?: string[];
}

export interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  buttonBg: string;
  buttonText: string;
  gradientFrom: string;
  gradientTo: string;
}

export const colorSchemes: ColorScheme[] = [
  { id: 'blue', name: 'Ocean Blue', primary: '#2563eb', secondary: '#1e40af', accent: '#60a5fa', background: '#f0f9ff', text: '#1e3a5f', buttonBg: '#2563eb', buttonText: '#ffffff', gradientFrom: '#1e40af', gradientTo: '#3b82f6' },
  { id: 'red', name: 'Ruby Red', primary: '#dc2626', secondary: '#991b1b', accent: '#f87171', background: '#fef2f2', text: '#450a0a', buttonBg: '#dc2626', buttonText: '#ffffff', gradientFrom: '#991b1b', gradientTo: '#ef4444' },
  { id: 'green', name: 'Forest Green', primary: '#16a34a', secondary: '#166534', accent: '#4ade80', background: '#f0fdf4', text: '#14532d', buttonBg: '#16a34a', buttonText: '#ffffff', gradientFrom: '#166534', gradientTo: '#22c55e' },
  { id: 'purple', name: 'Royal Purple', primary: '#7c3aed', secondary: '#5b21b6', accent: '#a78bfa', background: '#faf5ff', text: '#3b0764', buttonBg: '#7c3aed', buttonText: '#ffffff', gradientFrom: '#5b21b6', gradientTo: '#8b5cf6' },
  { id: 'orange', name: 'Sunset Orange', primary: '#ea580c', secondary: '#c2410c', accent: '#fb923c', background: '#fff7ed', text: '#431407', buttonBg: '#ea580c', buttonText: '#ffffff', gradientFrom: '#c2410c', gradientTo: '#f97316' },
  { id: 'teal', name: 'Ocean Teal', primary: '#0d9488', secondary: '#115e59', accent: '#2dd4bf', background: '#f0fdfa', text: '#134e4a', buttonBg: '#0d9488', buttonText: '#ffffff', gradientFrom: '#115e59', gradientTo: '#14b8a6' },
  { id: 'pink', name: 'Hot Pink', primary: '#db2777', secondary: '#9d174d', accent: '#f472b6', background: '#fdf2f8', text: '#500724', buttonBg: '#db2777', buttonText: '#ffffff', gradientFrom: '#9d174d', gradientTo: '#ec4899' },
  { id: 'gold', name: 'Golden', primary: '#ca8a04', secondary: '#a16207', accent: '#facc15', background: '#fefce8', text: '#422006', buttonBg: '#ca8a04', buttonText: '#ffffff', gradientFrom: '#a16207', gradientTo: '#eab308' },
  { id: 'slate', name: 'Professional Slate', primary: '#475569', secondary: '#334155', accent: '#94a3b8', background: '#f8fafc', text: '#1e293b', buttonBg: '#475569', buttonText: '#ffffff', gradientFrom: '#334155', gradientTo: '#64748b' },
  { id: 'indigo', name: 'Deep Indigo', primary: '#4f46e5', secondary: '#3730a3', accent: '#818cf8', background: '#eef2ff', text: '#1e1b4b', buttonBg: '#4f46e5', buttonText: '#ffffff', gradientFrom: '#3730a3', gradientTo: '#6366f1' },
];

export const getColorSchemeById = (id: string): ColorScheme => {
  return colorSchemes.find(c => c.id === id) || colorSchemes[0];
};

export const getColorizedGradient = (scheme: ColorScheme): string => {
  return `background:linear-gradient(135deg,${scheme.gradientFrom} 0%,${scheme.gradientTo} 100%);color:white;`;
};

export interface WordingVariant {
  headline: string;
  subheadline: string;
}

export const wordingVariants: Record<string, WordingVariant[]> = {
  "web-hosting": [
    { headline: "Lightning-Fast Web Hosting", subheadline: "Get your website online in minutes. Blazing fast servers, 99.9% uptime, and 24/7 support included." },
    { headline: "Your Website Deserves Better Hosting", subheadline: "Ultra-fast servers that never let you down. Start your journey to online success today." },
    { headline: "Powerful Hosting Made Simple", subheadline: "Enterprise-grade performance without the complexity. Just fast, reliable hosting that works." },
    { headline: "Host With Confidence", subheadline: "Join thousands of satisfied customers with hosting you can trust. Speed, security, and support included." },
    { headline: "Web Hosting That Scales With You", subheadline: "From startup to enterprise, get the hosting power you need at every stage." },
  ],
  "domain-names": [
    { headline: "Claim Your Perfect Domain", subheadline: "Find and register the ideal domain name for your brand. Instant activation, free privacy protection." },
    { headline: "Your Dream Domain Awaits", subheadline: "Stand out online with a domain that's uniquely yours. Simple registration, instant ownership." },
    { headline: "Get Your Online Identity", subheadline: "Every great brand starts with a great domain. Secure yours in seconds." },
    { headline: "Domain Names Made Easy", subheadline: "Search, find, and register the perfect domain for your business in under 60 seconds." },
    { headline: "Own Your Corner of the Internet", subheadline: "Premium domains at affordable prices. Start building your brand today." },
  ],
  "website-builder": [
    { headline: "Build Your Website In Minutes", subheadline: "No coding needed. Drag, drop, and publish beautiful websites with our easy-to-use builder." },
    { headline: "Create Stunning Websites Easily", subheadline: "Professional designs without the learning curve. Build your dream site today." },
    { headline: "Your Website, Your Way", subheadline: "Customize every detail with our intuitive drag-and-drop editor. No experience required." },
    { headline: "Beautiful Websites Made Simple", subheadline: "Choose a template, customize it, and go live. It's really that easy." },
    { headline: "Build Like a Pro", subheadline: "Professional-looking websites without hiring a developer. Start free today." },
  ],
  "email-marketing": [
    { headline: "Email Marketing That Works", subheadline: "Reach your audience, grow your list, and increase sales with powerful email campaigns." },
    { headline: "Connect With Your Customers", subheadline: "Beautiful emails that convert. Simple automation that grows your business." },
    { headline: "Grow Your Business With Email", subheadline: "The most effective marketing channel is just a click away. Start sending today." },
    { headline: "Smart Email for Smart Marketers", subheadline: "Automation, analytics, and beautiful templates. Everything you need to succeed." },
    { headline: "Email Marketing Made Easy", subheadline: "From your first campaign to advanced automation, we've got you covered." },
  ],
  "social-media": [
    { headline: "Dominate Social Media", subheadline: "Schedule posts, analyze results, and grow your following across all platforms." },
    { headline: "Social Media Success Simplified", subheadline: "Manage all your accounts from one dashboard. Post smarter, not harder." },
    { headline: "Grow Your Social Presence", subheadline: "Tools and strategies to build your brand and engage your audience effectively." },
    { headline: "Social Media Made Simple", subheadline: "Schedule, analyze, and optimize your social presence with one powerful platform." },
    { headline: "Your Social Media Command Center", subheadline: "Everything you need to crush it on social, all in one place." },
  ],
  "seo-services": [
    { headline: "Get Found on Google", subheadline: "Professional SEO services that drive traffic, leads, and sales to your business." },
    { headline: "Rank Higher, Sell More", subheadline: "Data-driven SEO strategies that put your business in front of ready-to-buy customers." },
    { headline: "SEO That Delivers Results", subheadline: "Stop being invisible online. Start ranking for the keywords that matter." },
    { headline: "Dominate Search Results", subheadline: "Proven SEO techniques that help you outrank your competition." },
    { headline: "Your Path to Page One", subheadline: "Expert SEO services that transform your online visibility and business growth." },
  ],
  "online-courses": [
    { headline: "Learn New Skills Online", subheadline: "Expert-led courses that help you master new skills and advance your career." },
    { headline: "Education On Your Terms", subheadline: "Learn at your own pace with world-class instructors and practical content." },
    { headline: "Master New Skills Today", subheadline: "From beginner to expert, our courses take you where you want to go." },
    { headline: "Your Learning Journey Starts Here", subheadline: "Comprehensive courses designed by experts who've been where you want to be." },
    { headline: "Invest in Yourself", subheadline: "Skills that pay dividends. Learn from the best, become your best." },
  ],
  "coaching": [
    { headline: "Transform Your Life Today", subheadline: "Personal coaching that helps you break through barriers and achieve your goals." },
    { headline: "Unlock Your Full Potential", subheadline: "Expert guidance to help you become the best version of yourself." },
    { headline: "Your Success Starts With Coaching", subheadline: "One-on-one support that accelerates your personal and professional growth." },
    { headline: "Achieve More With a Coach", subheadline: "Stop dreaming, start doing. Get the accountability and guidance you need." },
    { headline: "Breakthrough Coaching", subheadline: "Discover what's holding you back and break free with proven coaching methods." },
  ],
  "consulting": [
    { headline: "Expert Consulting Solutions", subheadline: "Strategic insights and actionable advice to help your business thrive." },
    { headline: "Grow Your Business With Experts", subheadline: "Tap into years of experience and proven strategies for rapid growth." },
    { headline: "Business Consulting That Works", subheadline: "Real solutions for real business challenges. Let's build your success together." },
    { headline: "Strategic Business Consulting", subheadline: "From strategy to execution, we help you make smarter decisions faster." },
    { headline: "Your Business Growth Partner", subheadline: "Expert advisors who understand your challenges and help you overcome them." },
  ],
  "ecommerce": [
    { headline: "Start Selling Online Today", subheadline: "Everything you need to launch, grow, and scale your online store." },
    { headline: "Your Online Store Awaits", subheadline: "Beautiful storefronts that convert visitors into loyal customers." },
    { headline: "E-commerce Made Easy", subheadline: "From first product to first million, we power your online success." },
    { headline: "Sell More Online", subheadline: "Powerful tools, stunning designs, and seamless checkout experiences." },
    { headline: "Launch Your Dream Store", subheadline: "No technical skills required. Start selling in minutes, not months." },
  ],
  "dropshipping": [
    { headline: "Start Dropshipping Now", subheadline: "Build a profitable online business without inventory. We handle the fulfillment." },
    { headline: "Your Dropshipping Empire Starts Here", subheadline: "Sell products worldwide without storing a single item. Easy, profitable, scalable." },
    { headline: "Dropshipping Done Right", subheadline: "Access thousands of products, reliable suppliers, and proven systems for success." },
    { headline: "Build a Business With No Inventory", subheadline: "The smartest way to start an online business. Low risk, high potential." },
    { headline: "Profitable Dropshipping Made Simple", subheadline: "From product selection to order fulfillment, we've simplified everything." },
  ],
  "print-on-demand": [
    { headline: "Create & Sell Custom Products", subheadline: "Design custom merchandise and sell it worldwide. No inventory, no risk." },
    { headline: "Your Designs, Your Profits", subheadline: "Turn your creativity into income with print-on-demand products." },
    { headline: "Launch Your Merch Brand", subheadline: "From t-shirts to mugs, create products your fans will love." },
    { headline: "Print On Demand Made Easy", subheadline: "Upload designs, we print and ship. You keep the profits." },
    { headline: "Build Your Merchandise Empire", subheadline: "Custom products, zero inventory, unlimited potential." },
  ],
  "affiliate-marketing": [
    { headline: "Earn With Affiliate Marketing", subheadline: "Promote products you love and earn commissions on every sale." },
    { headline: "Your Affiliate Success Story Starts Here", subheadline: "Learn proven strategies to build passive income through affiliate marketing." },
    { headline: "Make Money While You Sleep", subheadline: "Build a sustainable affiliate income with our training and tools." },
    { headline: "Affiliate Marketing Mastery", subheadline: "From zero to profitable affiliate marketer. Everything you need to succeed." },
    { headline: "Turn Links Into Income", subheadline: "Discover the art of affiliate marketing and start earning today." },
  ],
  "crypto-trading": [
    { headline: "Master Crypto Trading", subheadline: "Learn to trade cryptocurrency profitably with expert strategies and real-time signals." },
    { headline: "Profit From Crypto Markets", subheadline: "Whether bull or bear, learn strategies that work in any market condition." },
    { headline: "Your Crypto Trading Edge", subheadline: "Tools, signals, and education to help you trade smarter, not harder." },
    { headline: "Trade Crypto Like a Pro", subheadline: "Expert training and proven strategies for consistent crypto profits." },
    { headline: "Cryptocurrency Trading Simplified", subheadline: "From Bitcoin to altcoins, master the markets with confidence." },
  ],
  "forex-trading": [
    { headline: "Trade Forex Profitably", subheadline: "Learn to navigate the world's largest market with proven trading strategies." },
    { headline: "Master the Forex Markets", subheadline: "Professional trading education that turns beginners into profitable traders." },
    { headline: "Your Forex Trading Journey", subheadline: "Real-time signals, expert education, and a supportive trading community." },
    { headline: "Forex Success Starts Here", subheadline: "From fundamentals to advanced strategies, we guide your trading journey." },
    { headline: "Trade Currencies Like a Pro", subheadline: "Join thousands of successful traders who started right here." },
  ],
  "stock-trading": [
    { headline: "Build Wealth Through Stocks", subheadline: "Learn to invest and trade stocks with confidence using proven strategies." },
    { headline: "Master Stock Market Investing", subheadline: "From first trade to portfolio growth, we guide your investment journey." },
    { headline: "Your Stock Trading Advantage", subheadline: "Expert analysis, real-time alerts, and education that works." },
    { headline: "Invest Smarter, Earn More", subheadline: "Take control of your financial future with intelligent stock trading." },
    { headline: "Stock Market Success", subheadline: "Learn the strategies that professional traders use every day." },
  ],
  "fitness": [
    { headline: "Transform Your Body", subheadline: "Personalized workout plans and expert guidance for real results." },
    { headline: "Your Fitness Journey Starts Now", subheadline: "From couch to confident, we help you achieve your fitness goals." },
    { headline: "Get Fit, Feel Amazing", subheadline: "Science-backed programs designed for sustainable, lasting results." },
    { headline: "Fitness That Fits Your Life", subheadline: "Flexible workouts, nutritional guidance, and ongoing support." },
    { headline: "Unlock Your Best Body", subheadline: "Expert trainers, proven programs, real transformations." },
  ],
  "nutrition": [
    { headline: "Eat Better, Live Better", subheadline: "Personalized nutrition plans that help you reach your health goals." },
    { headline: "Fuel Your Best Life", subheadline: "Custom meal plans and nutrition guidance for optimal health." },
    { headline: "Nutrition Made Simple", subheadline: "No fad diets, just science-backed nutrition that actually works." },
    { headline: "Transform Your Health Through Food", subheadline: "Expert nutritionists helping you eat for energy, health, and longevity." },
    { headline: "Your Personalized Nutrition Plan", subheadline: "Tailored meal plans that fit your lifestyle and taste preferences." },
  ],
  "mindfulness": [
    { headline: "Find Your Inner Peace", subheadline: "Guided meditation and mindfulness practices for a calmer, happier life." },
    { headline: "Mindfulness for Modern Life", subheadline: "Reduce stress, improve focus, and find balance in just minutes a day." },
    { headline: "Calm Your Mind, Transform Your Life", subheadline: "Simple practices that create profound changes in your well-being." },
    { headline: "Your Path to Inner Peace", subheadline: "Meditation made accessible. Start your mindfulness journey today." },
    { headline: "Stress Less, Live More", subheadline: "Proven mindfulness techniques for a more peaceful, productive life." },
  ],
};

export const getWordingVariant = (templateId: string, index: number): WordingVariant | null => {
  const variants = wordingVariants[templateId];
  if (!variants || variants.length === 0) return null;
  return variants[index % variants.length];
};

const createRegistrationForm = (domainName: string, affiliateCode: string) => `
  <form id="signupForm" class="signup-form" onsubmit="submitSignup(event)">
    <input type="text" id="name" name="name" placeholder="Your Full Name" required>
    <input type="email" id="email" name="email" placeholder="Email Address" required>
    <input type="text" id="username" name="username" placeholder="Choose Your Username (your affiliate link)" required>
    <input type="password" id="password" name="password" placeholder="Create Password (min 6 characters)" minlength="6" required>
    <input type="hidden" id="referrer" name="referrer" value="${affiliateCode}">
    <button type="submit" id="submitBtn">Start FREE 3-Day Trial</button>
    <p class="form-note">No credit card required for trial. Cancel anytime.</p>
  </form>
  <div id="successMessage" style="display: none;" class="success-message">
    <h3>Welcome Aboard!</h3>
    <p>Your account has been created. Redirecting to your dashboard...</p>
  </div>
  <div id="errorMessage" style="display: none;" class="error-message"></div>
  <script>
    async function submitSignup(e) {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      const errorDiv = document.getElementById('errorMessage');
      errorDiv.style.display = 'none';
      btn.textContent = 'Creating Account...';
      btn.disabled = true;
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const referrer = document.getElementById('referrer').value;
      
      try {
        const response = await fetch('https://rentapog.com/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name,
            email: email,
            username: username,
            password: password,
            affiliateCode: referrer || '${affiliateCode}',
            source: '${domainName}'
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          document.getElementById('signupForm').style.display = 'none';
          document.getElementById('successMessage').style.display = 'block';
          setTimeout(() => {
            window.location.href = 'https://backend.rentapog.com';
          }, 2000);
        } else {
          errorDiv.textContent = data.message || 'Registration failed. Please try again.';
          errorDiv.style.display = 'block';
          btn.textContent = 'Start FREE 3-Day Trial';
          btn.disabled = false;
        }
      } catch (err) {
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.style.display = 'block';
        btn.textContent = 'Start FREE 3-Day Trial';
        btn.disabled = false;
      }
    }
  </script>
`;

const createFooter = (domainName: string) => `
<footer style="background: #1f2937; color: white; padding: 60px 20px 30px;">
  <div style="max-width: 1200px; margin: 0 auto;">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; margin-bottom: 40px;">
      <div>
        <h4 style="font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #60a5fa;">${domainName}</h4>
        <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">The world's first daily-pay domain rental platform. Try FREE for 3 days, earn daily commissions.</p>
      </div>
      <div>
        <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 20px; color: #60a5fa;">Quick Links</h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><a href="https://rentapog.com/howitworks" style="color: #9ca3af; text-decoration: none;">How It Works</a></li>
          <li style="margin-bottom: 10px;"><a href="https://packages.rentapog.com" style="color: #9ca3af; text-decoration: none;">View Packages</a></li>
          <li style="margin-bottom: 10px;"><a href="https://backend.rentapog.com" style="color: #9ca3af; text-decoration: none;">Member Login</a></li>
        </ul>
      </div>
      <div>
        <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 20px; color: #60a5fa;">Legal</h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><a href="https://rentapog.com/privacy" style="color: #9ca3af; text-decoration: none;">Privacy Policy</a></li>
          <li style="margin-bottom: 10px;"><a href="https://rentapog.com/terms" style="color: #9ca3af; text-decoration: none;">Terms of Service</a></li>
          <li style="margin-bottom: 10px;"><a href="https://rentapog.com/legal" style="color: #9ca3af; text-decoration: none;">Disclaimer</a></li>
        </ul>
      </div>
      <div>
        <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 20px; color: #60a5fa;">Support</h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><a href="mailto:support@rentapog.com" style="color: #9ca3af; text-decoration: none;">Email Support</a></li>
          <li style="margin-bottom: 10px;"><a href="https://rentapog.com/blog" style="color: #9ca3af; text-decoration: none;">Blog & Tips</a></li>
        </ul>
      </div>
    </div>
    <div style="border-top: 1px solid #374151; padding-top: 30px;">
      <p style="font-size: 12px; color: #6b7280; margin-bottom: 15px; line-height: 1.6;">
        <strong>Earnings Disclaimer:</strong> Results vary. The income examples shown are not typical and are not guarantees. Your success depends on your effort, skills, and market conditions. We make no guarantees regarding income or results.
      </p>
      <p style="font-size: 12px; color: #6b7280; margin-bottom: 15px; line-height: 1.6;">
        <strong>Affiliate Disclosure:</strong> This site contains affiliate links. We may earn a commission if you make a purchase through our links, at no extra cost to you.
      </p>
      <p style="font-size: 14px; color: #9ca3af; margin: 0; text-align: center;">
        © 2025 ${domainName}. Powered by <a href="https://rentapog.com" style="color: #60a5fa; text-decoration: none;">RentAPog</a> - The Daily-Pay Domain Platform.
      </p>
    </div>
  </div>
</footer>
`;

const createAffiliateSection = (domainName: string) => `
<section style="padding: 80px 20px; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white;">
  <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
    <h2 style="font-size: 2.5em; margin-bottom: 20px;">Start FREE for 3 Days - No Risk!</h2>
    <p style="font-size: 1.2em; opacity: 0.9; margin-bottom: 40px;">Try before you commit! Cancel anytime during your trial - no questions asked.</p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 50px;">
      <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 12px;">
        <div style="font-size: 2em; margin-bottom: 15px;">1</div>
        <h3 style="font-size: 1.3em; margin-bottom: 10px;">Sign Up FREE</h3>
        <p style="opacity: 0.9;">Create your account and start your 3-day free trial instantly. No payment required upfront.</p>
      </div>
      <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 12px;">
        <div style="font-size: 2em; margin-bottom: 15px;">2</div>
        <h3 style="font-size: 1.3em; margin-bottom: 10px;">Share Your Link</h3>
        <p style="opacity: 0.9;">Get your unique affiliate link and start sharing. Every signup you refer = commissions for you.</p>
      </div>
      <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 12px;">
        <div style="font-size: 2em; margin-bottom: 15px;">3</div>
        <h3 style="font-size: 1.3em; margin-bottom: 10px;">Get Paid Daily</h3>
        <p style="opacity: 0.9;">Earn commissions paid directly to your Stripe account every single day. No monthly waits!</p>
      </div>
    </div>
  </div>
</section>

<section style="padding: 80px 20px; background: #f8fafc;">
  <div style="max-width: 1000px; margin: 0 auto;">
    <h2 style="font-size: 2.5em; text-align: center; margin-bottom: 20px; color: #1e293b;">The Fair Pass-Up System</h2>
    <p style="text-align: center; font-size: 1.2em; color: #64748b; margin-bottom: 50px;">Keep 100% of most sales. Only your 2nd sale covers platform costs.</p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 700px; margin: 0 auto 50px;">
      <div style="background: #22c55e; color: white; padding: 30px; border-radius: 12px; text-align: center;">
        <div style="font-size: 1.5em; font-weight: bold;">1st Sale</div>
        <div style="font-size: 2em; font-weight: bold; margin: 10px 0;">100%</div>
        <div>YOURS</div>
      </div>
      <div style="background: #f59e0b; color: white; padding: 30px; border-radius: 12px; text-align: center;">
        <div style="font-size: 1.5em; font-weight: bold;">2nd Sale</div>
        <div style="font-size: 2em; font-weight: bold; margin: 10px 0;">→</div>
        <div>Goes to Admin</div>
      </div>
      <div style="background: #22c55e; color: white; padding: 30px; border-radius: 12px; text-align: center;">
        <div style="font-size: 1.5em; font-weight: bold;">3rd+ Sales</div>
        <div style="font-size: 2em; font-weight: bold; margin: 10px 0;">100%</div>
        <div>YOURS FOREVER!</div>
      </div>
    </div>
    
    <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
      <h3 style="font-size: 1.8em; margin-bottom: 30px; text-align: center; color: #1e293b;">Why ${domainName}?</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px;">
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 2.5em; margin-bottom: 10px;">💰</div>
          <h4 style="font-size: 1.2em; margin-bottom: 10px; color: #1e293b;">Daily Payouts</h4>
          <p style="color: #64748b;">Get paid to Stripe every single day. No monthly waiting periods.</p>
        </div>
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 2.5em; margin-bottom: 10px;">✅</div>
          <h4 style="font-size: 1.2em; margin-bottom: 10px; color: #1e293b;">Transparent System</h4>
          <p style="color: #64748b;">Only 2nd sale goes to admin. Everything else is 100% yours.</p>
        </div>
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 2.5em; margin-bottom: 10px;">🚀</div>
          <h4 style="font-size: 1.2em; margin-bottom: 10px; color: #1e293b;">Quick Setup</h4>
          <p style="color: #64748b;">Start in minutes. Get your link, share it, earn commissions.</p>
        </div>
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 2.5em; margin-bottom: 10px;">♾️</div>
          <h4 style="font-size: 1.2em; margin-bottom: 10px; color: #1e293b;">Unlimited Earnings</h4>
          <p style="color: #64748b;">No caps, no limits. The more you refer, the more you earn.</p>
        </div>
      </div>
    </div>
  </div>
</section>
`;

const baseStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.6; }
  .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
  .hero { min-height: 90vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 40px 20px; }
  .hero h1 { font-size: 3em; margin-bottom: 20px; }
  .hero .domain-name { color: #ffd700; font-size: 0.8em; display: block; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }
  .hero .free-badge { background: #22c55e; color: white; padding: 8px 20px; border-radius: 50px; font-size: 0.9em; font-weight: bold; display: inline-block; margin-bottom: 20px; }
  .hero p { font-size: 1.3em; margin-bottom: 30px; opacity: 0.9; max-width: 600px; }
  .signup-form { display: flex; flex-direction: column; gap: 15px; max-width: 400px; margin: 0 auto; }
  .signup-form input { padding: 15px 20px; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; font-size: 16px; background: rgba(255,255,255,0.95); }
  .signup-form input:focus { outline: none; border-color: rgba(255,255,255,0.6); }
  .signup-form button { padding: 18px 30px; background: #22c55e; color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; transition: transform 0.2s, background 0.2s; }
  .signup-form button:hover { background: #16a34a; transform: scale(1.02); }
  .signup-form button:disabled { background: #999; cursor: not-allowed; transform: none; }
  .form-note { font-size: 12px; opacity: 0.8; text-align: center; }
  .success-message { text-align: center; padding: 40px; background: rgba(255,255,255,0.95); border-radius: 12px; }
  .success-message h3 { color: #22c55e; font-size: 2em; margin-bottom: 10px; }
  .error-message { background: #fee2e2; color: #dc2626; padding: 12px 20px; border-radius: 8px; text-align: center; font-size: 14px; }
  .features { padding: 80px 20px; background: #f8f9fa; }
  .features h2 { text-align: center; font-size: 2.5em; margin-bottom: 50px; }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; max-width: 1000px; margin: 0 auto; }
  .feature-card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .feature-card h3 { font-size: 1.4em; margin-bottom: 15px; color: #333; }
  .feature-card p { color: #666; }
  @media (max-width: 768px) { .hero h1 { font-size: 2em; } .hero p { font-size: 1.1em; } }
`;

export const websiteTemplates: WebsiteTemplate[] = [
  {
    id: "web-hosting",
    name: "Web Hosting",
    niche: "Web Services",
    description: "Fast, reliable web hosting for websites and apps",
    defaultHeadline: "Lightning-Fast Web Hosting",
    defaultSubheadline: "Get your website online in minutes. Blazing fast servers, 99.9% uptime, and 24/7 support included.",
    defaultFeatures: ["Unlimited Bandwidth", "Free SSL Certificate", "One-Click WordPress"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Lightning-Fast Web Hosting";
      const sub = custom?.subheadline || "Get your website online in minutes. Blazing fast servers, 99.9% uptime, and 24/7 support included.";
      const f = custom?.features || ["Unlimited Bandwidth", "Free SSL Certificate", "One-Click WordPress"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Web Hosting</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#1e3a5f 0%,#0d1b2a 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Why Host With ${domain}?</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0] || 'Unlimited Bandwidth'}</h3><p>No limits on traffic. Handle viral moments without breaking a sweat.</p></div>
        <div class="feature-card"><h3>${f[1] || 'Free SSL'}</h3><p>Secure your site with HTTPS. Build trust with every visitor.</p></div>
        <div class="feature-card"><h3>${f[2] || 'Easy Setup'}</h3><p>Install WordPress, Joomla, or any CMS with just one click.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "domain-names",
    name: "Domain Names",
    niche: "Web Services",
    description: "Register and manage premium domain names",
    defaultHeadline: "Claim Your Perfect Domain",
    defaultSubheadline: "Find and register the ideal domain name for your brand. Instant activation, free privacy protection.",
    defaultFeatures: ["Instant Activation", "Free WHOIS Privacy", "Easy DNS Management"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Claim Your Perfect Domain";
      const sub = custom?.subheadline || "Find and register the ideal domain name for your brand. Instant activation, free privacy protection.";
      const f = custom?.features || ["Instant Activation", "Free WHOIS Privacy", "Easy DNS Management"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Domain Names</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#8b5cf6 0%,#6366f1 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Get Your Domain at ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Your domain goes live immediately after purchase. No waiting.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Keep your personal info private from spammers and scrapers.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Point your domain anywhere with our simple DNS dashboard.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "website-builder",
    name: "Website Builder",
    niche: "Web Services",
    description: "Drag-and-drop website builder for everyone",
    defaultHeadline: "Build Your Website In Minutes",
    defaultSubheadline: "No coding needed. Drag, drop, and publish beautiful websites with our easy-to-use builder.",
    defaultFeatures: ["Drag & Drop Editor", "100+ Templates", "Mobile Responsive"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Build Your Website In Minutes";
      const sub = custom?.subheadline || "No coding needed. Drag, drop, and publish beautiful websites with our easy-to-use builder.";
      const f = custom?.features || ["Drag & Drop Editor", "100+ Templates", "Mobile Responsive"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Website Builder</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#dc2626 0%,#991b1b 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Create With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Simply drag elements where you want them. It's that easy.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Professional designs for every industry. Pick one and customize.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Your site looks perfect on phones, tablets, and desktops.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "email-marketing",
    name: "Email Marketing",
    niche: "Web Services",
    description: "Email campaigns and automation tools",
    defaultHeadline: "Email Marketing That Converts",
    defaultSubheadline: "Send beautiful emails, automate campaigns, and grow your audience. All the tools you need in one place.",
    defaultFeatures: ["Drag & Drop Emails", "Automation Sequences", "Detailed Analytics"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Email Marketing That Converts";
      const sub = custom?.subheadline || "Send beautiful emails, automate campaigns, and grow your audience. All the tools you need in one place.";
      const f = custom?.features || ["Drag & Drop Emails", "Automation Sequences", "Detailed Analytics"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Email Marketing</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#0891b2 0%,#0e7490 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Grow Your List with ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Create stunning email campaigns without touching any code.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Set up welcome series, drip campaigns, and triggered emails.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Track opens, clicks, and conversions in real-time.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "cloud-storage",
    name: "Cloud Storage",
    niche: "Web Services",
    description: "Secure cloud storage for files and backups",
    defaultHeadline: "Your Files, Everywhere",
    defaultSubheadline: "Store, sync, and share files from any device. Bank-level encryption keeps your data safe.",
    defaultFeatures: ["Access Anywhere", "Auto-Sync", "End-to-End Encryption"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Your Files, Everywhere";
      const sub = custom?.subheadline || "Store, sync, and share files from any device. Bank-level encryption keeps your data safe.";
      const f = custom?.features || ["Access Anywhere", "Auto-Sync", "End-to-End Encryption"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Cloud Storage</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#ea580c 0%,#c2410c 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Store With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Phone, tablet, laptop, desktop - your files are always there.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Changes sync instantly across all your devices.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Your files are encrypted so only you can access them.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "vps-servers",
    name: "VPS Servers",
    niche: "Web Services",
    description: "Virtual private servers with full root access",
    defaultHeadline: "Powerful VPS Hosting",
    defaultSubheadline: "Get your own virtual server with full root access. Deploy apps, run scripts, host anything you want.",
    defaultFeatures: ["Full Root Access", "SSD Storage", "Instant Deployment"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Powerful VPS Hosting";
      const sub = custom?.subheadline || "Get your own virtual server with full root access. Deploy apps, run scripts, host anything you want.";
      const f = custom?.features || ["Full Root Access", "SSD Storage", "Instant Deployment"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - VPS Servers</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#059669 0%,#047857 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Deploy With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Complete control over your server. Install anything you need.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Lightning-fast solid-state drives for maximum performance.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Your server is ready in seconds, not hours.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "landing-pages",
    name: "Landing Pages",
    niche: "Web Services",
    description: "High-converting landing page builder",
    defaultHeadline: "Landing Pages That Convert",
    defaultSubheadline: "Create beautiful, high-converting landing pages in minutes. No design skills required.",
    defaultFeatures: ["Conversion Optimized", "A/B Testing", "Lead Capture Forms"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Landing Pages That Convert";
      const sub = custom?.subheadline || "Create beautiful, high-converting landing pages in minutes. No design skills required.";
      const f = custom?.features || ["Conversion Optimized", "A/B Testing", "Lead Capture Forms"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Landing Pages</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#0284c7 0%,#0369a1 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Convert More With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Templates designed by experts to maximize conversions.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Test different versions to find what works best.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Collect leads and grow your email list effortlessly.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "ecommerce",
    name: "E-Commerce Platform",
    niche: "Web Services",
    description: "Complete online store solution",
    defaultHeadline: "Start Selling Online Today",
    defaultSubheadline: "Launch your online store with everything you need. Products, payments, shipping - all in one place.",
    defaultFeatures: ["Easy Product Setup", "Secure Payments", "Order Management"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Start Selling Online Today";
      const sub = custom?.subheadline || "Launch your online store with everything you need. Products, payments, shipping - all in one place.";
      const f = custom?.features || ["Easy Product Setup", "Secure Payments", "Order Management"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - E-Commerce</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#4f46e5 0%,#4338ca 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Sell With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Add products with photos, descriptions, and variants in minutes.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Accept credit cards, PayPal, and more with built-in checkout.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Track orders, inventory, and fulfillment from one dashboard.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "seo-tools",
    name: "SEO Tools",
    niche: "Web Services",
    description: "Search engine optimization suite",
    defaultHeadline: "Rank Higher On Google",
    defaultSubheadline: "Powerful SEO tools to improve your search rankings. Track keywords, analyze competitors, and grow traffic.",
    defaultFeatures: ["Keyword Tracking", "Site Audits", "Competitor Analysis"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Rank Higher On Google";
      const sub = custom?.subheadline || "Powerful SEO tools to improve your search rankings. Track keywords, analyze competitors, and grow traffic.";
      const f = custom?.features || ["Keyword Tracking", "Site Audits", "Competitor Analysis"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - SEO Tools</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#65a30d 0%,#4d7c0f 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Grow Traffic With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Monitor your rankings for important keywords daily.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Find and fix SEO issues that hurt your rankings.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>See what's working for competitors and beat them.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "social-media",
    name: "Social Media Management",
    niche: "Web Services",
    description: "Schedule and manage social media posts",
    defaultHeadline: "Master Your Social Media",
    defaultSubheadline: "Schedule posts, track engagement, and grow your following across all platforms from one dashboard.",
    defaultFeatures: ["Multi-Platform Posting", "Content Calendar", "Analytics Dashboard"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Master Your Social Media";
      const sub = custom?.subheadline || "Schedule posts, track engagement, and grow your following across all platforms from one dashboard.";
      const f = custom?.features || ["Multi-Platform Posting", "Content Calendar", "Analytics Dashboard"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Social Media</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Grow With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Post to Facebook, Instagram, Twitter, LinkedIn and more at once.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Plan your content weeks or months in advance.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>See what's working and optimize your strategy.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "online-courses",
    name: "Online Course Platform",
    niche: "Web Services",
    description: "Create and sell online courses",
    defaultHeadline: "Share Your Knowledge Online",
    defaultSubheadline: "Create, sell, and deliver online courses. Video hosting, student management, and payments included.",
    defaultFeatures: ["Video Course Builder", "Student Dashboard", "Built-in Payments"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Share Your Knowledge Online";
      const sub = custom?.subheadline || "Create, sell, and deliver online courses. Video hosting, student management, and payments included.";
      const f = custom?.features || ["Video Course Builder", "Student Dashboard", "Built-in Payments"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Online Courses</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Teach With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Upload videos, create modules, and organize your curriculum.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Students get a beautiful portal to access their courses.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Accept payments and deliver access automatically.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "membership-sites",
    name: "Membership Sites",
    niche: "Web Services",
    description: "Create paid membership communities",
    defaultHeadline: "Build Your Membership Community",
    defaultSubheadline: "Create exclusive membership areas with recurring revenue. Content protection, member management, and billing.",
    defaultFeatures: ["Content Protection", "Member Management", "Recurring Billing"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Build Your Membership Community";
      const sub = custom?.subheadline || "Create exclusive membership areas with recurring revenue. Content protection, member management, and billing.";
      const f = custom?.features || ["Content Protection", "Member Management", "Recurring Billing"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Membership Sites</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#d946ef 0%,#a855f7 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Monetize With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Lock premium content behind member-only access.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Track members, manage access levels, and handle cancellations.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Set up monthly or yearly subscriptions that auto-renew.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "webinars",
    name: "Webinar Platform",
    niche: "Web Services",
    description: "Host live and automated webinars",
    defaultHeadline: "Host Webinars That Sell",
    defaultSubheadline: "Run live webinars or automated replays. Registration pages, email reminders, and replay hosting included.",
    defaultFeatures: ["Live & Automated", "Registration Pages", "Engagement Tools"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Host Webinars That Sell";
      const sub = custom?.subheadline || "Run live webinars or automated replays. Registration pages, email reminders, and replay hosting included.";
      const f = custom?.features || ["Live & Automated", "Registration Pages", "Engagement Tools"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Webinars</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#ec4899 0%,#db2777 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Present With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Go live or run pre-recorded webinars on autopilot.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Beautiful signup pages that convert visitors to registrants.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Polls, Q&A, and chat to keep your audience engaged.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "newsletter",
    name: "Newsletter Platform",
    niche: "Web Services",
    description: "Create and monetize email newsletters",
    defaultHeadline: "Launch Your Newsletter",
    defaultSubheadline: "Build a newsletter audience and monetize with paid subscriptions. Writing, publishing, and payments in one place.",
    defaultFeatures: ["Beautiful Editor", "Subscriber Management", "Paid Subscriptions"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Launch Your Newsletter";
      const sub = custom?.subheadline || "Build a newsletter audience and monetize with paid subscriptions. Writing, publishing, and payments in one place.";
      const f = custom?.features || ["Beautiful Editor", "Subscriber Management", "Paid Subscriptions"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Newsletter</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Write With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Write and format beautiful newsletters with ease.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Grow your list and segment your audience.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Charge for premium content and build recurring revenue.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "form-builder",
    name: "Form Builder",
    niche: "Web Services",
    description: "Create surveys, quizzes, and lead forms",
    defaultHeadline: "Build Forms That Work",
    defaultSubheadline: "Create surveys, contact forms, quizzes, and lead capture forms. Collect responses and integrate anywhere.",
    defaultFeatures: ["Drag & Drop Builder", "Conditional Logic", "Integrations"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Build Forms That Work";
      const sub = custom?.subheadline || "Create surveys, contact forms, quizzes, and lead capture forms. Collect responses and integrate anywhere.";
      const f = custom?.features || ["Drag & Drop Builder", "Conditional Logic", "Integrations"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Form Builder</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#14b8a6 0%,#0d9488 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Collect Data With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Add fields, rearrange, and customize without code.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Show or hide fields based on previous answers.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Connect to your CRM, email tool, or spreadsheet.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "chatbots",
    name: "Chatbot Builder",
    niche: "Web Services",
    description: "AI chatbots for websites",
    defaultHeadline: "Add AI Chat To Your Site",
    defaultSubheadline: "Build intelligent chatbots that answer questions, capture leads, and provide 24/7 support.",
    defaultFeatures: ["No-Code Builder", "AI Powered", "24/7 Support Bot"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Add AI Chat To Your Site";
      const sub = custom?.subheadline || "Build intelligent chatbots that answer questions, capture leads, and provide 24/7 support.";
      const f = custom?.features || ["No-Code Builder", "AI Powered", "24/7 Support Bot"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Chatbots</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#f472b6 0%,#ec4899 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Automate With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Create conversation flows visually, no coding needed.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Smart responses that understand what users are asking.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Answer customer questions even while you sleep.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "video-hosting",
    name: "Video Hosting",
    niche: "Web Services",
    description: "Professional video hosting and streaming",
    defaultHeadline: "Host Videos Like A Pro",
    defaultSubheadline: "Upload, organize, and embed videos anywhere. Fast streaming, custom player, and detailed analytics.",
    defaultFeatures: ["Fast Global CDN", "Custom Branding", "Video Analytics"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Host Videos Like A Pro";
      const sub = custom?.subheadline || "Upload, organize, and embed videos anywhere. Fast streaming, custom player, and detailed analytics.";
      const f = custom?.features || ["Fast Global CDN", "Custom Branding", "Video Analytics"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Video Hosting</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Stream With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Videos load instantly for viewers anywhere in the world.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Add your logo and colors to the video player.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>See who's watching, how long, and where they drop off.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "affiliate-marketing",
    name: "Affiliate Marketing",
    niche: "Web Services",
    description: "Run your own affiliate program",
    defaultHeadline: "Launch Your Affiliate Program",
    defaultSubheadline: "Let others promote your products and pay them commissions. Track referrals, manage affiliates, and automate payouts.",
    defaultFeatures: ["Affiliate Tracking", "Commission Management", "Auto Payouts"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Launch Your Affiliate Program";
      const sub = custom?.subheadline || "Let others promote your products and pay them commissions. Track referrals, manage affiliates, and automate payouts.";
      const f = custom?.features || ["Affiliate Tracking", "Commission Management", "Auto Payouts"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - Affiliate Marketing</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Scale With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Track every click, signup, and sale from your affiliates.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Set commission rates, tiers, and bonus structures.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Pay affiliates automatically via PayPal or direct deposit.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  },
  {
    id: "crm",
    name: "CRM System",
    niche: "Web Services",
    description: "Customer relationship management",
    defaultHeadline: "Manage Leads & Customers",
    defaultSubheadline: "Track leads, close deals, and manage customer relationships. Pipeline views, contact management, and automation.",
    defaultFeatures: ["Visual Pipeline", "Contact Management", "Sales Automation"],
    getHtml: (domain, aff, custom) => {
      const h = custom?.headline || "Manage Leads & Customers";
      const sub = custom?.subheadline || "Track leads, close deals, and manage customer relationships. Pipeline views, contact management, and automation.";
      const f = custom?.features || ["Visual Pipeline", "Contact Management", "Sales Automation"];
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain} - CRM</title><style>${baseStyles}</style></head><body>
      <div class="hero" style="background:linear-gradient(135deg,#eab308 0%,#ca8a04 100%);color:white;"><div class="container">
        <span class="domain-name">${domain}</span>
        <span class="free-badge">🎁 Try FREE for 3 Days!</span>
        <h1>${h}</h1>
        <p>${sub}</p>
        ${createRegistrationForm(domain, aff)}
      </div></div>
      <div class="features"><h2>Close More With ${domain}</h2><div class="feature-grid">
        <div class="feature-card"><h3>${f[0]}</h3><p>Drag and drop deals through your sales stages.</p></div>
        <div class="feature-card"><h3>${f[1]}</h3><p>Store all customer info, notes, and history in one place.</p></div>
        <div class="feature-card"><h3>${f[2]}</h3><p>Set up workflows that move deals and send follow-ups.</p></div>
      </div></div>
      ${createAffiliateSection(domain)}
      ${createFooter(domain)}
      </body></html>`;
    }
  }
];

export function getTemplateById(id: string): WebsiteTemplate | undefined {
  return websiteTemplates.find(t => t.id === id);
}
