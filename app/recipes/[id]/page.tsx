import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !recipe) notFound()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">レシピ収集アプリ</h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/recipes/${id}/edit`}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:border-orange-400 hover:text-orange-500 transition-colors dark:border-zinc-700 dark:text-zinc-400"
            >
              編集
            </Link>
            <Link href="/recipes" className="text-sm text-zinc-500 hover:text-orange-500 transition-colors">
              ← 一覧に戻る
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        {recipe.image_url && (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-56 object-cover rounded-xl"
          />
        )}

        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{recipe.title}</h2>
          {recipe.description && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{recipe.description}</p>
          )}
          {recipe.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {recipe.tags.map((tag: string) => (
                <span key={tag} className="rounded-full bg-orange-100 px-3 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center gap-4">
            {recipe.source_url && (
              <a
                href={recipe.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-500 hover:underline"
              >
                元のレシピを見る
              </a>
            )}
            <span className="text-xs text-zinc-400">
              {new Date(recipe.created_at).toLocaleDateString('ja-JP')}
            </span>
          </div>
        </div>

        {recipe.ingredients?.length > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-3">材料</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recipe.steps?.length > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-3">作り方</h3>
            <ol className="space-y-4">
              {recipe.steps.map((step: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600 dark:bg-orange-900/40">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </main>
    </div>
  )
}
