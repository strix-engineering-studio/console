"use client";

import { useState, type CSSProperties } from "react";
import type { ReactNode } from "react";
import { Bot, ChevronLeft, Send, X } from "lucide-react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const styles = {
  "--sidebar-width": "260px",
  "--sidebar-width-icon": "56px",
  "--header-height": "64px",
} as CSSProperties;

type Message = {
  id: number;
  role: "assistant" | "user";
  content: string;
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [chatOpen, setChatOpen] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hi! How can I help you with Strix Lead?",
    },
  ]);

  function sendMessage() {
    const content = input.trim();
    if (!content) return;

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        role: "user",
        content,
      },
    ]);

    setInput("");
  }

  return (
    <SidebarProvider style={styles}>
      <div className="flex h-svh w-full overflow-hidden">
        {/* Left sidebar */}
        <AppSidebar className="shrink-0" />

        {/* Main application area */}
        <SidebarInset className="min-w-0 flex-1 overflow-hidden">
          <SiteHeader />

          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </SidebarInset>

        {/* Right sidebar-level AI assistant */}
        <aside
          className={`relative hidden shrink-0 border-l bg-background transition-[width] duration-200 lg:flex lg:flex-col ${
            chatOpen ? "w-[340px]" : "w-12"
          }`}
        >
          {chatOpen ? (
            <>
              <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-3">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="size-5 text-primary" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">AI Assistant</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Strix Lead Intelligence
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close assistant"
                  onClick={() => setChatOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>

              <Separator />

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[90%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <form
                className="flex shrink-0 items-center gap-2 p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage();
                }}
              >
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about your leads..."
                  aria-label="Chat message"
                />

                <Button
                  type="submit"
                  size="icon"
                  aria-label="Send message"
                  disabled={!input.trim()}
                >
                  <Send className="size-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex justify-center pt-3">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open assistant"
                onClick={() => setChatOpen(true)}
              >
                <ChevronLeft className="size-4" />
              </Button>
            </div>
          )}
        </aside>
      </div>
    </SidebarProvider>
  );
}
