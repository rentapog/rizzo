// Namecheap API Integration for Subdomain Registration

interface NamecheapConfig {
  apiKey: string;
  apiUser: string;
  username: string;
  clientIp: string;
}

interface SubdomainResult {
  success: boolean;
  subdomain?: string;
  error?: string;
}

function getNamecheapConfig(): NamecheapConfig | null {
  const apiKey = process.env.NAMECHEAP_API_KEY;
  const apiUser = process.env.NAMECHEAP_API_USERNAME || process.env.NAMECHEAP_USERNAME;
  const username = process.env.NAMECHEAP_USERNAME;

  if (!apiKey || !apiUser || !username) {
    console.log("[Namecheap] Not configured - missing credentials. Using dev mode fallback.");
    return null;
  }

  // Use the environment variable for client IP (Replit's outbound IP)
  // IMPORTANT: Make sure this IP is whitelisted in your Namecheap account settings!
  // For Replit, this should be: 136.118.61.51 (but verify in your account)
  // You can update this with: NAMECHEAP_CLIENT_IP environment variable
  const clientIp = process.env.NAMECHEAP_CLIENT_IP || "136.118.61.51";
  
  console.log(`[Namecheap] Configured with ClientIp: ${clientIp}`);

  return {
    apiKey,
    apiUser,
    username,
    clientIp,
  };
}

function extractErrorFromXml(xml: string): string | null {
  // Look for error messages in Namecheap XML response
  const errorMatch = xml.match(/<Error[^>]*>([^<]+)<\/Error>/i);
  if (errorMatch) return errorMatch[1];
  
  const statusMatch = xml.match(/Status="([^"]+)"/);
  if (statusMatch && statusMatch[1] !== "OK") return `API Status: ${statusMatch[1]}`;
  
  // Check for ApiResponse status
  if (xml.includes('ApiResponse') && !xml.includes('Status="OK"')) {
    const firstLine = xml.substring(0, 500);
    if (firstLine.includes('Status="ERROR"')) {
      return "Namecheap API returned an error";
    }
  }
  
  return null;
}

export async function createSubdomain(subdomain: string, forwardUrl: string): Promise<SubdomainResult> {
  try {
    const config = getNamecheapConfig();
    
    // If Namecheap is not configured, just return success (for development)
    if (!config) {
      console.log(`✓ [Subdomain] Subdomain created (dev mode, no Namecheap): ${subdomain}.rentapog.com → ${forwardUrl}`);
      return { success: true, subdomain: `${subdomain}.rentapog.com` };
    }

    const domain = "rentapog.com";
    const sld = "rentapog";
    const tld = "com";

    const baseUrl = "https://api.namecheap.com/xml.response";
    
    console.log(`[Namecheap] Creating subdomain ${subdomain} with ClientIp: ${config.clientIp}`);
    
    const params = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.dns.getHosts",
      ClientIp: config.clientIp,
      SLD: sld,
      TLD: tld,
    });

    const getResponse = await fetch(`${baseUrl}?${params.toString()}`);
    const getXml = await getResponse.text();
    
    const getError = extractErrorFromXml(getXml);
    if (getError) {
      console.error(`[Namecheap] Error fetching existing records:`, getError);
      return { success: false, error: getError };
    }
    
    const existingRecords = parseHostRecords(getXml);
    console.log(`[Namecheap] Found ${existingRecords.length} existing records`);
    
    existingRecords.push({
      HostName: subdomain,
      RecordType: "URL",
      Address: forwardUrl,
      TTL: "1800",
    });

    const setParams = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.dns.setHosts",
      ClientIp: config.clientIp,
      SLD: sld,
      TLD: tld,
    });

    existingRecords.forEach((record, index) => {
      const i = index + 1;
      setParams.append(`HostName${i}`, record.HostName);
      setParams.append(`RecordType${i}`, record.RecordType);
      setParams.append(`Address${i}`, record.Address);
      setParams.append(`TTL${i}`, record.TTL);
    });

    const setResponse = await fetch(`${baseUrl}?${setParams.toString()}`);
    const setXml = await setResponse.text();

    console.log(`[Namecheap] Full response for ${subdomain}:`, setXml);

    const setError = extractErrorFromXml(setXml);
    if (setError) {
      console.error(`✗ [Namecheap] Failed to create subdomain - ${setError}`);
      return { success: false, error: `Namecheap API Error: ${setError}` };
    }

    console.log(`[Namecheap] Checking response for success indicators...`);
    console.log(`[Namecheap] Response includes Status="OK": ${setXml.includes('Status="OK"')}`);
    console.log(`[Namecheap] Response includes IsSuccess="true": ${setXml.includes('IsSuccess="true"')}`);
    
    if (setXml.includes('Status="OK"') || setXml.includes('IsSuccess="true"')) {
      console.log(`✓ [Namecheap] Subdomain created: ${subdomain}.rentapog.com → ${forwardUrl}`);
      return { success: true, subdomain: `${subdomain}.rentapog.com` };
    } else {
      console.error(`✗ [Namecheap] Failed to create subdomain - unexpected response:`, setXml);
      return { success: false, error: `Namecheap API Response: ${setXml.substring(0, 500)}` };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Namecheap] API error:", errorMsg, error);
    return { success: false, error: `Namecheap API Error: ${errorMsg}` };
  }
}

