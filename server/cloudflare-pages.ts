// Cloudflare Pages API Integration for Website Deployment
// Deploys static HTML/CSS/JS sites to Cloudflare Pages

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface CloudflarePagesConfig {
  apiToken: string;
  accountId: string;
}

interface DeploymentResult {
  success: boolean;
  url?: string;
  deploymentId?: string;
  error?: string;
}

interface ProjectInfo {
  name: string;
  subdomain: string;
  domains: string[];
  latestDeployment?: {
    id: string;
    url: string;
    createdOn: string;
  };
}

function getCloudflareConfig(): CloudflarePagesConfig | null {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiToken || !accountId) {
    console.log("[Cloudflare Pages] Not configured - missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID");
    return null;
  }

  return { apiToken, accountId };
}

async function cfRequest(
  endpoint: string,
  method: string,
  config: CloudflarePagesConfig,
  body?: any,
  isFormData?: boolean
): Promise<any> {
  const url = `https://api.cloudflare.com/client/v4${endpoint}`;

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${config.apiToken}`,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  console.log(`[Cloudflare Pages] API Request: ${method} ${endpoint}`);
  const response = await fetch(url, options);
  const result = await response.json();

  if (!result.success && result.errors) {
    console.error(`[Cloudflare Pages] API Error:`, JSON.stringify(result.errors, null, 2));
  }

  return result;
}

// Create a new Pages project if it doesn't exist
export async function createPagesProject(projectName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getCloudflareConfig();
    if (!config) {
      return { success: false, error: "Cloudflare not configured" };
    }

    // Sanitize project name (lowercase, alphanumeric and hyphens only)
    const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    // Check if project already exists
    const existingProject = await cfRequest(
      `/accounts/${config.accountId}/pages/projects/${sanitizedName}`,
      "GET",
      config
    );

    if (existingProject.success) {
      console.log(`[Cloudflare Pages] Project ${sanitizedName} already exists`);
      return { success: true };
    }

    // Create new project
    const createResult = await cfRequest(
      `/accounts/${config.accountId}/pages/projects`,
      "POST",
      config,
      {
        name: sanitizedName,
        production_branch: "main",
      }
    );

    if (createResult.success) {
      console.log(`✓ [Cloudflare Pages] Created project: ${sanitizedName}`);
      return { success: true };
    } else {
      const errorMsg = createResult.errors?.[0]?.message || "Unknown error";
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Cloudflare Pages] Create project error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

// Deploy HTML content to Cloudflare Pages using Wrangler CLI
export async function deployToPages(
  projectName: string,
  files: { path: string; content: string }[]
): Promise<DeploymentResult> {
  
  try {
    const config = getCloudflareConfig();
    if (!config) {
      return { success: false, error: "Cloudflare not configured" };
    }

    // Sanitize project name
    const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    // Create temp directory for files
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-pages-'));
    console.log(`[Cloudflare Pages] Created temp directory: ${tempDir}`);

    // Write files to temp directory
    for (const file of files) {
      const filePath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
      const fullPath = path.join(tempDir, filePath);
      
      // Create parent directories if needed
      const parentDir = path.dirname(fullPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, file.content, 'utf8');
      console.log(`[Cloudflare Pages] Wrote file: ${filePath}`);
    }

    // Deploy using wrangler
    const cmd = `npx wrangler pages deploy "${tempDir}" --project-name="${sanitizedName}" --commit-dirty=true`;
    console.log(`[Cloudflare Pages] Running: ${cmd}`);

    const output = execSync(cmd, {
      env: {
        ...process.env,
        CLOUDFLARE_API_TOKEN: config.apiToken,
        CLOUDFLARE_ACCOUNT_ID: config.accountId,
      },
      encoding: 'utf8',
      timeout: 60000,
    });

    console.log(`[Cloudflare Pages] Wrangler output:`, output);

    // Parse URL from output
    const urlMatch = output.match(/https:\/\/[^\s]+\.pages\.dev/);
    const deployUrl = urlMatch ? urlMatch[0] : `https://${sanitizedName}.pages.dev`;

    // Cleanup temp directory
    try {
      fs.rmSync(tempDir, { recursive: true });
    } catch (e) {
      console.log(`[Cloudflare Pages] Cleanup warning:`, e);
    }

    console.log(`✓ [Cloudflare Pages] Deployed to: ${deployUrl}`);
    return {
      success: true,
      url: deployUrl,
    };
  } catch (error: any) {
    const errorMsg = error.stderr || error.message || String(error);
    console.error("[Cloudflare Pages] Deploy error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

// Get project info including latest deployment
export async function getProjectInfo(projectName: string): Promise<ProjectInfo | null> {
  try {
    const config = getCloudflareConfig();
    if (!config) return null;

    const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const result = await cfRequest(
      `/accounts/${config.accountId}/pages/projects/${sanitizedName}`,
      "GET",
      config
    );

    if (result.success && result.result) {
      const project = result.result;
      return {
        name: project.name,
        subdomain: `${project.name}.pages.dev`,
        domains: project.domains || [],
        latestDeployment: project.latest_deployment ? {
          id: project.latest_deployment.id,
          url: project.latest_deployment.url,
          createdOn: project.latest_deployment.created_on,
        } : undefined,
      };
    }

    return null;
  } catch (error) {
    console.error("[Cloudflare Pages] Get project info error:", error);
    return null;
  }
}

// List all Pages projects
export async function listPagesProjects(): Promise<ProjectInfo[]> {
  try {
    const config = getCloudflareConfig();
    if (!config) return [];

    const result = await cfRequest(
      `/accounts/${config.accountId}/pages/projects`,
      "GET",
      config
    );

    if (result.success && result.result) {
      return result.result.map((project: any) => ({
        name: project.name,
        subdomain: `${project.name}.pages.dev`,
        domains: project.domains || [],
        latestDeployment: project.latest_deployment ? {
          id: project.latest_deployment.id,
          url: project.latest_deployment.url,
          createdOn: project.latest_deployment.created_on,
        } : undefined,
      }));
    }

    return [];
  } catch (error) {
    console.error("[Cloudflare Pages] List projects error:", error);
    return [];
  }
}

// Delete a Pages project
export async function deletePagesProject(projectName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getCloudflareConfig();
    if (!config) {
      return { success: false, error: "Cloudflare not configured" };
    }

    const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const result = await cfRequest(
      `/accounts/${config.accountId}/pages/projects/${sanitizedName}`,
      "DELETE",
      config
    );

    if (result.success) {
      console.log(`✓ [Cloudflare Pages] Deleted project: ${sanitizedName}`);
      return { success: true };
    } else {
      const errorMsg = result.errors?.[0]?.message || "Delete failed";
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Cloudflare Pages] Delete project error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

// Helper to get content type based on file extension
function getContentType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'txt': 'text/plain',
  };
  return types[ext || ''] || 'application/octet-stream';
}

// Simple hash generator for file content
async function generateHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

// Custom Domain Management

interface CustomDomainResult {
  success: boolean;
  domain?: string;
  status?: string;
  error?: string;
}

// Add a custom domain to a Pages project
export async function addCustomDomain(
  projectName: string,
  domain: string
): Promise<CustomDomainResult> {
  try {
    const config = getCloudflareConfig();
    if (!config) {
      return { success: false, error: "Cloudflare not configured" };
    }

    const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const result = await cfRequest(
      `/accounts/${config.accountId}/pages/projects/${sanitizedName}/domains`,
      "POST",
      config,
      { name: domain }
    );

    if (result.success && result.result) {
      console.log(`✓ [Cloudflare Pages] Added custom domain: ${domain} to ${sanitizedName}`);
      return {
        success: true,
        domain: result.result.name,
        status: result.result.status,
      };
    } else {
      const errorMsg = result.errors?.[0]?.message || "Failed to add domain";
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Cloudflare Pages] Add custom domain error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

// Remove a custom domain from a Pages project
export async function removeCustomDomain(
  projectName: string,
  domain: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getCloudflareConfig();
    if (!config) {
      return { success: false, error: "Cloudflare not configured" };
    }

    const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const result = await cfRequest(
      `/accounts/${config.accountId}/pages/projects/${sanitizedName}/domains/${domain}`,
      "DELETE",
      config
    );

    if (result.success) {
      console.log(`✓ [Cloudflare Pages] Removed custom domain: ${domain} from ${sanitizedName}`);
      return { success: true };
    } else {
      const errorMsg = result.errors?.[0]?.message || "Failed to remove domain";
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Cloudflare Pages] Remove custom domain error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

// Get custom domains for a Pages project
export async function getCustomDomains(projectName: string): Promise<{ name: string; status: string }[]> {
  try {
    const config = getCloudflareConfig();
    if (!config) return [];

    const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const result = await cfRequest(
      `/accounts/${config.accountId}/pages/projects/${sanitizedName}/domains`,
      "GET",
      config
    );

    if (result.success && result.result) {
      return result.result.map((d: any) => ({
        name: d.name,
        status: d.status || 'pending',
      }));
    }

    return [];
  } catch (error) {
    console.error("[Cloudflare Pages] Get custom domains error:", error);
    return [];
  }
}
