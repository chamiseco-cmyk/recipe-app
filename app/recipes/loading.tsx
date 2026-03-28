export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <span className="text-lg font-semibold text-zinc-900 dark:text-white">レシピ収集アプリ</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="h-7 w-40 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-6" />
        <div className="h-10 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden animate-pulse">
              <div className="h-36 bg-zinc-200 dark:bg-zinc-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-700" />
                <div className="h-3 w-2/3 rounded bg-zinc-100 dark:bg-zinc-700" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