export async function setupDomainForwarding(subdomain: string, targetUrl: string): Promise<SubdomainResult> {
  try {
    const config = getNamecheapConfig();
    
    // If Namecheap is not configured, just return success (for development)
    if (!config) {
      console.log(`✓ [Domain Forwarding] Updated (dev mode, no Namecheap): ${subdomain}.rentapog.com → ${targetUrl}`);
      return { success: true, subdomain: `${subdomain}.rentapog.com` };
    }

    const sld = "rentapog";
    const tld = "com";
    const baseUrl = "https://api.namecheap.com/xml.response";

    const params = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.dns.getHosts",
      ClientIp: config.clientIp,
      SLD: sld,
      TLD: tld,
    });

    const getResponse = await fetch(`${baseUrl}?${params.toString()}`);
    const getXml = await getResponse.text();
    
    const getError = extractErrorFromXml(getXml);
    if (getError) {
      console.error(`[Namecheap] Error fetching existing records:`, getError);
      return { success: false, error: getError };
    }
    
    const existingRecords = parseHostRecords(getXml);
    
    const recordIndex = existingRecords.findIndex(r => r.HostName.toLowerCase() === subdomain.toLowerCase());
    
    if (recordIndex !== -1) {
      existingRecords[recordIndex].Address = targetUrl;
    } else {
      existingRecords.push({
        HostName: subdomain,
        RecordType: "URL",
        Address: targetUrl,
        TTL: "1800",
      });
    }

    const setParams = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.dns.setHosts",
      ClientIp: config.clientIp,
      SLD: sld,
      TLD: tld,
    });

    existingRecords.forEach((record, index) => {
      const i = index + 1;
      setParams.append(`HostName${i}`, record.HostName);
      setParams.append(`RecordType${i}`, record.RecordType);
      setParams.append(`Address${i}`, record.Address);
      setParams.append(`TTL${i}`, record.TTL);
    });

    const setResponse = await fetch(`${baseUrl}?${setParams.toString()}`);
    const setXml = await setResponse.text();

    console.log(`[Namecheap] Full response for updating ${subdomain}:`, setXml);

    const setError = extractErrorFromXml(setXml);
    if (setError) {
      console.error(`✗ [Namecheap] Failed to update forwarding - ${setError}`);
      return { success: false, error: `Namecheap API Error: ${setError}` };
    }

    if (setXml.includes('Status="OK"') || setXml.includes('IsSuccess="true"')) {
      console.log(`✓ [Namecheap] Forwarding updated: ${subdomain}.rentapog.com → ${targetUrl}`);
      return { success: true, subdomain: `${subdomain}.rentapog.com` };
    } else {
      console.error(`✗ [Namecheap] Failed to update forwarding - unexpected response`);
      return { success: false, error: "Failed to update domain forwarding" };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Namecheap] Forwarding error:", errorMsg, error);
    return { success: false, error: `Namecheap Forwarding Error: ${errorMsg}` };
  }
}

interface HostRecord {
  HostName: string;
  RecordType: string;
  Address: string;
  TTL: string;
}

