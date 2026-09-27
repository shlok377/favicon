import { useState } from 'react';
import { Code2, Copy, Check, Info } from 'lucide-react';
import type { MetadataState } from './MetadataPanel';
import type { PresetType } from './PresetSelector';

interface EmbedCodeViewerProps {
  metadata: MetadataState;
  preset: PresetType;
}

export function EmbedCodeViewer({ metadata, preset }: EmbedCodeViewerProps) {
  const [activeTab, setActiveTab] = useState<'html' | 'nextjs' | 'vite'>('html');
  const [copied, setCopied] = useState(false);

  const cleanUrl = metadata.siteUrl.replace(/\/$/, '') || 'https://example.com';
  const domain = cleanUrl.replace(/^https?:\/\//, '');

  const getHtmlSnippet = () => {
    let code = `<!-- Favicon & Browser Icons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
<link rel="icon" type="image/png" sizes="128x128" href="/favicon-128.png">
<link rel="icon" type="image/png" sizes="196x196" href="/favicon-196x196.png">

<!-- Apple Touch Icons (iOS) -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
<link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
<link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png">
<link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png">
<link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png">
<link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png">`;

    if (preset !== 'minimal') {
      code += `
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="${metadata.themeColor}">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${metadata.themeColor}">
<meta name="msapplication-TileColor" content="${metadata.themeColor}">
<meta name="msapplication-TileImage" content="/mstile-144x144.png">
<meta name="msapplication-config" content="/browserconfig.xml">

<!-- Open Graph / WhatsApp / Facebook Share Cards -->
<meta property="og:type" content="website">
<meta property="og:url" content="${cleanUrl}">
<meta property="og:title" content="${metadata.appName}">
<meta property="og:description" content="${metadata.description}">
<meta property="og:image" content="${cleanUrl}/og-image.png">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta property="twitter:domain" content="${domain}">
<meta property="twitter:url" content="${cleanUrl}">
<meta name="twitter:title" content="${metadata.appName}">
<meta name="twitter:description" content="${metadata.description}">
<meta name="twitter:image" content="${cleanUrl}/twitter-image.png">`;
    }

    return code;
  };

  const getNextJsSnippet = () => {
    return `// app/layout.tsx (Next.js App Router)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${metadata.appName}',
  description: '${metadata.description}',
  metadataBase: new URL('${cleanUrl}'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/favicon-196x196.png', sizes: '196x196', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-touch-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-touch-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/apple-touch-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-touch-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/apple-touch-icon-57x57.png', sizes: '57x57', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '${metadata.themeColor}',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: '${metadata.appName}',
    description: '${metadata.description}',
    url: '${cleanUrl}',
    siteName: '${metadata.appName}',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '${metadata.appName}',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '${metadata.appName}',
    description: '${metadata.description}',
    images: ['/twitter-image.png'],
  },
};`;
  };

  const getViteSnippet = () => {
    return `<!-- Vite / SPA Integration (index.html) -->
<!-- 1. Extract all icons and manifests directly into your Vite project's "public/" directory -->
<!-- 2. Paste the following tags inside the <head> of your index.html: -->

${getHtmlSnippet()}

<!-- Tip for vite-plugin-pwa (optional in vite.config.ts):
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      manifest: false, // uses the included site.webmanifest from public/
    }),
  ],
});
-->`;
  };

  const currentCode =
    activeTab === 'html'
      ? getHtmlSnippet()
      : activeTab === 'nextjs'
      ? getNextJsSnippet()
      : getViteSnippet();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-surface-600 dark:text-surface-300" />
          <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-50">
            Ready-to-Copy Embed Snippet
          </h3>
        </div>

        {/* Framework Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'html'
                  ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-50 shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
              }`}
            >
              HTML &lt;head&gt;
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('nextjs')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'nextjs'
                  ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-50 shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
              }`}
            >
              Next.js App Router
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vite')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'vite'
                  ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-50 shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
              }`}
            >
              Vite / Astro
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="relative">
        <pre className="p-4 rounded-lg bg-surface-950 text-surface-100 font-mono text-xs overflow-x-auto border border-surface-800 leading-relaxed max-h-72">
          <code>{currentCode}</code>
        </pre>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
        <Info className="w-3.5 h-3.5 shrink-0 text-surface-400" />
        <span>
          Extract all assets from the downloaded zip into your project's <code className="font-mono text-surface-700 dark:text-surface-300">public/</code> directory.
        </span>
      </div>
    </div>
  );
}
