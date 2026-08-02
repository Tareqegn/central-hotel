// app/manifest.js
export default function manifest() {
  return {
    name: 'Central Yamarech Hotel Portal',
    short_name: 'Central Hotel',
    description: 'Instant contactless room service, laundry, and guest concierge portal.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090b11', // Matches your deep dark UI theme
    theme_color: '#f59e0b',      // Matches your brand amber accents
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}