function parseHostRecords(xml: string): HostRecord[] {
  const records: HostRecord[] = [];
  
  const hostRegex = /<host\s+([^>]+)\/>/gi;
  let match;
  
  while ((match = hostRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const record: HostRecord = {
      HostName: extractAttr(attrs, "Name") || extractAttr(attrs, "HostName") || "@",
      RecordType: extractAttr(attrs, "Type") || extractAttr(attrs, "RecordType") || "A",
      Address: extractAttr(attrs, "Address") || "",
      TTL: extractAttr(attrs, "TTL") || "1800",
    };
    
    if (record.Address) {
      records.push(record);
    }
  }
  
  return records;
}

function extractAttr(attrs: string, name: string): string {
  const match = attrs.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return match ? match[1] : "";
}

export async function getExistingSubdomains(): Promise<string[]> {
  try {
    const config = getNamecheapConfig();
    
    // If Namecheap is not configured, return empty list (for development)
    if (!config) {
      return [];
    }

    const baseUrl = "https://api.namecheap.com/xml.response";
    
    const params = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.dns.getHosts",
      ClientIp: config.clientIp,
      SLD: "rentapog",
      TLD: "com",
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const xml = await response.text();
    
    const records = parseHostRecords(xml);
    return records
      .filter(r => r.RecordType === "URL" || r.RecordType === "CNAME")
      .map(r => r.HostName.toLowerCase());
  } catch (error) {
    console.error("[Namecheap] Error getting subdomains:", error);
    return [];
  }
}

export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  const existingSubdomains = await getExistingSubdomains();
  return !existingSubdomains.includes(subdomain.toLowerCase());
}

// Domain registration functions for custom branding domains

interface DomainAvailabilityResult {
  available: boolean;
  domain: string;
  price?: number; // Price in cents
  error?: string;
}

interface DomainRegistrationResult {
  success: boolean;
  domain?: string;
  error?: string;
}

export async function checkDomainAvailability(domain: string): Promise<DomainAvailabilityResult> {
  try {
    const config = getNamecheapConfig();
    
    if (!config) {
      console.log(`[Namecheap] Dev mode - domain availability check for: ${domain}`);
      // In dev mode, simulate availability for testing
      return { available: true, domain, price: 1299 }; // $12.99
    }

    const baseUrl = "https://api.namecheap.com/xml.response";
    
    const params = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.check",
      ClientIp: config.clientIp,
      DomainList: domain,
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const xml = await response.text();
    
    console.log(`[Namecheap] Domain check response for ${domain}:`, xml.substring(0, 500));
    
    const error = extractErrorFromXml(xml);
    if (error) {
      console.error(`[Namecheap] Domain check error:`, error);
      return { available: false, domain, error };
    }

    // Parse the availability response
    const availableMatch = xml.match(/Available="(true|false)"/i);
    const isAvailable = availableMatch ? availableMatch[1].toLowerCase() === "true" : false;
    
    // Try to get price (premium domains may have different pricing)
    const priceMatch = xml.match(/PremiumRegistrationPrice="([^"]+)"/i);
    const regularPrice = 1299; // Default $12.99 for .com
    const price = priceMatch ? Math.round(parseFloat(priceMatch[1]) * 100) : regularPrice;

    return { available: isAvailable, domain, price };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Namecheap] Domain check error:", errorMsg);
    return { available: false, domain, error: errorMsg };
  }
}

