import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files with appropriate cache headers
  app.use((req, res, next) => {
    // Force no-cache for HTML to always get fresh index
    if (req.path === "/" || req.path.endsWith(".html")) {
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
    } else {
      // Cache assets with content hash for a long time
      res.set("Cache-Control", "public, max-age=31536000, immutable");
    }
    next();
  });

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
