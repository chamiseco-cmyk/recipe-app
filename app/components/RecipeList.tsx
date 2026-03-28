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
}

export default function RecipeList({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const [recipes, setRecipes] = useState(initialRecipes)
  const [query, setQuery] = useState('')

  function handleDelete(id: string) {
    setRecipes((prev) => prev.filter((r) => r.id !== id))
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return recipes
    return recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q)
    )
  }, [query, recipes])

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="レシピを検索..."
        className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <p className="text-4xl mb-4">{recipes.length === 0 ? '🍽️' : '🔍'}</p>
          <p className="text-sm">
            {recipes.length === 0
              ? 'まだレシピが保存されていません。'
              : `「${query}」に一致するレシピが見つかりません。`}
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
