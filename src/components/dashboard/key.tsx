import { useState } from "preact/hooks";

interface Props {
  refreshState: () => void;
  onClear: () => void;
}

export default function DashboardKey({ refreshState }: Props) {
  const [key, setKey] = useState("");

  const store = (e: Event) => {
    e.preventDefault();
    if (!key.trim()) return;
    localStorage.setItem("key", key.trim());
    refreshState();
  };

  return (
    <form onSubmit={store} class="h-full flex flex-col items-center justify-center gap-6">
      <div class="flex items-center border-2 border-zinc-800 rounded text-2xl lg:text-3xl">
        <div class="bg-zinc-800 text-zinc-400 pl-4 pr-2 py-3 select-none">Key:</div>
        <input
          onInput={(e) => setKey(e.currentTarget.value)}
          required
          autofocus
          placeholder="your dashboard key"
          class="pl-2 pr-4 py-2 outline-none bg-zinc-900 text-zinc-300 placeholder-zinc-600"
          type="password"
        />
      </div>

      <button
        type="submit"
        class="px-4 py-2 rounded bg-lime-500/40 hover:bg-lime-500/50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!key.trim()}
      >
        Enter
      </button>
    </form>
  );
}