export async function registerDomain(domain: string, contactInfo: {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}): Promise<DomainRegistrationResult> {
  try {
    const config = getNamecheapConfig();
    
    if (!config) {
      console.log(`[Namecheap] Dev mode - simulating domain registration for: ${domain}`);
      return { success: true, domain };
    }

    const baseUrl = "https://api.namecheap.com/xml.response";
    
    // Extract SLD and TLD from domain
    const parts = domain.split(".");
    const tld = parts.pop() || "com";
    const sld = parts.join(".");

    const params = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.create",
      ClientIp: config.clientIp,
      DomainName: domain,
      Years: "1",
      // Registrant contact
      RegistrantFirstName: contactInfo.firstName,
      RegistrantLastName: contactInfo.lastName,
      RegistrantAddress1: contactInfo.address,
      RegistrantCity: contactInfo.city,
      RegistrantStateProvince: contactInfo.state,
      RegistrantPostalCode: contactInfo.zip,
      RegistrantCountry: contactInfo.country,
      RegistrantPhone: contactInfo.phone,
      RegistrantEmailAddress: contactInfo.email,
      // Tech contact (same as registrant)
      TechFirstName: contactInfo.firstName,
      TechLastName: contactInfo.lastName,
      TechAddress1: contactInfo.address,
      TechCity: contactInfo.city,
      TechStateProvince: contactInfo.state,
      TechPostalCode: contactInfo.zip,
      TechCountry: contactInfo.country,
      TechPhone: contactInfo.phone,
      TechEmailAddress: contactInfo.email,
      // Admin contact (same as registrant)
      AdminFirstName: contactInfo.firstName,
      AdminLastName: contactInfo.lastName,
      AdminAddress1: contactInfo.address,
      AdminCity: contactInfo.city,
      AdminStateProvince: contactInfo.state,
      AdminPostalCode: contactInfo.zip,
      AdminCountry: contactInfo.country,
      AdminPhone: contactInfo.phone,
      AdminEmailAddress: contactInfo.email,
      // Billing contact (same as registrant)
      AuxBillingFirstName: contactInfo.firstName,
      AuxBillingLastName: contactInfo.lastName,
      AuxBillingAddress1: contactInfo.address,
      AuxBillingCity: contactInfo.city,
      AuxBillingStateProvince: contactInfo.state,
      AuxBillingPostalCode: contactInfo.zip,
      AuxBillingCountry: contactInfo.country,
      AuxBillingPhone: contactInfo.phone,
      AuxBillingEmailAddress: contactInfo.email,
    });

    console.log(`[Namecheap] Registering domain: ${domain}`);
    
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const xml = await response.text();
    
    console.log(`[Namecheap] Registration response:`, xml.substring(0, 1000));
    
    const error = extractErrorFromXml(xml);
    if (error) {
      console.error(`[Namecheap] Domain registration error:`, error);
      return { success: false, error };
    }

    if (xml.includes('Status="OK"') && xml.includes('Registered="true"')) {
      console.log(`✓ [Namecheap] Domain registered successfully: ${domain}`);
      return { success: true, domain };
    } else {
      console.error(`[Namecheap] Unexpected registration response`);
      return { success: false, error: "Unexpected response from registrar" };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Namecheap] Registration error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function setupCustomDomainDNS(domain: string, targetIp: string): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getNamecheapConfig();
    
    if (!config) {
      console.log(`[Namecheap] Dev mode - simulating DNS setup for: ${domain}`);
      return { success: true };
    }

    const parts = domain.split(".");
    const tld = parts.pop() || "com";
    const sld = parts.join(".");

    const baseUrl = "https://api.namecheap.com/xml.response";
    
    // Set the nameservers to Namecheap's default DNS
    const nsParams = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.dns.setDefault",
      ClientIp: config.clientIp,
      SLD: sld,
      TLD: tld,
    });

    const nsResponse = await fetch(`${baseUrl}?${nsParams.toString()}`);
    const nsXml = await nsResponse.text();
    
    console.log(`[Namecheap] Set default DNS for ${domain}:`, nsXml.substring(0, 500));

    // Now set up A record pointing to our server
    const hostParams = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.dns.setHosts",
      ClientIp: config.clientIp,
      SLD: sld,
      TLD: tld,
      // Root domain A record
      HostName1: "@",
      RecordType1: "A",
      Address1: targetIp,
      TTL1: "1800",
      // WWW subdomain A record
      HostName2: "www",
      RecordType2: "A",
      Address2: targetIp,
      TTL2: "1800",
    });

    const hostResponse = await fetch(`${baseUrl}?${hostParams.toString()}`);
    const hostXml = await hostResponse.text();
    
    console.log(`[Namecheap] Set DNS hosts for ${domain}:`, hostXml.substring(0, 500));
    
    const error = extractErrorFromXml(hostXml);
    if (error) {
      console.error(`[Namecheap] DNS setup error:`, error);
      return { success: false, error };
    }

    if (hostXml.includes('Status="OK"') || hostXml.includes('IsSuccess="true"')) {
      console.log(`✓ [Namecheap] DNS configured for ${domain} -> ${targetIp}`);
      return { success: true };
    } else {
      return { success: false, error: "Failed to configure DNS" };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Namecheap] DNS setup error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

