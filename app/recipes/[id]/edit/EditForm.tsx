'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import TagInput from '@/app/components/TagInput'

interface Recipe {
  id: string
  title: string
  description: string | null
  source_url: string | null
  ingredients: string[]
  steps: string[]
  tags: string[]
}

export default function EditForm({ recipe }: { recipe: Recipe }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(recipe.title)
  const [description, setDescription] = useState(recipe.description ?? '')
  const [sourceUrl, setSourceUrl] = useState(recipe.source_url ?? '')
  const [tags, setTags] = useState<string[]>(recipe.tags ?? [])
  const [ingredients, setIngredients] = useState<string[]>(recipe.ingredients?.length ? recipe.ingredients : [''])
  const [steps, setSteps] = useState<string[]>(recipe.steps?.length ? recipe.steps : [''])

  function updateIngredient(i: number, value: string) {
    setIngredients((prev) => prev.map((v, idx) => (idx === i ? value : v)))
  }

  function updateStep(i: number, value: string) {
    setSteps((prev) => prev.map((v, idx) => (idx === i ? value : v)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const { error: dbError } = await supabase
      .from('recipes')
      .update({
        title,
        description: description || null,
        source_url: sourceUrl || null,
        tags,
        ingredients: ingredients.filter((s) => s.trim()),
        steps: steps.filter((s) => s.trim()),
      })
      .eq('id', recipe.id)

    if (dbError) {
      setError('保存に失敗しました: ' + dbError.message)
      setSaving(false)
    } else {
      router.push(`/recipes/${recipe.id}`)
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
          <Link href={`/recipes/${recipe.id}`} className="text-sm text-zinc-500 hover:text-orange-500 transition-colors">
            ← 詳細に戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">レシピを編集</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              レシピ名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">タグ</label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">参照URL（任意）</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">材料</label>
            <div className="space-y-2">
              {ingredients.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateIngredient(i, e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setIngredients((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-zinc-400 hover:text-red-500 text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIngredients((prev) => [...prev, ''])}
              className="mt-2 text-sm text-orange-500 hover:underline"
            >
              + 材料を追加
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">作り方</label>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600 dark:bg-orange-900/40 mt-2">
                    {i + 1}
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    rows={2}
                    className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSteps((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-zinc-400 hover:text-red-500 text-lg leading-none mt-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSteps((prev) => [...prev, ''])}
              className="mt-2 text-sm text-orange-500 hover:underline"
            >
              + 手順を追加
            </button>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? '保存中...' : '変更を保存'}
          </button>
        </form>
      </main>
    </div>
  )
}
