import { useState } from "preact/hooks";

interface Props {
  refreshState: () => void;
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
    <div class="h-full flex flex-col items-center justify-center gap-8">
      <div class="flex flex-col items-center gap-3 text-center">
        <img
          src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTRvdTBvOTNjaGlpZXhvaDlwMnA4NGkxa3B1cHliN3lmazk1N2JmdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IBFvMzgB6fFmysKsmP/giphy.gif"
          alt=""
          class="w-32 h-32 object-contain select-none pointer-events-none"
          draggable={false}
        />
        <h1 class="text-2xl lg:text-3xl font-black text-zinc-200">
          Dashboard
        </h1>
      </div>

      <form
        onSubmit={store}
        class="flex flex-col items-center gap-4 w-full max-w-sm"
      >
        <div class="flex items-center border-2 border-zinc-800 rounded overflow-hidden text-lg lg:text-xl w-full">
          <div class="bg-zinc-800 text-zinc-400 px-4 py-3 select-none shrink-0">
            Key
          </div>
          <input
            onInput={(e) => setKey(e.currentTarget.value)}
            required
            autofocus
            placeholder="••••••••"
            class="w-full px-4 py-3 outline-none bg-zinc-900 text-zinc-300 placeholder-zinc-600"
            type="password"
          />
        </div>

        <button
          type="submit"
          class="px-8 py-2.5 rounded bg-lime-500/40 hover:bg-lime-500/50 disabled:cursor-not-allowed disabled:opacity-40 text-sm font-bold w-full"
          disabled={!key.trim()}
        >
          Unlock
        </button>
      </form>
    </div>
  );
}
