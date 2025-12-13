import { useState, useEffect, useRef } from "react";
import { Bell, X, DollarSign, UserPlus, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: "domain_listing" | "affiliate_sale" | "new_signup" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationBellProps {
  userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications?userId=${userId}`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log("[Notifications] Connected to real-time notifications");
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "pong") return;

          const notification: Notification = {
            id: `${Date.now()}-${Math.random()}`,
            type: data.type,
            title: data.title,
            message: data.message,
            timestamp: data.timestamp || new Date().toISOString(),
            read: false,
          };

          setNotifications((prev) => [notification, ...prev].slice(0, 20));

          if (data.type === "affiliate_sale" || data.type === "new_signup") {
            playNotificationSound();
          }
        } catch (e) {
          console.error("[Notifications] Parse error:", e);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      wsRef.current.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      console.error("[Notifications] Connection error:", e);
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "affiliate_sale":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case "new_signup":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "domain_listing":
        return <Globe className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAllRead();
        }}
        className="relative p-2"
        data-testid="button-notifications"
      >
        <Bell className={`h-5 w-5 ${isConnected ? "text-slate-700" : "text-slate-400"}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600">
            <h3 className="font-bold text-white">Notifications</h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-white/80 hover:text-white text-xs">
                  Clear All
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-72">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-xs mt-1">
                  {isConnected ? "You'll see updates here in real-time" : "Connecting..."}
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-slate-100 hover:bg-slate-50 ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800">{notification.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatTime(notification.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-slate-200 bg-slate-50 text-center">
            <p className="text-xs text-slate-500">
              {isConnected ? (
                <span className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live updates enabled
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Reconnecting...
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
