// Centralized admin authentication module
// Used by all admin-only routes to verify authentication

import type { Request } from "express";
import { storage } from "./storage";

export const verifyAdminAuth = async (req: Request): Promise<boolean> => {
  const cookies = (req as any).cookies;
  const sessionToken = cookies?.admin_session;
  
  if (!sessionToken || typeof sessionToken !== 'string') {
    return false;
  }
  
  // Validate token format (UUID v4)
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidV4Regex.test(sessionToken)) {
    console.log("[Admin Auth] Invalid token format");
    return false;
  }
  
  try {
    // Validate against DATABASE session store
    const session = await storage.getAdminSession(sessionToken);
    if (!session) {
      return false;
    }
    
    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      await storage.deleteAdminSession(sessionToken);
      return false;
    }
    
    // Validate the session email matches ADMIN_EMAIL
    const adminEmail = process.env.ADMIN_EMAIL;
    return session.email === adminEmail;
  } catch (err) {
    console.error("[Admin Auth] Error verifying session:", err);
    return false;
  }
};

// API Key authentication for external AI agents (uses ADMIN_PIN)
export const verifyApiKeyAuth = (req: Request): boolean => {
  const apiKey = req.headers["x-api-key"];
  const adminPin = process.env.ADMIN_PIN;
  return typeof apiKey === "string" && apiKey === adminPin;
};

// Combined auth - accepts either session-based admin auth OR API key
export const verifyAdminOrApiKey = async (req: Request): Promise<boolean> => {
  if (verifyApiKeyAuth(req)) return true;
  return await verifyAdminAuth(req);
};
