import type { Express } from "express";
import { storage } from "./storage";
import { deployToPages, getProjectInfo, listPagesProjects, deletePagesProject, addCustomDomain, removeCustomDomain, getCustomDomains } from "./cloudflare-pages";
import { verifyAdminAuth } from "./admin-auth";

export function registerWebsiteBuilderRoutes(app: Express) {
  // Get all website projects (ADMIN ONLY)
  app.get("/api/admin/websites", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const projects = await storage.getWebsiteProjects();
      res.json(projects);
    } catch (error: any) {
      console.error("Get website projects error:", error);
      res.status(500).json({ message: "Failed to fetch website projects" });
    }
  });

  // Get single website project (ADMIN ONLY)
  app.get("/api/admin/websites/:id", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const { id } = req.params;
      const project = await storage.getWebsiteProjectById(parseInt(id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      console.error("Get website project error:", error);
      res.status(500).json({ message: "Failed to fetch website project" });
    }
  });

  // Create new website project (ADMIN ONLY)
  app.post("/api/admin/websites", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const { name, htmlContent, cssContent, jsContent } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Project name is required" });
      }

      // Generate URL-safe slug
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

      // Check if slug already exists
      const existing = await storage.getWebsiteProjectBySlug(slug);
      if (existing) {
        return res.status(400).json({ message: "A project with this name already exists" });
      }

      const project = await storage.createWebsiteProject({
        name,
        slug,
        htmlContent: htmlContent || getDefaultHtml(name),
        cssContent: cssContent || getDefaultCss(),
        jsContent: jsContent || "",
        status: "draft",
      });

      console.log(`✓ [Website Builder] Created project: ${name} (${slug})`);
      res.json({ success: true, project });
    } catch (error: any) {
      console.error("Create website project error:", error);
      res.status(500).json({ message: error?.message || "Failed to create website project" });
    }
  });

  // Update website project (ADMIN ONLY)
  app.patch("/api/admin/websites/:id", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const { id } = req.params;
      const { name, htmlContent, cssContent, jsContent } = req.body;

      const project = await storage.getWebsiteProjectById(parseInt(id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const updateData: any = {};
      if (name !== undefined) {
        updateData.name = name;
        updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      }
      if (htmlContent !== undefined) updateData.htmlContent = htmlContent;
      if (cssContent !== undefined) updateData.cssContent = cssContent;
      if (jsContent !== undefined) updateData.jsContent = jsContent;

      await storage.updateWebsiteProject(parseInt(id), updateData);
      const updated = await storage.getWebsiteProjectById(parseInt(id));

      console.log(`✓ [Website Builder] Updated project: ${project.name}`);
      res.json({ success: true, project: updated });
    } catch (error: any) {
      console.error("Update website project error:", error);
      res.status(500).json({ message: error?.message || "Failed to update website project" });
    }
  });

  // Delete website project (ADMIN ONLY)
  app.delete("/api/admin/websites/:id", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const { id } = req.params;

      const project = await storage.getWebsiteProjectById(parseInt(id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Optionally delete from Cloudflare Pages too
      if (project.cloudflareProjectName) {
        await deletePagesProject(project.cloudflareProjectName);
      }

      await storage.deleteWebsiteProject(parseInt(id));

      console.log(`✓ [Website Builder] Deleted project: ${project.name}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete website project error:", error);
      res.status(500).json({ message: error?.message || "Failed to delete website project" });
    }
  });

  // Deploy website to Cloudflare Pages (ADMIN ONLY)
  app.post("/api/admin/websites/:id/deploy", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const { id } = req.params;

      const project = await storage.getWebsiteProjectById(parseInt(id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (!project.htmlContent) {
        return res.status(400).json({ message: "No HTML content to deploy" });
      }

      console.log(`🚀 [Website Builder] Deploying project: ${project.name}`);

      // Build the complete HTML file with embedded CSS and JS
      const fullHtml = buildFullHtml(project.htmlContent, project.cssContent, project.jsContent);

      // Files to deploy
      const files = [
        { path: "index.html", content: fullHtml },
      ];

      // Deploy to Cloudflare Pages
      const deployResult = await deployToPages(project.slug, files);

      if (!deployResult.success) {
        console.error(`❌ [Website Builder] Deploy failed:`, deployResult.error);
        return res.status(500).json({ message: deployResult.error || "Deployment failed" });
      }

      // Update project with deployment info
      await storage.updateWebsiteProject(parseInt(id), {
        status: "published",
        cloudflareProjectName: project.slug,
        liveUrl: deployResult.url,
        lastDeployedAt: new Date(),
      });

      const updated = await storage.getWebsiteProjectById(parseInt(id));

      console.log(`✅ [Website Builder] Deployed to: ${deployResult.url}`);
      res.json({
        success: true,
        url: deployResult.url,
        deploymentId: deployResult.deploymentId,
        project: updated,
      });
    } catch (error: any) {
      console.error("Deploy website error:", error);
      res.status(500).json({ message: error?.message || "Deployment failed" });
    }
  });

  // Get deployment status (ADMIN ONLY)
  app.get("/api/admin/websites/:id/status", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const { id } = req.params;

      const project = await storage.getWebsiteProjectById(parseInt(id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (!project.cloudflareProjectName) {
        return res.json({ deployed: false, project });
      }

      const info = await getProjectInfo(project.cloudflareProjectName);
      res.json({
        deployed: true,
        project,
        cloudflare: info,
      });
    } catch (error: any) {
      console.error("Get deployment status error:", error);
      res.status(500).json({ message: "Failed to fetch deployment status" });
    }
  });

  // List all Cloudflare Pages projects (ADMIN ONLY)
  app.get("/api/admin/cloudflare/projects", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const projects = await listPagesProjects();
      res.json(projects);
    } catch (error: any) {
      console.error("List Cloudflare projects error:", error);
      res.status(500).json({ message: "Failed to fetch Cloudflare projects" });
    }
  });

  // Get custom domains for a website project (ADMIN ONLY)
  app.get("/api/admin/websites/:id/domains", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const { id } = req.params;
      const project = await storage.getWebsiteProjectById(parseInt(id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (!project.cloudflareProjectName) {
        return res.json({ domains: [], message: "Project not deployed yet" });
      }

      const domains = await getCustomDomains(project.cloudflareProjectName);
      res.json({ domains });
    } catch (error: any) {
      console.error("Get custom domains error:", error);
      res.status(500).json({ message: "Failed to fetch custom domains" });
    }
  });

  // Add custom domain to website project (ADMIN ONLY)
  app.post("/api/admin/websites/:id/domains", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const { id } = req.params;
      const { domain } = req.body;

      if (!domain) {
        return res.status(400).json({ message: "Domain is required" });
      }

      const project = await storage.getWebsiteProjectById(parseInt(id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (!project.cloudflareProjectName) {
        return res.status(400).json({ message: "Project must be deployed before adding custom domains" });
      }

      console.log(`🔗 [Website Builder] Adding custom domain ${domain} to ${project.name}`);
      
      const result = await addCustomDomain(project.cloudflareProjectName, domain);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error || "Failed to add custom domain" });
      }

      // Store the custom domain in the database
      const currentDomains = project.customDomains || [];
      if (!currentDomains.includes(domain)) {
        await storage.updateWebsiteProject(parseInt(id), {
          customDomains: [...currentDomains, domain],
        });
      }

      console.log(`✅ [Website Builder] Custom domain added: ${domain}`);
      res.json({
        success: true,
        domain: result.domain,
        status: result.status,
        message: "Custom domain added. Configure DNS to point to your Pages project.",
      });
    } catch (error: any) {
      console.error("Add custom domain error:", error);
      res.status(500).json({ message: error?.message || "Failed to add custom domain" });
    }
  });

  // Remove custom domain from website project (ADMIN ONLY)
  app.delete("/api/admin/websites/:id/domains/:domain", async (req, res) => {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const { id, domain } = req.params;

      const project = await storage.getWebsiteProjectById(parseInt(id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (!project.cloudflareProjectName) {
        return res.status(400).json({ message: "Project not deployed" });
      }

      console.log(`🔗 [Website Builder] Removing custom domain ${domain} from ${project.name}`);
      
      const result = await removeCustomDomain(project.cloudflareProjectName, domain);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error || "Failed to remove custom domain" });
      }

      // Remove from database
      const currentDomains = project.customDomains || [];
      await storage.updateWebsiteProject(parseInt(id), {
        customDomains: currentDomains.filter(d => d !== domain),
      });

      console.log(`✅ [Website Builder] Custom domain removed: ${domain}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Remove custom domain error:", error);
      res.status(500).json({ message: error?.message || "Failed to remove custom domain" });
    }
  });
}

