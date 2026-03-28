import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'レシピ収集アプリ',
    short_name: 'レシピ',
    description: 'URLを貼るだけでレシピを自動収集・管理できるアプリ',
    start_url: '/recipes',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#f97316',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