// Get DNS records for a domain
export async function getDomainDNS(domain: string): Promise<{ success: boolean; records?: any[]; error?: string }> {
  try {
    const config = getNamecheapConfig();
    if (!config) {
      return { success: false, error: "Namecheap not configured" };
    }

    const parts = domain.toLowerCase().split(".");
    const tld = parts.pop() || "";
    const sld = parts.join(".");

    const baseUrl = "https://api.namecheap.com/xml.response";
    const params = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.dns.getHosts",
      ClientIp: config.clientIp,
      SLD: sld,
      TLD: tld,
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const xml = await response.text();

    const error = extractErrorFromXml(xml);
    if (error) {
      return { success: false, error };
    }

    // Parse DNS records from XML
    const records: any[] = [];
    const hostRegex = /<host\s+([^>]+)\/>/gi;
    let match;
    while ((match = hostRegex.exec(xml)) !== null) {
      const attrs = match[1];
      const record: any = {};
      const attrRegex = /(\w+)="([^"]+)"/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attrs)) !== null) {
        record[attrMatch[1].toLowerCase()] = attrMatch[2];
      }
      if (record.name || record.hostname) {
        records.push({
          hostname: record.name || record.hostname,
          type: record.type,
          address: record.address,
          ttl: record.ttl || "1800",
        });
      }
    }

    return { success: true, records };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMsg };
  }
}

// Set DNS records for a domain
export async function setDomainDNS(domain: string, records: { hostname: string; type: string; address: string; ttl?: string }[]): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getNamecheapConfig();
    if (!config) {
      return { success: false, error: "Namecheap not configured" };
    }

    const parts = domain.toLowerCase().split(".");
    const tld = parts.pop() || "";
    const sld = parts.join(".");

    const baseUrl = "https://api.namecheap.com/xml.response";
    const params = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.dns.setHosts",
      ClientIp: config.clientIp,
      SLD: sld,
      TLD: tld,
    });

    // Add each record
    records.forEach((record, index) => {
      const i = index + 1;
      params.append(`HostName${i}`, record.hostname);
      params.append(`RecordType${i}`, record.type);
      params.append(`Address${i}`, record.address);
      params.append(`TTL${i}`, record.ttl || "1800");
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const xml = await response.text();

    const error = extractErrorFromXml(xml);
    if (error) {
      return { success: false, error };
    }

    if (xml.includes('Status="OK"') || xml.includes('IsSuccess="true"')) {
      console.log(`✓ [Namecheap] DNS updated for ${domain}`);
      return { success: true };
    } else {
      return { success: false, error: "Failed to update DNS" };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMsg };
  }
}

// Get nameservers for a domain
export async function getDomainNameservers(domain: string): Promise<{ success: boolean; nameservers?: string[]; isDefault?: boolean; error?: string }> {
  try {
    const config = getNamecheapConfig();
    if (!config) {
      return { success: false, error: "Namecheap not configured" };
    }

    const parts = domain.toLowerCase().split(".");
    const tld = parts.pop() || "";
    const sld = parts.join(".");

    const baseUrl = "https://api.namecheap.com/xml.response";
    const params = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.dns.getList",
      ClientIp: config.clientIp,
      SLD: sld,
      TLD: tld,
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const xml = await response.text();

    const error = extractErrorFromXml(xml);
    if (error) {
      return { success: false, error };
    }

    // Parse nameservers from XML
    const nameservers: string[] = [];
    const nsRegex = /<Nameserver>([^<]+)<\/Nameserver>/gi;
    let match;
    while ((match = nsRegex.exec(xml)) !== null) {
      nameservers.push(match[1]);
    }

    // Check if using default DNS
    const isDefault = xml.includes('IsUsingOurDNS="true"');

    return { success: true, nameservers, isDefault };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMsg };
  }
}

