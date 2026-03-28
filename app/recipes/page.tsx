import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import RecipeList from '@/app/components/RecipeList'

export const dynamic = 'force-dynamic'

export default async function RecipesPage() {
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, title, description, image_url, source_url, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-red-500">レシピの読み込みに失敗しました: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">レシピ収集アプリ</h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/recipes/new"
              className="text-sm text-zinc-500 hover:text-orange-500 transition-colors"
            >
              手動登録
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
            >
              + URLから追加
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
          保存したレシピ
          <span className="ml-2 text-sm font-normal text-zinc-400">({recipes?.length ?? 0}件)</span>
        </h2>
        <RecipeList initialRecipes={recipes ?? []} />
      </main>
    </div>
  )
}
