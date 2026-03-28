'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Recipe {
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  imageUrl: string | null
  sourceUrl: string
}

export default function ScrapeForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [recipe, setRecipe] = useState<Recipe | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setRecipe(null)
    setSaveMessage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'エラーが発生しました')
      } else {
        setRecipe(data.recipe)
      }
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!recipe) return
    setSaving(true)
    setSaveMessage(null)

    const { error: dbError } = await supabase.from('recipes').insert({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      image_url: recipe.imageUrl,
      source_url: recipe.sourceUrl,
    })

    if (dbError) {
      setSaveMessage('保存に失敗しました: ' + dbError.message)
    } else {
      setSaveMessage('レシピを保存しました！')
    }
    setSaving(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="レシピのURLを貼り付けてください"
          required
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? '取得中...' : '取得'}
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      {recipe && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
          {recipe.imageUrl && (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{recipe.title}</h2>
            {recipe.description && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{recipe.description}</p>
            )}
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-xs text-orange-500 hover:underline"
            >
              元のレシピを見る
            </a>
          </div>

          {recipe.ingredients.length > 0 && (
            <div>
              <h3 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">材料</h3>
              <ul className="space-y-1">
                {recipe.ingredients.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recipe.steps.length > 0 && (
            <div>
              <h3 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">作り方</h3>
              <ol className="space-y-2">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600 dark:bg-orange-900/40">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : 'このレシピを保存'}
            </button>
            {saveMessage && (
              <p className={`text-sm ${saveMessage.includes('失敗') ? 'text-red-500' : 'text-green-600'}`}>
                {saveMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
