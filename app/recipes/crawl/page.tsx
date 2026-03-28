'use client'

import { useState } from 'react'
import Link from 'next/link'

interface CrawlResult {
  total: number
  saved: number
  failed: number
  savedTitles: string[]
  failedDetails: { url: string; reason: string }[]
  discoveredLinks: string[]
}

export default function CrawlPage() {
  const [url, setUrl] = useState('')
  const [maxItems, setMaxItems] = useState(20)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CrawlResult | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, maxItems }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'エラーが発生しました')
      } else {
        setResult(data)
      }
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">レシピ収集アプリ</h1>
          </Link>
          <Link href="/recipes" className="text-sm text-zinc-500 hover:text-orange-500 transition-colors">
            ← 一覧に戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">サイトから一括収集</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            レシピサイトのURLを入力すると、掲載されているレシピを自動で取り込みます。
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          対象サイトの利用規約・robots.txtを事前に確認してください。
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              サイトURL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://bazurecipe.com/"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              最大収集件数（1〜100）
            </label>
            <input
              type="number"
              value={maxItems}
              onChange={(e) => setMaxItems(Math.min(100, Math.max(1, Number(e.target.value))))}
              min={1}
              max={100}
              className="w-32 rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-zinc-400">件数が多いほど時間がかかります（100件で約1分）</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? '収集中... しばらくお待ちください' : 'レシピを一括収集'}
          </button>
        </form>

        {loading && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                レシピリンクを検索してスクレイピング中です...
              </p>
            </div>
            <p className="text-xs text-zinc-400">サイトへの負荷を抑えるため、1件ずつ処理しています。{maxItems}件で最大約{maxItems * 0.5 + 5}秒かかります。</p>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}

        {result && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{result.saved > 0 ? '✅' : '⚠️'}</span>
              <h3 className="font-semibold text-zinc-900 dark:text-white">収集完了</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3">
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{result.total}</p>
                <p className="text-xs text-zinc-500">検出したリンク</p>
              </div>
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
                <p className="text-2xl font-bold text-green-600">{result.saved}</p>
                <p className="text-xs text-zinc-500">保存成功</p>
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
                <p className="text-2xl font-bold text-red-500">{result.failed}</p>
                <p className="text-xs text-zinc-500">取得失敗</p>
              </div>
            </div>

            {result.savedTitles.length > 0 && (
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">保存したレシピ：</p>
                <ul className="space-y-1">
                  {result.savedTitles.map((title, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="text-green-500">✓</span>
                      {title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.discoveredLinks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-1">検出したURL（先頭5件）：</p>
                <ul className="space-y-1">
                  {result.discoveredLinks.map((url, i) => (
                    <li key={i} className="text-xs text-zinc-400 truncate">{url}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.failedDetails.length > 0 && (
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-1">失敗の原因（先頭5件）：</p>
                <ul className="space-y-1">
                  {result.failedDetails.map((d, i) => (
                    <li key={i} className="text-xs text-red-400">{d.reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              href="/recipes"
              className="block text-center rounded-lg bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
            >
              レシピ一覧を見る
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
