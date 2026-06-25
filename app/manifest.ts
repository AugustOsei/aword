import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aword — five words a day',
    short_name: 'Aword',
    description:
      'Five words a day — and what they mean. A daily word game that teaches you something every day.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FBFAF6',
    theme_color: '#FBFAF6',
    categories: ['games', 'education', 'word'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
