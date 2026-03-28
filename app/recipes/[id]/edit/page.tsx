import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import EditForm from './EditForm'

export const dynamic = 'force-dynamic'

export default async function EditRecipePage({
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

  return <EditForm recipe={recipe} />
}
