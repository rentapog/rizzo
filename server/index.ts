import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { startEmailWorker } from "./emailWorker";
import { startBillingWorker } from "./billingWorker";
import { storage } from "./storage";
import { notificationService } from "./websocket";

const app = express();

// CORS middleware for cross-origin requests from packages.rentapog.com
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://packages.rentapog.com',
    'https://backend.rentapog.com',
    'https://backoffice576.rentapog.com',
    'https://family.rentapog.com',
    'https://family1.rentapog.com',
    'https://family2.rentapog.com',
    'https://family3.rentapog.com',
    'https://family4.rentapog.com',
    'https://family5.rentapog.com',
    'https://family6.rentapog.com',
    'https://family7.rentapog.com',
    'https://rentapog.com',
    'https://www.rentapog.com'
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Enable cookie parsing for admin session authentication
app.use(cookieParser());

// robots.txt - Block search engines from indexing admin/backend/family subdomains
app.get('/robots.txt', (req, res) => {
  const hostname = req.hostname || '';
  const blockedSubdomains = ['backend', 'backoffice', 'backoffice576', 'family', 'family1', 'family2', 'family3', 'family4', 'family5', 'family6', 'family7'];
  const isBlocked = blockedSubdomains.some(sub => hostname.includes(`${sub}.rentapog.com`));
  
  res.type('text/plain');
  if (isBlocked) {
    res.send('User-agent: *\nDisallow: /\n');
  } else {
    res.send('User-agent: *\nAllow: /\n');
  }
});

// SUBDOMAIN REDIRECT MIDDLEWARE - Handle affiliate subdomain forwarding
// When someone visits gonads.rentapog.com, redirect to the user's affiliate link
app.use(async (req, res, next) => {
  try {
    const hostname = req.hostname || req.headers.host?.split(':')[0] || '';
    const fullHost = req.headers.host || '';
    
    // Log all incoming requests for debugging subdomain issues
    if (hostname.includes('rentapog.com') || fullHost.includes('rentapog.com')) {
      console.log(`[Subdomain Debug] hostname=${hostname}, host=${fullHost}, path=${req.path}`);
    }
    
    // Check if this is a subdomain of rentapog.com
    if (hostname.endsWith('.rentapog.com') && !hostname.startsWith('www.')) {
      // Extract subdomain (e.g., "gonads" from "gonads.rentapog.com")
      const subdomain = hostname.replace('.rentapog.com', '').toLowerCase();
      console.log(`[Subdomain Redirect] Processing subdomain: ${subdomain}`);
      
      // Skip known system subdomains - these serve their own pages
      const systemSubdomains = ['backend', 'backoffice', 'backoffice576', 'packages', 'api', 'admin', 'sales', 'domain', 'family', 'family1', 'family2', 'family3', 'family4', 'family5', 'family6', 'family7'];
      if (systemSubdomains.includes(subdomain)) {
        console.log(`[Subdomain Redirect] ${subdomain} is system subdomain, passing through`);
        return next();
      }
      
      // Look up user by subdomain
      const user = await storage.getUserBySubdomain(subdomain);
      console.log(`[Subdomain Redirect] User lookup for ${subdomain}:`, user ? `found (${user.email})` : 'not found');
      
      if (user && user.referralCode) {
        // Redirect to the affiliate link
        const affiliateUrl = `https://rentapog.com/?aff=${user.referralCode}`;
        console.log(`[Subdomain Redirect] ${hostname} → ${affiliateUrl}`);
        return res.redirect(301, affiliateUrl);
      }
      
      // Subdomain not found - redirect to main site
      console.log(`[Subdomain Redirect] ${hostname} not found in database, redirecting to main site`);
      return res.redirect(301, 'https://rentapog.com');
    }
    
    next();
  } catch (error) {
    console.error('[Subdomain Redirect] Error:', error);
    next();
  }
});

const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// CRITICAL MIDDLEWARE: Handle all affiliate link formats
// Redirect /register-domain to /register (same registration page)
app.use((req, res, next) => {
  if (req.path === "/register-domain") {
    return res.redirect(302, `/register${req.url.substring("/register-domain".length)}`);
  }
  
  const pathMatch = req.path.match(/^\/(?:aff|ref)[\/?=]([^/?&=]+)/);
  
  let code = null;
  
  // Handle path-based formats: /aff/code, /aff=code, /ref/code, /ref=code
  if (pathMatch && pathMatch[1]) {
    code = pathMatch[1];
  }
  
  if (code) {
    // Redirect to home with ?aff= parameter
    return res.redirect(302, `/?aff=${encodeURIComponent(code)}`);
  }
  
  next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);
  
  // Initialize WebSocket notification service
  notificationService.initialize(httpServer);
  
  // Sub-admin account family@rentapog.com is managed manually in the database
  // No automatic seeding needed
  
  // Start the email worker to send scheduled affiliate emails
  startEmailWorker();
  
  // Start the billing worker for trial expiration and daily charges
  startBillingWorker();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
