// Cloudflare DNS API Integration for Subdomain Registration
// No IP whitelisting required - works with dynamic IPs like Replit

interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
}

interface SubdomainResult {
  success: boolean;
  subdomain?: string;
  error?: string;
}

interface CloudflareDnsRecord {
  id: string;
  name: string;
  type: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

function getCloudflareConfig(): CloudflareConfig | null {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (!apiToken || !zoneId) {
    console.log("[Cloudflare] Not configured - missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID");
    return null;
  }

  return { apiToken, zoneId };
}

async function cloudflareRequest(
  endpoint: string,
  method: string,
  config: CloudflareConfig,
  body?: any
): Promise<any> {
  const url = `https://api.cloudflare.com/client/v4${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      "Authorization": `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`[Cloudflare] API Request: ${method} ${endpoint}`);
  const response = await fetch(url, options);
  const result = await response.json();
  
  // Log authentication errors for debugging
  if (!result.success && result.errors) {
    console.error(`[Cloudflare] API Error:`, JSON.stringify(result.errors, null, 2));
  }
  
  return result;
}

export async function createSubdomain(subdomain: string, forwardUrl: string): Promise<SubdomainResult> {
  try {
    const config = getCloudflareConfig();
    
    if (!config) {
      console.log(`✓ [Subdomain] Created (dev mode, no Cloudflare): ${subdomain}.rentapog.com → ${forwardUrl}`);
      return { success: true, subdomain: `${subdomain}.rentapog.com` };
    }

    const fullDomain = `${subdomain}.rentapog.com`;
    console.log(`[Cloudflare] Creating subdomain: ${fullDomain} → ${forwardUrl}`);

    // First check if record already exists
    const existingRecords = await cloudflareRequest(
      `/zones/${config.zoneId}/dns_records?name=${fullDomain}`,
      "GET",
      config
    );

    if (existingRecords.result && existingRecords.result.length > 0) {
      // Record exists - update it
      const recordId = existingRecords.result[0].id;
      const updateResult = await cloudflareRequest(
        `/zones/${config.zoneId}/dns_records/${recordId}`,
        "PATCH",
        config,
        {
          type: "CNAME",
          name: subdomain,
          content: "rentapog.com",
          ttl: 1,
          proxied: true,
        }
      );

      if (updateResult.success) {
        console.log(`✓ [Cloudflare] Updated existing record: ${fullDomain}`);
        
        // Create redirect rule for URL forwarding
        await createRedirectRule(subdomain, forwardUrl, config);
        
        return { success: true, subdomain: fullDomain };
      } else {
        const errorMsg = updateResult.errors?.[0]?.message || "Unknown error";
        console.error(`✗ [Cloudflare] Failed to update: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    }

    // Create new CNAME record pointing to the main domain
    const createResult = await cloudflareRequest(
      `/zones/${config.zoneId}/dns_records`,
      "POST",
      config,
      {
        type: "CNAME",
        name: subdomain,
        content: "rentapog.com",
        ttl: 1,
        proxied: true,
      }
    );

    if (createResult.success) {
      console.log(`✓ [Cloudflare] Created DNS record: ${fullDomain}`);
      
      // Create redirect rule for URL forwarding
      await createRedirectRule(subdomain, forwardUrl, config);
      
      return { success: true, subdomain: fullDomain };
    } else {
      const errorMsg = createResult.errors?.[0]?.message || "Unknown error";
      console.error(`✗ [Cloudflare] Failed to create: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Cloudflare] API error:", errorMsg);
    return { success: false, error: `Cloudflare API Error: ${errorMsg}` };
  }
}

async function createRedirectRule(subdomain: string, targetUrl: string, config: CloudflareConfig): Promise<void> {
  try {
    // Use Cloudflare Bulk Redirects or Page Rules for URL forwarding
    // For simplicity, we'll use Transform Rules (URL Rewrite)
    // The redirect will be handled at the application level since Cloudflare free tier
    // has limited redirect rules
    
    console.log(`[Cloudflare] Redirect configured: ${subdomain}.rentapog.com → ${targetUrl}`);
    // Note: Actual redirect handling is done in the Express app
  } catch (error) {
    console.error("[Cloudflare] Failed to create redirect rule:", error);
  }
}

export async function setupDomainForwarding(subdomain: string, targetUrl: string): Promise<SubdomainResult> {
  // For Cloudflare, forwarding is handled the same way as creating
  return createSubdomain(subdomain, targetUrl);
}

export async function getExistingSubdomains(): Promise<string[]> {
  try {
    const config = getCloudflareConfig();
    
    if (!config) {
      return [];
    }

    const result = await cloudflareRequest(
      `/zones/${config.zoneId}/dns_records?type=CNAME&per_page=100`,
      "GET",
      config
    );

    if (result.success && result.result) {
      return result.result
        .filter((r: CloudflareDnsRecord) => r.name.endsWith(".rentapog.com"))
        .map((r: CloudflareDnsRecord) => r.name.replace(".rentapog.com", "").toLowerCase());
    }

    return [];
  } catch (error) {
    console.error("[Cloudflare] Error getting subdomains:", error);
    return [];
  }
}

export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  const existingSubdomains = await getExistingSubdomains();
  return !existingSubdomains.includes(subdomain.toLowerCase());
}

export async function fixSubdomainProxy(subdomain: string): Promise<SubdomainResult> {
  try {
    const config = getCloudflareConfig();
    
    if (!config) {
      return { success: false, error: "Cloudflare not configured" };
    }

    const fullDomain = `${subdomain}.rentapog.com`;
    console.log(`[Cloudflare] Fixing proxy settings for: ${fullDomain}`);
    
    // Find the record
    const existingRecords = await cloudflareRequest(
      `/zones/${config.zoneId}/dns_records?name=${fullDomain}`,
      "GET",
      config
    );

    if (!existingRecords.result || existingRecords.result.length === 0) {
      return { success: false, error: `No DNS record found for ${fullDomain}` };
    }

    // Find A or CNAME record - only these types support proxying
    const proxyableRecord = existingRecords.result.find(
      (r: CloudflareDnsRecord) => r.type === 'A' || r.type === 'CNAME'
    );
    
    if (!proxyableRecord) {
      const types = existingRecords.result.map((r: CloudflareDnsRecord) => r.type).join(', ');
      return { success: false, error: `No proxyable record (A/CNAME) found. Found: ${types}` };
    }

    const record = proxyableRecord;
    console.log(`[Cloudflare] Current record: type=${record.type}, content=${record.content}, proxied=${record.proxied}`);
    
    // Already proxied? Skip
    if (record.proxied) {
      console.log(`[Cloudflare] ${fullDomain} already has proxy enabled`);
      return { success: true, subdomain: fullDomain };
    }
    
    // Only update the proxied flag - preserve existing type, name, content
    const recordId = record.id;
    const updateResult = await cloudflareRequest(
      `/zones/${config.zoneId}/dns_records/${recordId}`,
      "PATCH",
      config,
      {
        proxied: true,
      }
    );

    if (updateResult.success) {
      console.log(`✓ [Cloudflare] Fixed proxy for ${fullDomain} (proxied: true)`);
      return { success: true, subdomain: fullDomain };
    } else {
      const errorMsg = updateResult.errors?.[0]?.message || "Unknown error";
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Cloudflare] Fix proxy error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function getAllDnsRecords(): Promise<CloudflareDnsRecord[]> {
  try {
    const config = getCloudflareConfig();
    
    if (!config) {
      return [];
    }

    const result = await cloudflareRequest(
      `/zones/${config.zoneId}/dns_records?per_page=100`,
      "GET",
      config
    );

    if (result.success && result.result) {
      return result.result;
    }

    return [];
  } catch (error) {
    console.error("[Cloudflare] Error getting DNS records:", error);
    return [];
  }
}

export async function deleteSubdomain(subdomain: string): Promise<SubdomainResult> {
  try {
    const config = getCloudflareConfig();
    
    if (!config) {
      return { success: true };
    }

    const fullDomain = `${subdomain}.rentapog.com`;
    
    // Find the record
    const existingRecords = await cloudflareRequest(
      `/zones/${config.zoneId}/dns_records?name=${fullDomain}`,
      "GET",
      config
    );

    if (!existingRecords.result || existingRecords.result.length === 0) {
      return { success: true }; // Already doesn't exist
    }

    // Delete the record
    const recordId = existingRecords.result[0].id;
    const deleteResult = await cloudflareRequest(
      `/zones/${config.zoneId}/dns_records/${recordId}`,
      "DELETE",
      config
    );

    if (deleteResult.success) {
      console.log(`✓ [Cloudflare] Deleted: ${fullDomain}`);
      return { success: true };
    } else {
      const errorMsg = deleteResult.errors?.[0]?.message || "Unknown error";
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Cloudflare] Delete error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}
