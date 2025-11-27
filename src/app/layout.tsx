import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'NelsyFit - Gamified Fitness Coaching',
  description: 'Gamified fitness coaching with Duolingo-style programs, badges, streaks, and more',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NelsyFit',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((reg) => console.log('SW registered', reg))
                    .catch((err) => console.log('SW registration failed', err));
                });
              }
            `,
          }}
        />
      </head>
      <body className="bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
