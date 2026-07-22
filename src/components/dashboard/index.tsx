import { useEffect, useState } from "preact/hooks";
import { createClient } from "../../utils/server/client";
import type { Link } from "../../utils/db/schema";
import DashboardKey from "./key";

type View = "list" | "create";

type Toast = { id: number; text: string; kind: "ok" | "err" };

let nextId = 1;

export default function DashboardPage() {
  const [isKeySet, setIsKeySet] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [editKey, setEditKey] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [newKey, setNewKey] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const addToast = (text: string, kind: Toast["kind"] = "ok") => {
    const id = nextId++;
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const loadLinks = async (s?: string) => {
    setLoading(true);
    try {
      const client = createClient();
      setLinks(await client.list.query({ search: s || undefined }));
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Failed to load links", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("key")) setIsKeySet(true);
  }, []);

  useEffect(() => {
    if (isKeySet) loadLinks(search);
  }, [isKeySet]);

  const onSubmitCreate = async (e: Event) => {
    e.preventDefault();
    if (!newKey.trim() || !newUrl.trim()) return;
    try {
      const client = createClient();
      await client.create.mutate({
        key: newKey.trim(),
        url: newUrl.trim(),
        description: newDesc || undefined,
      });
      addToast(`Created /${newKey.trim()}`);
      setNewKey("");
      setNewUrl("");
      setNewDesc("");
      setView("list");
      loadLinks(search);
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Create failed", "err");
    }
  };

  const onStartEdit = (link: Link) => {
    setEditing(link.id);
    setEditKey(link.key);
    setEditUrl(link.url);
    setEditDesc(link.description ?? "");
  };

  const onCancelEdit = () => {
    setEditing(null);
  };

  const onSubmitEdit = async (e: Event, id: string) => {
    e.preventDefault();
    if (!editKey.trim() || !editUrl.trim()) return;
    try {
      const client = createClient();
      await client.update.mutate({
        id,
        key: editKey.trim(),
        url: editUrl.trim(),
        description: editDesc || undefined,
      });
      addToast("Link updated");
      setEditing(null);
      loadLinks(search);
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Update failed", "err");
    }
  };

  const onToggleEnabled = async (link: Link) => {
    try {
      const client = createClient();
      await client.update.mutate({ id: link.id, enabled: !link.enabled });
      addToast(link.enabled ? "Disabled" : "Enabled");
      loadLinks(search);
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Toggle failed", "err");
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Delete this link?")) return;
    try {
      const client = createClient();
      await client.delete.mutate({ id });
      addToast("Link deleted");
      loadLinks(search);
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Delete failed", "err");
    }
  };

  if (!isKeySet) {
    return (
      <DashboardKey
        refreshState={() => setIsKeySet(true)}
        onClear={() => {}}
      />
    );
  }

  return (
    <div class="flex flex-col gap-6 h-full">
      {/* Toasts */}
      <div class="fixed top-4 right-4 flex flex-col gap-2 z-50 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            class={`px-4 py-2 rounded text-sm font-mono cursor-pointer ${
              t.kind === "ok"
                ? "bg-lime-500/20 border border-lime-500/40 text-lime-300"
                : "bg-red-500/20 border border-red-500/40 text-red-300"
            }`}
            onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div class="flex items-center justify-between gap-4 flex-shrink-0">
        <input
          onInput={(e) => {
            setSearch(e.currentTarget.value);
            loadLinks(e.currentTarget.value);
          }}
          value={search}
          placeholder="Search links…"
          class="px-3 py-1.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 text-sm outline-none focus:border-zinc-500 w-64"
          type="text"
        />
        <div class="flex gap-2">
          <button
            onClick={() => {
              setView("create");
              setEditing(null);
            }}
            class={`px-3 py-1.5 rounded text-sm border ${
              view === "create"
                ? "border-lime-500/50 bg-lime-500/20 text-lime-300"
                : "border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
            }`}
          >
            + New
          </button>
          <button
            onClick={() => {
              setView("list");
              setEditing(null);
            }}
            class={`px-3 py-1.5 rounded text-sm border ${
              view === "list"
                ? "border-lime-500/50 bg-lime-500/20 text-lime-300"
                : "border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
            }`}
          >
            Links
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("key");
              setIsKeySet(false);
            }}
            class="px-3 py-1.5 rounded text-sm border border-zinc-700 text-zinc-500 hover:text-zinc-300"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Create view */}
      {view === "create" && (
        <form onSubmit={onSubmitCreate} class="flex flex-col gap-4 max-w-lg">
          <h2 class="text-lg font-bold text-zinc-200">New Link</h2>
          <div class="flex gap-2 items-center">
            <span class="text-zinc-500 text-sm font-mono">pycz.dev/</span>
            <input
              onInput={(e) => setNewKey(e.currentTarget.value)}
              value={newKey}
              required
              placeholder="my-link"
              class="flex-1 px-3 py-1.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 outline-none focus:border-zinc-500 text-sm"
              type="text"
            />
          </div>
          <input
            onInput={(e) => setNewUrl(e.currentTarget.value)}
            value={newUrl}
            required
            placeholder="https://example.com"
            class="px-3 py-1.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 outline-none focus:border-zinc-500 text-sm"
            type="url"
          />
          <input
            onInput={(e) => setNewDesc(e.currentTarget.value)}
            value={newDesc}
            placeholder="Description (optional)"
            class="px-3 py-1.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 outline-none focus:border-zinc-500 text-sm"
            type="text"
          />
          <button
            type="submit"
            disabled={!newKey.trim() || !newUrl.trim()}
            class="px-4 py-1.5 rounded bg-lime-500/40 hover:bg-lime-500/50 disabled:opacity-40 disabled:cursor-not-allowed text-sm self-start"
          >
            Create
          </button>
        </form>
      )}

      {/* List view */}
      {view === "list" && (
        <div class="flex-1 overflow-auto min-h-0">
          {loading && <p class="text-zinc-500 text-sm font-mono">Loading…</p>}
          {!loading && links.length === 0 && (
            <p class="text-zinc-500 text-sm font-mono">
              {search
                ? "No links match that search."
                : "No links yet. Create one!"}
            </p>
          )}
          {!loading && links.length > 0 && (
            <table class="w-full text-sm font-mono">
              <thead>
                <tr class="text-zinc-500 border-b border-zinc-800 text-left">
                  <th class="py-2 pr-4 font-normal w-8">#</th>
                  <th class="py-2 pr-4 font-normal">Key</th>
                  <th class="py-2 pr-4 font-normal hidden md:table-cell">
                    URL
                  </th>
                  <th class="py-2 pr-4 font-normal w-16 text-right">
                    Clicks
                  </th>
                  <th class="py-2 font-normal w-40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) =>
                  editing === link.id ? (
                    <tr
                      key={link.id}
                      class="border-b border-zinc-800/50"
                    >
                      <td class="py-2 pr-4 text-zinc-600" />
                      <td class="py-2 pr-4">
                        <input
                          onInput={(e) =>
                            setEditKey(e.currentTarget.value)
                          }
                          value={editKey}
                          class="w-full px-2 py-1 rounded border border-zinc-700 bg-zinc-800 text-zinc-300 outline-none focus:border-zinc-500 text-xs"
                          type="text"
                        />
                      </td>
                      <td class="py-2 pr-4 hidden md:table-cell">
                        <input
                          onInput={(e) =>
                            setEditUrl(e.currentTarget.value)
                          }
                          value={editUrl}
                          class="w-full px-2 py-1 rounded border border-zinc-700 bg-zinc-800 text-zinc-300 outline-none focus:border-zinc-500 text-xs"
                          type="url"
                        />
                      </td>
                      <td />
                      <td class="py-2 text-right">
                        <div class="flex gap-1 justify-end text-xs">
                          <button
                            onClick={(e) => onSubmitEdit(e, link.id)}
                            class="px-2 py-1 rounded bg-lime-500/30 hover:bg-lime-500/50 text-lime-300"
                          >
                            Save
                          </button>
                          <button
                            onClick={onCancelEdit}
                            class="px-2 py-1 rounded bg-zinc-700 text-zinc-400 hover:text-zinc-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={link.id}
                      class="border-b border-zinc-800/50 group hover:bg-zinc-800/30"
                    >
                      <td class="py-2 pr-4 text-zinc-600">
                        {link.enabled ? (
                          <span
                            class="w-2 h-2 inline-block rounded-full bg-lime-500"
                            title="Enabled"
                          />
                        ) : (
                          <span
                            class="w-2 h-2 inline-block rounded-full bg-red-500"
                            title="Disabled"
                          />
                        )}
                      </td>
                      <td class="py-2 pr-4">
                        <a
                          href={`/${link.key}`}
                          target="_blank"
                          class="text-zinc-300 hover:text-lime-400 hover:underline truncate block max-w-[200px]"
                        >
                          /{link.key}
                        </a>
                      </td>
                      <td class="py-2 pr-4 text-zinc-500 hidden md:table-cell truncate max-w-[300px]">
                        {link.url}
                      </td>
                      <td class="py-2 pr-4 text-zinc-500 text-right">
                        {link.clicks}
                      </td>
                      <td class="py-2 text-right">
                        <div class="flex gap-1 justify-end text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onStartEdit(link)}
                            class="px-2 py-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onToggleEnabled(link)}
                            class="px-2 py-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300"
                          >
                            {link.enabled ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => onDelete(link.id)}
                            class="px-2 py-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