// Set nameservers for a domain
export async function configureDomainDNS(domain: string, pagesUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getNamecheapConfig();
    if (!config) {
      console.log(`✓ [DNS] Dev mode - simulating DNS config for ${domain} -> ${pagesUrl}`);
      return { success: true };
    }

    const parts = domain.toLowerCase().split(".");
    const tld = parts.pop() || "com";
    const sld = parts.join(".");

    const baseUrl = "https://api.namecheap.com/xml.response";

    console.log(`[DNS] Configuring ${domain} (SLD: ${sld}, TLD: ${tld}) to point to ${pagesUrl}`);

    // First, get existing DNS records
    const getParams = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.dns.getHosts",
      ClientIp: config.clientIp,
      SLD: sld,
      TLD: tld,
    });

    const getResponse = await fetch(`${baseUrl}?${getParams.toString()}`);
    const getXml = await getResponse.text();

    const getError = extractErrorFromXml(getXml);
    if (getError) {
      console.error(`[DNS] Error fetching existing records for ${domain}:`, getError);
      return { success: false, error: getError };
    }

    // Parse existing records and filter out old @ and www records (CNAME, URL, URL301)
    const existingRecords = parseHostRecords(getXml);
    const filteredRecords = existingRecords.filter(r => 
      !((r.HostName === "@" || r.HostName === "www") && 
        (r.RecordType === "CNAME" || r.RecordType === "URL" || r.RecordType === "URL301"))
    );

    console.log(`[DNS] Found ${existingRecords.length} existing records, keeping ${filteredRecords.length} after filtering`);

    // For apex (@), use URL301 redirect to www (CNAME doesn't work at apex)
    // For www, use CNAME to point to Cloudflare Pages
    filteredRecords.push({
      HostName: "@",
      RecordType: "URL301",
      Address: `https://www.${domain}/`,
      TTL: "1800",
    });
    filteredRecords.push({
      HostName: "www",
      RecordType: "CNAME",
      Address: pagesUrl,
      TTL: "1800",
    });

    // Set all DNS records
    const setParams = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.dns.setHosts",
      ClientIp: config.clientIp,
      SLD: sld,
      TLD: tld,
    });

    filteredRecords.forEach((record, index) => {
      const i = index + 1;
      setParams.append(`HostName${i}`, record.HostName);
      setParams.append(`RecordType${i}`, record.RecordType);
      setParams.append(`Address${i}`, record.Address);
      setParams.append(`TTL${i}`, record.TTL);
    });

    const setResponse = await fetch(`${baseUrl}?${setParams.toString()}`);
    const setXml = await setResponse.text();

    console.log(`[DNS] Set DNS response for ${domain}:`, setXml.substring(0, 500));

    const setError = extractErrorFromXml(setXml);
    if (setError) {
      console.error(`✗ [DNS] Failed to configure DNS for ${domain}:`, setError);
      return { success: false, error: setError };
    }

    if (setXml.includes('Status="OK"') || setXml.includes('IsSuccess="true"')) {
      console.log(`✓ [DNS] Configured ${domain} -> ${pagesUrl} (CNAME for @ and www)`);
      return { success: true };
    } else {
      console.error(`✗ [DNS] Unexpected response for ${domain}:`, setXml.substring(0, 300));
      return { success: false, error: "Failed to configure DNS" };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[DNS] Error configuring ${domain}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function setDomainNameservers(domain: string, nameservers: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getNamecheapConfig();
    if (!config) {
      return { success: false, error: "Namecheap not configured" };
    }

    const parts = domain.toLowerCase().split(".");
    const tld = parts.pop() || "";
    const sld = parts.join(".");

    const baseUrl = "https://api.namecheap.com/xml.response";
    const params = new URLSearchParams({
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      Command: "namecheap.domains.dns.setCustom",
      ClientIp: config.clientIp,
      SLD: sld,
      TLD: tld,
      Nameservers: nameservers.join(","),
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const xml = await response.text();

    const error = extractErrorFromXml(xml);
    if (error) {
      return { success: false, error };
    }

    if (xml.includes('Status="OK"') || xml.includes('Update="true"')) {
      console.log(`✓ [Namecheap] Nameservers updated for ${domain}: ${nameservers.join(", ")}`);
      return { success: true };
    } else {
      return { success: false, error: "Failed to update nameservers" };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMsg };
  }
}
