import axios from 'axios'
import * as cheerio from 'cheerio'
import { type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; RecipeApp/1.0)',
  'Accept-Language': 'ja,en;q=0.9',
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ページからレシピらしいリンクを抽出
function findRecipeLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const origin = new URL(baseUrl).origin
  const seen = new Set<string>()
  const links: string[] = []

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    let url: URL
    try {
      url = new URL(href, baseUrl)
    } catch {
      return
    }
    // 同一ドメインのみ
    if (url.origin !== origin) return
    // フラグメントのみや同じページは除外
    if (url.pathname === new URL(baseUrl).pathname) return

    const path = url.pathname.toLowerCase()
    const text = $(el).text().trim()

    // レシピらしいURLパターン or テキスト
    const isRecipeUrl =
      /recipe|レシピ|bazurecipe|cook|dish|food|meal/.test(path) ||
      /\/(post|article|entry|blog)\//.test(path) ||
      /\/\d{4}\/\d{2}\/\d{2}\//.test(path) || // 日付URL
      /\.html$/.test(path)

    const isRecipeText =
      text.length > 3 && text.length < 80 &&
      !/privacy|terms|about|contact|login|register|sitemap|category|tag|page|search/i.test(path)

    if ((isRecipeUrl || isRecipeText) && !seen.has(url.href)) {
      seen.add(url.href)
      links.push(url.href)
    }
  })

  return links
}

// 単ページのレシピをスクレイプ
async function scrapePage(url: string) {
  const res = await axios.get(url, { headers: HEADERS, timeout: 10000, maxContentLength: 3 * 1024 * 1024 })
  const $ = cheerio.load(res.data)

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('h1').first().text().trim() ||
    $('title').text().trim() ||
    ''

  if (!title) return null

  const description =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    ''

  const imageUrl =
    $('meta[property="og:image"]').attr('content') ||
    null

  let ingredients: string[] = []
  let steps: string[] = []

  // JSON-LD を優先
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || '{}')
      const items = Array.isArray(json) ? json : [json]
      for (const item of items) {
        const recipe = item['@type'] === 'Recipe'
          ? item
          : item['@graph']?.find((g: { '@type': string }) => g['@type'] === 'Recipe')
        if (!recipe) continue
        if (recipe.recipeIngredient?.length) {
          ingredients = recipe.recipeIngredient.map((s: string) => s.trim())
        }
        if (recipe.recipeInstructions?.length) {
          steps = recipe.recipeInstructions.map((s: { text?: string } | string) =>
            typeof s === 'string' ? s.trim() : (s.text ?? '').trim()
          )
        }
        break
      }
    } catch { /* skip */ }
  })

  return { title, description, ingredients, steps, imageUrl, sourceUrl: url }
}

export async function POST(request: NextRequest) {
  const { url, maxItems = 20 } = await request.json()
  const clampedMax = Math.min(Math.max(1, maxItems), 100)

  if (!url || typeof url !== 'string') {
    return Response.json({ error: 'URLが指定されていません' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return Response.json({ error: '無効なURLです' }, { status: 400 })
  }

  // robots.txt を確認
  try {
    const robotsRes = await axios.get(`${parsedUrl.origin}/robots.txt`, { headers: HEADERS, timeout: 5000 })
    const robotsTxt = robotsRes.data as string
    if (/Disallow:\s*\//m.test(robotsTxt) && !/Allow:\s*\//m.test(robotsTxt)) {
      return Response.json({ error: 'このサイトはスクレイピングを禁止しています（robots.txt）' }, { status: 403 })
    }
  } catch { /* robots.txt が存在しない場合はスキップ */ }

  // ホームページを取得
  let homepageHtml: string
  try {
    const res = await axios.get(url, { headers: HEADERS, timeout: 10000 })
    homepageHtml = res.data
  } catch {
    return Response.json({ error: 'ページの取得に失敗しました' }, { status: 500 })
  }

  const $ = cheerio.load(homepageHtml)
  const links = findRecipeLinks($, url).slice(0, clampedMax)

  if (links.length === 0) {
    return Response.json({ error: 'レシピリンクが見つかりませんでした' }, { status: 422 })
  }

  // Supabaseクライアント（サーバーサイド）
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const saved: string[] = []
  const failedDetails: { url: string; reason: string }[] = []

  for (const link of links) {
    try {
      const recipe = await scrapePage(link)
      if (!recipe) {
        failedDetails.push({ url: link, reason: 'タイトルが取得できませんでした' })
        continue
      }

      const { error } = await supabase.from('recipes').insert({
        title: recipe.title,
        description: recipe.description || null,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        image_url: recipe.imageUrl,
        source_url: recipe.sourceUrl,
        tags: [],
      })

      if (error) failedDetails.push({ url: link, reason: 'DB保存エラー: ' + error.message })
      else saved.push(recipe.title)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      failedDetails.push({ url: link, reason: msg })
    }

    await sleep(300)
  }

  return Response.json({
    total: links.length,
    saved: saved.length,
    failed: failedDetails.length,
    savedTitles: saved,
    failedDetails: failedDetails.slice(0, 5),
    discoveredLinks: links.slice(0, 5),
  })
}
