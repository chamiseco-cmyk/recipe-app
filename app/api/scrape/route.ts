import axios from 'axios'
import * as cheerio from 'cheerio'
import { type NextRequest } from 'next/server'

export const runtime = 'nodejs'

interface ScrapedRecipe {
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  imageUrl: string | null
  sourceUrl: string
}

function scrapeGeneric($: cheerio.CheerioAPI, url: string): ScrapedRecipe {
  const title =
    $('h1').first().text().trim() ||
    $('title').text().trim() ||
    ''

  const description =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    ''

  const imageUrl =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    null

  // JSON-LD (Recipe schema) から取得を試みる
  let ingredients: string[] = []
  let steps: string[] = []

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || '{}')
      const recipes = Array.isArray(json) ? json : [json]
      for (const item of recipes) {
        const recipe = item['@type'] === 'Recipe' ? item : item['@graph']?.find((g: { '@type': string }) => g['@type'] === 'Recipe')
        if (!recipe) continue
        if (recipe.recipeIngredient?.length) {
          ingredients = recipe.recipeIngredient.map((s: string) => s.trim())
        }
        if (recipe.recipeInstructions?.length) {
          steps = recipe.recipeInstructions.map((s: { text?: string } | string) =>
            typeof s === 'string' ? s.trim() : (s.text || '').trim()
          )
        }
        break
      }
    } catch {
      // JSON-LD パースに失敗した場合はスキップ
    }
  })

  return { title, description, ingredients, steps, imageUrl, sourceUrl: url }
}

function scrapeKookpad($: cheerio.CheerioAPI, url: string): ScrapedRecipe {
  const title = $('[class*="recipe-title"], h1.recipe__title, h1').first().text().trim()
  const description = $('[class*="recipe-description"], .summary, [class*="description"]').first().text().trim()
  const imageUrl =
    $('meta[property="og:image"]').attr('content') ||
    $('[class*="recipe-image"] img, [class*="photo"] img').first().attr('src') ||
    null

  const ingredients: string[] = []
  $('[class*="ingredient"], .ingredient_list li, [class*="material"]').each((_, el) => {
    const text = $(el).text().trim()
    if (text) ingredients.push(text)
  })

  const steps: string[] = []
  $('[class*="step"], .step_text, [class*="instruction"]').each((_, el) => {
    const text = $(el).text().trim()
    if (text) steps.push(text)
  })

  const base = scrapeGeneric($, url)
  return {
    ...base,
    title: title || base.title,
    description: description || base.description,
    imageUrl: imageUrl || base.imageUrl,
    ingredients: ingredients.length ? ingredients : base.ingredients,
    steps: steps.length ? steps : base.steps,
  }
}

export async function POST(request: NextRequest) {
  const { url } = await request.json()

  if (!url || typeof url !== 'string') {
    return Response.json({ error: 'URLが指定されていません' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return Response.json({ error: '無効なURLです' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return Response.json({ error: 'HTTPまたはHTTPSのURLを指定してください' }, { status: 400 })
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipeApp/1.0)',
        'Accept-Language': 'ja,en;q=0.9',
      },
      timeout: 10000,
      maxContentLength: 5 * 1024 * 1024, // 5MB
    })

    const $ = cheerio.load(response.data)
    const hostname = parsedUrl.hostname

    let recipe: ScrapedRecipe
    if (hostname.includes('cookpad.com')) {
      recipe = scrapeKookpad($, url)
    } else {
      recipe = scrapeGeneric($, url)
    }

    if (!recipe.title) {
      return Response.json({ error: 'レシピ情報を取得できませんでした' }, { status: 422 })
    }

    return Response.json({ recipe })
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.code === 'ECONNABORTED') {
        return Response.json({ error: 'タイムアウト：サイトへの接続に時間がかかりすぎました' }, { status: 504 })
      }
      if (err.response?.status === 403) {
        return Response.json({ error: 'このサイトはスクレイピングを禁止しています' }, { status: 403 })
      }
    }
    return Response.json({ error: 'レシピの取得に失敗しました' }, { status: 500 })
  }
}
