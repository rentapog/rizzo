import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, AlertCircle } from "lucide-react";

export default function CoeyChat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/coey/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to Coey. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Ask Coey
        </h2>
        <p className="text-muted-foreground">Your AI assistant powered by advanced AI. Ask anything about marketing, RentAPog, affiliate strategies, and more!</p>
      </div>

      <Card className="flex flex-col h-96">
        <CardContent className="flex-1 overflow-y-auto space-y-4 pt-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground pt-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation with Coey!</p>
              <p className="text-sm mt-2">Ask about marketing tips, affiliate strategies, or anything else.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 px-4 py-2 rounded-lg">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
          <Input
            type="text"
            placeholder="Ask Coey anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            data-testid="input-coey-message"
          />
          <Button type="submit" disabled={loading} size="icon" data-testid="button-send-coey">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-5 w-5" />
            Tips for Using Coey
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-800 space-y-2">
          <p>✓ Ask for marketing advice on any platform</p>
          <p>✓ Get help with affiliate strategy questions</p>
          <p>✓ Ask about growing your referral network</p>
          <p>✓ Request copy ideas for your posts</p>
          <p>✓ Get feedback on your marketing approach</p>
        </CardContent>
      </Card>
    </div>
  );
}
