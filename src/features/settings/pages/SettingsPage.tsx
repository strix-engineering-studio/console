import McpApiKeys from "../components/McpApiKeys";
import McpOAuthClients from "../components/McpOAuthClients";

export default function SettingsPage() {
  const providers = [
    ["AI research", Boolean(process.env.AI_PROVIDER_API_KEY)],
    ["Search", Boolean(process.env.SEARCH_PROVIDER_API_KEY)],
    ["Maps", Boolean(process.env.NEXT_PUBLIC_MAP_TILE_URL)],
  ] as const;
  return (
    <section>
      <p className="text-sm text-muted-foreground">
        Configuration for this internal console
      </p>
      <h1 className="mt-1 text-3xl font-semibold">Settings</h1>
      <div className="mt-6 max-w-2xl divide-y rounded-xl border bg-card">
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
              className={`rounded-full px-2.5 py-1 text-xs ${ready ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}
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
      <McpOAuthClients />
      <McpApiKeys />
    </section>
  );
}
