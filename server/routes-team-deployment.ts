import type { Express } from "express";
import { storage } from "./storage";

export function registerTeamAndDeploymentRoutes(app: Express) {
  // Get team members
  app.get("/api/team/members/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const members = await storage.getTeamMembers(userId);
      res.json(members);
    } catch (error) {
      console.error("Get team members error:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // Invite team member
  app.post("/api/team/invite", async (req, res) => {
    try {
      const { ownerId, memberEmail } = req.body;

      if (!ownerId || !memberEmail) {
        return res.status(400).json({ message: "Owner ID and member email are required" });
      }

      const member = await storage.inviteTeamMember(ownerId, memberEmail);
      res.json({ success: true, member });
    } catch (error: any) {
      console.error("Invite team member error:", error);
      res.status(500).json({ message: error?.message || "Failed to invite team member" });
    }
  });

  // Remove team member
  app.delete("/api/team/members/:memberId", async (req, res) => {
    try {
      const { memberId } = req.params;
      await storage.removeTeamMember(parseInt(memberId));
      res.json({ success: true });
    } catch (error) {
      console.error("Remove team member error:", error);
      res.status(500).json({ message: "Failed to remove team member" });
    }
  });

  // Get deployment settings
  app.get("/api/deployment/settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const settings = await storage.getDeploymentSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error("Get deployment settings error:", error);
      res.status(500).json({ message: "Failed to fetch deployment settings" });
    }
  });

  // Update deployment settings
  app.post("/api/deployment/settings", async (req, res) => {
    try {
      const { userId, deploymentEnabled } = req.body;

      console.log("🔘 [Backend] Updating deployment settings");
      console.log("👤 User ID:", userId);
      console.log("🔒 Deployment enabled:", deploymentEnabled);

      if (!userId) {
        console.log("⚠️ [Backend] Missing user ID");
        return res.status(400).json({ message: "User ID is required" });
      }

      const settings = await storage.setDeploymentSettings(userId, deploymentEnabled);
      console.log("✅ [Backend] Deployment settings updated:", settings);
      res.json({ success: true, settings });
    } catch (error: any) {
      console.error("❌ [Backend] Update deployment settings error:", error);
      res.status(500).json({ message: error?.message || "Failed to update deployment settings" });
    }
  });

  // Deploy/Publish endpoint
  app.post("/api/deployment/deploy", async (req, res) => {
    try {
      const { userId } = req.body;

      console.log("🚀 [Backend Deploy] Received deployment request");
      console.log("👤 User ID:", userId);

      if (!userId) {
        console.log("⚠️ [Backend Deploy] Missing user ID");
        return res.status(400).json({ message: "User ID is required" });
      }

      const settings = await storage.getDeploymentSettings(userId);
      console.log("🔍 [Backend Deploy] Current deployment settings:", settings);

      if (!settings.deploymentEnabled) {
        console.log("❌ [Backend Deploy] Deployment is disabled for user", userId);
        return res.status(403).json({ message: "Deployment is not enabled. Please enable it first." });
      }

      // Here you would normally trigger the actual deployment
      // For now, we'll just record that a deployment occurred
      const updatedSettings = await storage.setDeploymentSettings(userId, true);
      updatedSettings.lastDeployedAt = new Date().toISOString();
      
      console.log("✅ [Backend Deploy] Deployment initiated successfully");
      console.log("⏰ Deployment time:", updatedSettings.lastDeployedAt);

      res.json({
        success: true,
        message: "🎉 Deployment initiated. Your changes are being deployed...",
        deployedAt: updatedSettings.lastDeployedAt,
      });
    } catch (error: any) {
      console.error("❌ [Backend Deploy] Deploy error:", error);
      res.status(500).json({ message: error?.message || "Deployment failed" });
    }
  });
}
