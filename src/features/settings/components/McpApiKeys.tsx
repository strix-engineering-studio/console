"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { apiRequest } from "@/lib/api/client";
import { DataTable } from "@/components/tables/DataTable";

type Scope = "strix:read" | "strix:write";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: Scope[];
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  status: "active" | "expired" | "revoked";
};

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Never";

export default function McpApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [read, setRead] = useState(true);
  const [write, setWrite] = useState(false);
  const [expiration, setExpiration] = useState("never");

  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest<ApiKey[]>("/api/mcp/keys");
      setKeys(response);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load API keys.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function createKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const scopes: Scope[] = [
      ...(read ? (["strix:read"] as const) : []),
      ...(write ? (["strix:write"] as const) : []),
    ];

    if (!scopes.length) {
      setError("Choose at least one permission.");
      return;
    }

    if (!name.trim()) {
      setError("Integration name is required.");
      return;
    }

    setBusy(true);

    try {
      const expiresAt =
        expiration === "never"
          ? undefined
          : new Date(
              Date.now() + Number(expiration) * 24 * 60 * 60 * 1000,
            ).toISOString();

      const created = await apiRequest<{ key: string }>("/api/mcp/keys", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          scopes,
          ...(expiresAt ? { expiresAt } : {}),
        }),
      });

      setCreatedSecret(created.key);
      setCopied(false);
      setName("");

      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not create the API key.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    setError("");
    setBusy(true);

    try {
      await apiRequest(`/api/mcp/keys/${id}`, {
        method: "DELETE",
      });

      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not revoke the API key.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function copySecret() {
    if (!createdSecret) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdSecret);
      setCopied(true);
    } catch {
      setError("Clipboard access failed. Select and copy the key manually.");
    }
  }

  const columns = useMemo<ColumnDef<ApiKey>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Integration",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-medium">{row.original.name}</p>

            <code className="mt-1 block text-xs text-muted-foreground">
              {row.original.keyPrefix}••••••
            </code>
          </div>
        ),
      },

      {
        id: "scopes",
        header: "Permissions",
        accessorFn: (row) => row.scopes.join(","),
        cell: ({ row }) => {
          const scopes = row.original.scopes;

          return (
            <div className="flex flex-wrap gap-1.5">
              {scopes.includes("strix:read") && (
                <span className="rounded-md bg-muted px-2 py-1 text-xs">
                  Read
                </span>
              )}

              {scopes.includes("strix:write") && (
                <span className="rounded-md bg-muted px-2 py-1 text-xs">
                  Write
                </span>
              )}
            </div>
          );
        },
      },

      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;

          const statusClass =
            status === "active"
              ? "bg-emerald-500/10 text-emerald-700"
              : "bg-muted text-muted-foreground";

          const label =
            status === "active"
              ? "Active"
              : status === "expired"
                ? "Expired"
                : "Revoked";

          return (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
            >
              {label}
            </span>
          );
        },
      },

      {
        accessorKey: "lastUsedAt",
        header: "Last Used",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.lastUsedAt)}
          </span>
        ),
      },

      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },

      {
        accessorKey: "expiresAt",
        header: "Expires",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.expiresAt)}
          </span>
        ),
      },

      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const apiKey = row.original;

          if (apiKey.status !== "active") {
            return <span className="text-xs text-muted-foreground">—</span>;
          }

          return (
            <button
              type="button"
              disabled={busy}
              onClick={(event) => {
                event.stopPropagation();
                void revoke(apiKey.id);
              }}
              className="rounded-lg border border-destructive/30 px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Revoke
            </button>
          );
        },
      },
    ],
    [busy],
  );

  return (
    <section className="max-w-7xl">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">
          Manage credentials for external MCP integrations
        </p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          MCP API Keys
        </h2>
      </div>

      {/* Create API Key */}
      <form
        onSubmit={createKey}
        className="mt-5 grid gap-4 rounded-xl border bg-card p-5 md:grid-cols-2"
      >
        <label className="text-sm font-medium">
          Integration name
          <input
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Claude Production"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="text-sm font-medium">
          Expiration
          <select
            value={expiration}
            onChange={(event) => setExpiration(event.target.value)}
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="never">Never</option>
            <option value="30">In 30 days</option>
            <option value="90">In 90 days</option>
            <option value="365">In 1 year</option>
          </select>
        </label>

        <fieldset className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:col-span-2">
          <legend className="mb-2 font-medium">Permissions</legend>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={read}
              onChange={(event) => setRead(event.target.checked)}
            />
            Read
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={write}
              onChange={(event) => setWrite(event.target.checked)}
            />
            Write
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={busy}
          className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 md:col-span-2"
        >
          {busy ? "Working…" : "Create API key"}
        </button>
      </form>

      {/* Newly created secret */}
      {createdSecret && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">API key created</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Copy this key now. It will not be shown again.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreatedSecret(null)}
              className="text-sm text-muted-foreground underline"
            >
              Dismiss
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <code className="min-w-0 flex-1 break-all rounded-lg border bg-background px-3 py-2 text-sm">
              {createdSecret}
            </code>

            <button
              type="button"
              onClick={() => void copySecret()}
              className="rounded-lg border px-3 py-2 text-sm font-medium"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* API Keys Table */}
      <div className="mt-6">
        <DataTable<ApiKey, unknown>
          columns={columns}
          data={keys}
          loading={loading}
          enableSearch
          searchKey="name"
          searchPlaceholder="Search API keys..."
          enableSorting
          enableFiltering={false}
          enablePagination
          enableColumnVisibility={false}
          enableRowSelection={false}
          emptyMessage="No API keys yet."
        />
      </div>
    </section>
  );
}