// Helper: Build complete HTML with embedded CSS and JS
function buildFullHtml(html: string, css?: string | null, js?: string | null): string {
  // If HTML already has full structure, just inject CSS/JS
  if (html.includes("<!DOCTYPE") || html.includes("<html")) {
    let result = html;
    
    // Inject CSS before </head>
    if (css) {
      const cssTag = `<style>${css}</style>`;
      if (result.includes("</head>")) {
        result = result.replace("</head>", `${cssTag}</head>`);
      }
    }
    
    // Inject JS before </body>
    if (js) {
      const jsTag = `<script>${js}</script>`;
      if (result.includes("</body>")) {
        result = result.replace("</body>", `${jsTag}</body>`);
      }
    }
    
    return result;
  }

  // Build complete HTML structure
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website</title>
  ${css ? `<style>${css}</style>` : ''}
</head>
<body>
  ${html}
  ${js ? `<script>${js}</script>` : ''}
</body>
</html>`;
}

// Helper: Default HTML template
function getDefaultHtml(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
</head>
<body>
  <div class="container">
    <h1>Welcome to ${name}</h1>
    <p>Edit this content to build your website.</p>
  </div>
</body>
</html>`;
}

// Helper: Default CSS template
function getDefaultCss(): string {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  max-width: 600px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1a1a2e;
}

p {
  font-size: 1.2rem;
  color: #666;
}`;
}
