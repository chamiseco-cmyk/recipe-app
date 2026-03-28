import Link from 'next/link'
import ScrapeForm from './components/ScrapeForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">レシピ収集アプリ</h1>
          </div>
          <Link
            href="/recipes"
            className="text-sm text-zinc-500 hover:text-orange-500 transition-colors"
          >
            保存したレシピを見る →
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          料理サイトのURLを貼り付けると、レシピを自動で取り込みます。
        </p>
        <ScrapeForm />
      </main>
    </div>
  )
}
