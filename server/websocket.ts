import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

interface NotificationPayload {
  type: "domain_listing" | "affiliate_sale" | "new_signup" | "system";
  title: string;
  message: string;
  data?: any;
  timestamp: string;
}

class NotificationService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<WebSocket>> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws/notifications" });

    this.wss.on("connection", (ws, req) => {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const userId = url.searchParams.get("userId") || "anonymous";

      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId)!.add(ws);

      console.log(`[WebSocket] Client connected: ${userId}`);

      ws.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
          }
        } catch (e) {
          // ignore invalid messages
        }
      });

      ws.on("close", () => {
        const userClients = this.clients.get(userId);
        if (userClients) {
          userClients.delete(ws);
          if (userClients.size === 0) {
            this.clients.delete(userId);
          }
        }
        console.log(`[WebSocket] Client disconnected: ${userId}`);
      });

      ws.on("error", (error) => {
        console.error(`[WebSocket] Error for ${userId}:`, error.message);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: "system",
        title: "Connected",
        message: "Real-time notifications enabled",
        timestamp: new Date().toISOString(),
      }));
    });

    console.log("[WebSocket] Notification server initialized");
  }

  broadcast(notification: NotificationPayload) {
    if (!this.wss) return;

    const payload = JSON.stringify(notification);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    console.log(`[WebSocket] Broadcast: ${notification.type} - ${notification.title}`);
  }

  notifyUser(userId: string, notification: NotificationPayload) {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    const payload = JSON.stringify(notification);
    userClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  notifyNewDomainListing(domainName: string, niche: string, price: number) {
    this.broadcast({
      type: "domain_listing",
      title: "New Domain Listed!",
      message: `${domainName} is now available in ${niche} for $${price}/day`,
      data: { domainName, niche, price },
      timestamp: new Date().toISOString(),
    });
  }

  notifyAffiliateSale(referrerId: string, amount: number, buyerName?: string) {
    this.notifyUser(referrerId, {
      type: "affiliate_sale",
      title: "You Made a Sale!",
      message: `Congratulations! You earned $${(amount / 100).toFixed(2)} from ${buyerName || "a new customer"}`,
      data: { amount, buyerName },
      timestamp: new Date().toISOString(),
    });

    // Also broadcast to all users for social proof
    this.broadcast({
      type: "affiliate_sale",
      title: "Someone Just Made Money!",
      message: `A member just earned $${(amount / 100).toFixed(2)} in commissions!`,
      data: { amount },
      timestamp: new Date().toISOString(),
    });
  }

  notifyNewSignup(referrerId: string, newUserName: string) {
    this.notifyUser(referrerId, {
      type: "new_signup",
      title: "New Referral!",
      message: `${newUserName} just signed up using your link!`,
      data: { newUserName },
      timestamp: new Date().toISOString(),
    });
  }
}

export const notificationService = new NotificationService();
