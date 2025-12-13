import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { deployToPages, addCustomDomain, getCustomDomains } from "./cloudflare-pages";
import { configureDomainDNS } from "./namecheap";
import Anthropic from "@anthropic-ai/sdk";

// Create Anthropic client lazily - uses your Claude API key
let anthropic: Anthropic | null = null;
function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Claude API key not configured");
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
}

export function registerUserSiteRoutes(app: Express) {
  // Get user's purchased domains
  app.get("/api/user/domains", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const domains = await storage.getPurchasedDomainsByUser(user.id);
      res.json({ domains });
    } catch (error: any) {
      console.error("Get user domains error:", error);
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });

  // Get user's site projects
  app.get("/api/user/sites", async (req: Request, res: Response) => {
    try {
      const userId = (req.query.userId as string) || (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const sites = await storage.getUserSiteProjectsByUser(userId);
      res.json({ sites });
    } catch (error: any) {
      console.error("Get user sites error:", error);
      res.status(500).json({ message: "Failed to fetch sites" });
    }
  });

  // Get single site project
  app.get("/api/user/sites/:id", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { id } = req.params;
      const site = await storage.getUserSiteProjectById(parseInt(id));
      
      if (!site || site.userId !== user.id) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      res.json({ site });
    } catch (error: any) {
      console.error("Get user site error:", error);
      res.status(500).json({ message: "Failed to fetch site" });
    }
  });

  // Create a new site project for a purchased domain
  app.post("/api/user/sites", async (req: Request, res: Response) => {
    try {
      const { domainName, purchasedDomainId, userId } = req.body;
      const resolvedUserId = userId || (req as any).user?.id;
      
      if (!resolvedUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get user info for affiliate link
      const user = await storage.getUserById(resolvedUserId);
      
      if (!domainName) {
        return res.status(400).json({ message: "Domain name is required" });
      }

      // Check if site already exists for this domain - if so, return it
      const existing = await storage.getUserSiteProjectByDomain(domainName);
      if (existing) {
        // Return existing site so frontend can regenerate
        return res.json({ success: true, site: existing, alreadyExists: true });
      }

      // Get user's affiliate link
      const affiliateLink = user?.affiliateLink || `https://rentapog.com/?ref=${user?.referralCode || 'default'}`;

      const site = await storage.createUserSiteProject({
        userId: resolvedUserId,
        purchasedDomainId: purchasedDomainId || null,
        domainName: domainName.toLowerCase(),
        affiliateLink,
        status: "draft",
      });

      console.log(`✓ [User Sites] Created site project for ${domainName} by user ${user?.email || resolvedUserId}`);
      res.json({ success: true, site });
    } catch (error: any) {
      console.error("Create user site error:", error);
      res.status(500).json({ message: error?.message || "Failed to create site" });
    }
  });

  // Update site project (for template-based content)
  app.patch("/api/user/sites/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { htmlContent, cssContent, jsContent } = req.body;
      
      const site = await storage.getUserSiteProjectById(parseInt(id));
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      const updateData: any = {};
      if (htmlContent !== undefined) updateData.htmlContent = htmlContent;
      if (cssContent !== undefined) updateData.cssContent = cssContent;
      if (jsContent !== undefined) updateData.jsContent = jsContent;
      updateData.status = "draft";
      
      await storage.updateUserSiteProject(parseInt(id), updateData);
      
      const updated = await storage.getUserSiteProjectById(parseInt(id));
      console.log(`✓ [User Sites] Updated site ${id} with template content`);
      res.json({ success: true, site: updated });
    } catch (error: any) {
      console.error("Update user site error:", error);
      res.status(500).json({ message: error?.message || "Failed to update site" });
    }
  });

  // Generate website content with AI based on domain name
  app.post("/api/user/sites/:id/generate", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { customPrompt, userId, businessDescription } = req.body;
      const resolvedUserId = userId || (req as any).user?.id;
      
      if (!resolvedUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const site = await storage.getUserSiteProjectById(parseInt(id));
      
      if (!site || site.userId !== resolvedUserId) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      // Get user for affiliate link
      const user = await storage.getUserById(resolvedUserId);

      // Mark as generating
      await storage.updateUserSiteProject(parseInt(id), { status: "generating" });

      // Build AI prompt based on domain name
      const domainName = site.domainName.replace(/\.(com|net|org|io|co|xyz|info)$/i, '');
      const formattedDomainName = domainName
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      const affiliateLink = site.affiliateLink || user?.affiliateLink || `https://rentapog.com/?ref=${user?.referralCode || 'default'}`;

      const affiliateCode = user?.referralCode || 'default';
      const systemPrompt = `You are a professional web designer specializing in affiliate marketing landing pages. Create a complete, modern, responsive affiliate marketing landing page HTML.
The website should be themed around the brand name and promote an affiliate income opportunity.
Include proper HTML5 structure, inline CSS in a <style> tag, and make it visually appealing.
Use a modern color scheme with gradients that fits the brand.
IMPORTANT: Include a FULL REGISTRATION FORM (not just email capture) with these exact fields:
- Full Name (id="name", name="name")
- Email Address (id="email", name="email", type="email")
- Username/Affiliate Link (id="username", name="username" - tell user this will be their affiliate link)
- Password (id="password", name="password", type="password", minlength="6")
- Hidden field: <input type="hidden" id="referrer" name="referrer" value="${affiliateCode}">
The form should POST to: https://rentapog.com/api/register
Button text: "Start FREE 3-Day Trial"
Add note below button: "No credit card required for trial. Cancel anytime."
All other CTA buttons should link to: #signupForm (scroll to the form)
Include JavaScript for form handling that submits via fetch() and shows success/error messages.
Return ONLY valid HTML code, no explanations or markdown.`;

      const businessContext = businessDescription 
        ? `\n\nBrand Focus: ${businessDescription}\nUse this to customize the messaging, but keep it focused on the affiliate income opportunity.`
        : '';

      const userPrompt = customPrompt || `Create an affiliate marketing landing page for a brand called "${formattedDomainName}" (domain: ${site.domainName}).${businessContext}

This is an AFFILIATE INCOME landing page. The page should include:

1. **Hero Section** with:
   - The brand name "${formattedDomainName}" prominently displayed
   - A powerful headline about earning daily income (e.g., "Start Earning Daily Commissions", "Turn Your Network Into Income")
   - A subheading about affiliate marketing opportunity

2. **FULL REGISTRATION FORM** (REQUIRED - this is the main conversion point):
   - A prominent card/box with the form (id="signupForm")
   - Headline: "Start Your FREE 3-Day Trial"
   - Subheading: "Create your account and get your personal affiliate link"
   - Form fields in order:
     * Full Name: <input type="text" id="name" name="name" placeholder="Your Full Name" required>
     * Email: <input type="email" id="email" name="email" placeholder="Email Address" required>
     * Username: <input type="text" id="username" name="username" placeholder="Choose Your Username (this will be your affiliate link)" required>
     * Password: <input type="password" id="password" name="password" placeholder="Create Password (min 6 characters)" minlength="6" required>
     * Hidden: <input type="hidden" id="referrer" name="referrer" value="${affiliateCode}">
   - Submit button: "Start FREE 3-Day Trial"
   - Note below button: "No credit card required for trial. Cancel anytime."
   - Include this JavaScript at the end of the body:
   <script>
   document.getElementById('signupForm').addEventListener('submit', async (e) => {
     e.preventDefault();
     const btn = e.target.querySelector('button[type="submit"]');
     const originalText = btn.innerText;
     btn.innerText = 'Creating Account...';
     btn.disabled = true;
     try {
       const res = await fetch('https://rentapog.com/api/register', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({
           name: document.getElementById('name').value,
           email: document.getElementById('email').value,
           username: document.getElementById('username').value,
           password: document.getElementById('password').value,
           affiliateCode: document.getElementById('referrer').value,
           source: '${site.domainName}'
         })
       });
       const data = await res.json();
       if (res.ok) {
         document.getElementById('formMessage').innerHTML = '<div style="background:#10b981;color:white;padding:20px;border-radius:10px;text-align:center;"><h3>Account Created!</h3><p>Check your email to complete setup. Your affiliate link: <strong>rentapog.com/' + document.getElementById('username').value + '</strong></p><a href="https://backend.rentapog.com/login" style="color:white;font-weight:bold;">Click here to login</a></div>';
         e.target.style.display = 'none';
       } else {
         document.getElementById('formMessage').innerHTML = '<p style="color:#ef4444;">' + (data.message || 'Registration failed. Please try again.') + '</p>';
         btn.innerText = originalText;
         btn.disabled = false;
       }
     } catch(err) {
       document.getElementById('formMessage').innerHTML = '<p style="color:#ef4444;">Connection error. Please try again.</p>';
       btn.innerText = originalText;
       btn.disabled = false;
     }
   });
   </script>

3. **"How You Earn" Section** explaining the commission structure:
   - 1st sale: 100% commission - Keep it all
   - 2nd sale: Goes to platform (covers costs)
   - 3rd+ sales: 100% commission forever
   - Daily Stripe payouts
   - No caps or limits

4. **"Your Marketing Tools" Section** listing:
   - Pre-built branded landing pages
   - Custom domain forwarding
   - AI marketing mentor
   - Complete marketing guides
   - Real-time earnings tracking

5. **"How to Promote" Section** with promotion strategies:
   - TikTok, Instagram, Facebook
   - Google Ads
   - Email marketing
   - Your own domain forwarding

6. **Benefits Grid** (3 columns):
   - Daily Payouts - Get paid every day
   - Fair Commission - 100% on most sales
   - Unlimited Growth - No caps or limits

7. **Final CTA Section** with:
   - Headline: "Ready to Start Earning?"
   - Button: "Start Your FREE Trial Now" linking to: #signupForm (scroll to registration form)
   - Subtext: "3-day free trial. No credit card required."

8. **Footer** - This is REQUIRED and must include exactly this structure (use "${formattedDomainName}" as the brand name):

<footer style="background: #1f2937; color: white; padding: 60px 20px 30px;">
  <div style="max-width: 1200px; margin: 0 auto;">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; margin-bottom: 40px;">
      <div>
        <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 20px; color: #60a5fa;">Resources</h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><a href="https://${site.domainName}/features" style="color: #9ca3af; text-decoration: none;">Features</a></li>
          <li style="margin-bottom: 10px;"><a href="https://${site.domainName}/how-it-works" style="color: #9ca3af; text-decoration: none;">How It Works</a></li>
          <li style="margin-bottom: 10px;"><a href="https://${site.domainName}/pricing" style="color: #9ca3af; text-decoration: none;">Pricing</a></li>
        </ul>
      </div>
      <div>
        <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 20px; color: #60a5fa;">Community</h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><a href="https://${site.domainName}/affiliate" style="color: #9ca3af; text-decoration: none;">Become Affiliate</a></li>
          <li style="margin-bottom: 10px;"><a href="https://${site.domainName}/blog" style="color: #9ca3af; text-decoration: none;">Blog</a></li>
          <li style="margin-bottom: 10px;"><a href="mailto:support@${site.domainName}" style="color: #9ca3af; text-decoration: none;">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 20px; color: #60a5fa;">Legal</h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><a href="https://${site.domainName}/privacy" style="color: #9ca3af; text-decoration: none;">Privacy Policy</a></li>
          <li style="margin-bottom: 10px;"><a href="https://${site.domainName}/terms" style="color: #9ca3af; text-decoration: none;">Terms & Conditions</a></li>
          <li style="margin-bottom: 10px;"><a href="https://${site.domainName}/disclaimer" style="color: #9ca3af; text-decoration: none;">Disclaimer</a></li>
        </ul>
      </div>
      <div>
        <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 20px; color: #60a5fa;">Support</h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><a href="https://${site.domainName}/help" style="color: #9ca3af; text-decoration: none;">Help Center</a></li>
          <li style="margin-bottom: 10px;"><a href="https://${site.domainName}/faq" style="color: #9ca3af; text-decoration: none;">FAQ</a></li>
          <li style="margin-bottom: 10px;"><a href="mailto:support@${site.domainName}" style="color: #9ca3af; text-decoration: none;">Email Support</a></li>
        </ul>
      </div>
    </div>
    <div style="border-top: 1px solid #374151; padding-top: 30px;">
      <p style="font-size: 12px; color: #6b7280; margin-bottom: 15px; line-height: 1.6;">
        <strong>Earnings Disclaimer:</strong> Results vary. The income examples shown are not typical and are not guarantees. Your success depends on your effort, skills, and market conditions. We make no guarantees regarding income or results.
      </p>
      <p style="font-size: 14px; color: #9ca3af; margin: 0; text-align: center;">
        © 2025 ${formattedDomainName}. All rights reserved. | The world's first daily-pay domain rental platform.
      </p>
    </div>
  </div>
</footer>

Use a bold, modern design with gradient backgrounds (purple/blue or similar).
Make CTA buttons prominent. The email form should be the PRIMARY focus of the page.
Add checkmarks (✓) and emoji icons to make sections scannable.`;

      console.log(`🤖 [User Sites] Generating website for ${site.domainName}...`);

      const response = await getAnthropicClient().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        messages: [
          { role: "user", content: userPrompt }
        ],
        system: systemPrompt,
      });

      // Extract text content from response
      let htmlContent = "";
      for (const block of response.content) {
        if (block.type === "text") {
          htmlContent = block.text;
          break;
        }
      }

      // Clean up response (remove markdown code blocks if present)
      htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

      // Validate we got actual content
      if (!htmlContent || htmlContent.length < 100) {
        throw new Error("AI did not generate valid HTML content");
      }

      // Post-process: Ensure all CTA links point to affiliate URL
      // Replace common placeholder href values with the affiliate link
      htmlContent = htmlContent
        .replace(/href=["']#["']/g, `href="${affiliateLink}"`)
        .replace(/href=["']javascript:void\(0\)["']/g, `href="${affiliateLink}"`)
        .replace(/href=["']\/["']/g, `href="${affiliateLink}"`);

      // Update site with generated content
      await storage.updateUserSiteProject(parseInt(id), {
        htmlContent,
        coeyPrompt: userPrompt,
        coeyResponse: htmlContent,
        status: "draft",
      });

      const updated = await storage.getUserSiteProjectById(parseInt(id));

      console.log(`✅ [User Sites] Generated website for ${site.domainName}`);
      res.json({ success: true, site: updated });
    } catch (error: any) {
      console.error("Generate site error:", error);
      // Reset status on error
      const { id } = req.params;
      await storage.updateUserSiteProject(parseInt(id), { status: "draft" });
      res.status(500).json({ message: error?.message || "Failed to generate website" });
    }
  });

  // Update site content manually
  app.patch("/api/user/sites/:id", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { id } = req.params;
      const { htmlContent, cssContent, affiliateLink } = req.body;
      
      const site = await storage.getUserSiteProjectById(parseInt(id));
      
      if (!site || site.userId !== user.id) {
        return res.status(404).json({ message: "Site not found" });
      }

      const updateData: any = {};
      if (htmlContent !== undefined) updateData.htmlContent = htmlContent;
      if (cssContent !== undefined) updateData.cssContent = cssContent;
      if (affiliateLink !== undefined) updateData.affiliateLink = affiliateLink;

      await storage.updateUserSiteProject(parseInt(id), updateData);
      const updated = await storage.getUserSiteProjectById(parseInt(id));

      console.log(`✓ [User Sites] Updated site ${site.domainName}`);
      res.json({ success: true, site: updated });
    } catch (error: any) {
      console.error("Update user site error:", error);
      res.status(500).json({ message: error?.message || "Failed to update site" });
    }
  });

  // Deploy site to Cloudflare Pages
  app.post("/api/user/sites/:id/deploy", async (req: Request, res: Response) => {
    try {
      const { userId: bodyUserId } = req.body;
      const user = (req as any).user;
      const resolvedUserId = user?.id || bodyUserId;
      
      console.log(`[Deploy] Request - bodyUserId: ${bodyUserId}, sessionUser: ${user?.id}, resolved: ${resolvedUserId}`);
      
      if (!resolvedUserId) {
        console.log(`[Deploy] ERROR: No userId provided`);
        return res.status(401).json({ message: "Authentication error" });
      }
      
      const { id } = req.params;
      
      const site = await storage.getUserSiteProjectById(parseInt(id));
      
      console.log(`[Deploy] Site lookup - siteId: ${id}, found: ${!!site}, siteUserId: ${site?.userId}`);
      
      // Compare as strings to handle type mismatches
      if (!site || String(site.userId) !== String(resolvedUserId)) {
        console.log(`[Deploy] ERROR: Site not found or ownership mismatch`);
        return res.status(404).json({ message: "Site not found" });
      }

      if (!site.htmlContent) {
        return res.status(400).json({ message: "No content to deploy. Generate a website first." });
      }

      console.log(`🚀 [User Sites] Deploying ${site.domainName}...`);

      // Build full HTML with CSS
      let fullHtml = site.htmlContent;
      if (site.cssContent) {
        if (fullHtml.includes("</head>")) {
          fullHtml = fullHtml.replace("</head>", `<style>${site.cssContent}</style></head>`);
        }
      }

      // Generate project name from domain
      const projectName = `user-${site.domainName.replace(/\./g, '-')}`;

      // Deploy to Cloudflare Pages
      const deployResult = await deployToPages(projectName, [
        { path: "index.html", content: fullHtml },
      ]);

      if (!deployResult.success) {
        console.error(`❌ [User Sites] Deploy failed:`, deployResult.error);
        return res.status(500).json({ message: deployResult.error || "Deployment failed" });
      }

      // Update site with deployment info
      await storage.updateUserSiteProject(parseInt(id), {
        status: "published",
        cloudflareProjectName: projectName,
        liveUrl: deployResult.url,
        lastDeployedAt: new Date(),
      });

      // Try to add custom domain to Cloudflare Pages
      try {
        const domainResult = await addCustomDomain(projectName, site.domainName);
        if (domainResult.success) {
          console.log(`✓ [User Sites] Added custom domain ${site.domainName} to Cloudflare Pages`);
        } else {
          console.log(`⚠ [User Sites] Could not add custom domain to Pages: ${domainResult.error}`);
        }
      } catch (domainError) {
        console.log(`⚠ [User Sites] Cloudflare Pages custom domain setup skipped:`, domainError);
      }

      // Automatically configure DNS via Namecheap API
      let dnsConfigured = false;
      try {
        const pagesTarget = `${projectName}.pages.dev`;
        console.log(`🔧 [User Sites] Configuring DNS for ${site.domainName} -> ${pagesTarget}`);
        const dnsResult = await configureDomainDNS(site.domainName, pagesTarget);
        if (dnsResult.success) {
          console.log(`✓ [User Sites] DNS configured: ${site.domainName} now points to ${pagesTarget}`);
          dnsConfigured = true;
        } else {
          console.log(`⚠ [User Sites] DNS auto-config failed: ${dnsResult.error}`);
        }
      } catch (dnsError) {
        console.log(`⚠ [User Sites] DNS configuration skipped:`, dnsError);
      }

      const updated = await storage.getUserSiteProjectById(parseInt(id));

      console.log(`✅ [User Sites] Deployed to: ${deployResult.url}`);
      res.json({
        success: true,
        url: deployResult.url,
        deploymentId: deployResult.deploymentId,
        site: updated,
        dnsConfigured,
        message: dnsConfigured 
          ? `Site deployed! DNS configured automatically - ${site.domainName} will be live within minutes.`
          : `Site deployed to ${deployResult.url}. DNS may need manual configuration.`,
      });
    } catch (error: any) {
      console.error("Deploy user site error:", error);
      res.status(500).json({ message: error?.message || "Deployment failed" });
    }
  });

  // Delete site project
  app.delete("/api/user/sites/:id", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { id } = req.params;
      
      const site = await storage.getUserSiteProjectById(parseInt(id));
      
      if (!site || site.userId !== user.id) {
        return res.status(404).json({ message: "Site not found" });
      }

      await storage.deleteUserSiteProject(parseInt(id));

      console.log(`✓ [User Sites] Deleted site ${site.domainName}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete user site error:", error);
      res.status(500).json({ message: error?.message || "Failed to delete site" });
    }
  });
}
