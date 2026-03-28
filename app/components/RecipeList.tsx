'use client'

import { useState, useMemo } from 'react'
import RecipeCard from './RecipeCard'

interface Recipe {
  id: string
  title: string
  description: string | null
  image_url: string | null
  source_url: string | null
  created_at: string
  tags: string[]
}

export default function RecipeList({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const [recipes, setRecipes] = useState(initialRecipes)
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  function handleDelete(id: string) {
    setRecipes((prev) => prev.filter((r) => r.id !== id))
  }

  const allTags = useMemo(() => {
    const set = new Set<string>()
    recipes.forEach((r) => r.tags?.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [recipes])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return recipes.filter((r) => {
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q)
      const matchesTag = !selectedTag || r.tags?.includes(selectedTag)
      return matchesQuery && matchesTag
    })
  }, [query, selectedTag, recipes])

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="レシピを検索..."
        className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedTag === null
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            すべて
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-orange-500 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <p className="text-4xl mb-4">{recipes.length === 0 ? '🍽️' : '🔍'}</p>
          <p className="text-sm">
            {recipes.length === 0
              ? 'まだレシピが保存されていません。'
              : '条件に一致するレシピが見つかりません。'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
