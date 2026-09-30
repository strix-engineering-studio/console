"use client";

import { useState } from "react";

import McpApiKeys from "../components/McpApiKeys";
import McpOAuthClients from "../components/McpOAuthClients";

type SettingsTab = "providers" | "oauth" | "api-keys";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("providers");

  const providers = [
    ["AI research", Boolean(process.env.AI_PROVIDER_API_KEY)],
    ["Search", Boolean(process.env.SEARCH_PROVIDER_API_KEY)],
    ["Maps", Boolean(process.env.NEXT_PUBLIC_MAP_TILE_URL)],
  ] as const;

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "providers", label: "Providers" },
    { id: "oauth", label: "OAuth Clients" },
    { id: "api-keys", label: "API Keys" },
  ];

  return (
    <section>
      <p className="text-sm text-muted-foreground">
        Configuration for this internal console
      </p>

      <h1 className="mt-1 text-3xl font-semibold">Settings</h1>

      {/* Tabs */}
      <div className="mt-6 border-b">
        <nav className="flex gap-6" aria-label="Settings">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}

                {isActive && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "providers" && (
          <>
            <div className="max-w-2xl divide-y rounded-xl border bg-card">
              {providers.map(([name, ready]) => (
                <div
                  key={name}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <h2 className="font-medium">{name} provider</h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Configured through server environment settings.
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      ready
                        ? "bg-emerald-500/10 text-emerald-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {ready ? "Configured" : "Not configured"}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Provider secrets stay on the server and are never returned to the
              browser.
            </p>
          </>
        )}

        {activeTab === "oauth" && <McpOAuthClients />}

        {activeTab === "api-keys" && <McpApiKeys />}
      </div>
    </section>
  );
}
