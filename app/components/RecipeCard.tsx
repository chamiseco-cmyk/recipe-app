'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Recipe {
  id: string
  title: string
  description: string | null
  image_url: string | null
  source_url: string | null
  created_at: string
}

export default function RecipeCard({ recipe, onDelete }: { recipe: Recipe; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm(`「${recipe.title}」を削除しますか？`)) return
    setDeleting(true)
    const { error } = await supabase.from('recipes').delete().eq('id', recipe.id)
    if (!error) onDelete(recipe.id)
    else setDeleting(false)
  }

  return (
    <Link href={`/recipes/${recipe.id}`} className="group block rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden">
      {recipe.image_url ? (
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-36 object-cover group-hover:brightness-95 transition-all"
        />
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-4xl">
          🍳
        </div>
      )}
      <div className="p-4">
        <h3 className="font-medium text-zinc-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{recipe.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {new Date(recipe.created_at).toLocaleDateString('ja-JP')}
          </span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-zinc-300 hover:text-red-500 transition-colors disabled:opacity-50 dark:text-zinc-600"
          >
            {deleting ? '削除中...' : '削除'}
          </button>
        </div>
      </div>
    </Link>
  )
}
