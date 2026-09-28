import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
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

  const getHtmlSnippet = () => {
    let code = `<!-- Favicon & Standard Icons -->
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
      code += `\n
<!-- Android Chrome & PWA Manifest -->
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${metadata.themeColor || '#ffffff'}">
<meta name="application-name" content="${metadata.appName || 'App'}">
<meta name="apple-mobile-web-app-title" content="${metadata.shortName || 'App'}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">

<!-- Windows Tiles & Browserconfig -->
<meta name="msapplication-config" content="/browserconfig.xml">
<meta name="msapplication-TileColor" content="${metadata.themeColor || '#ffffff'}">
<meta name="msapplication-TileImage" content="/mstile-144x144.png">

<!-- Open Graph & Social Cards -->
<meta property="og:title" content="${metadata.appName || 'My Web App'}">
<meta property="og:description" content="${metadata.description || 'Web application'}">
<meta property="og:type" content="website">
<meta property="og:url" content="${cleanUrl}">
<meta property="og:image" content="${cleanUrl}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${metadata.appName || 'My Web App'}">
<meta name="twitter:description" content="${metadata.description || 'Web application'}">
<meta name="twitter:image" content="${cleanUrl}/twitter-image.png">`;
    }

    return code;
  };

  const getNextJsSnippet = () => {
    return `// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${metadata.appName || 'My Web App'}',
  description: '${metadata.description || 'Web application'}',
  metadataBase: new URL('${cleanUrl}'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-196x196.png', sizes: '196x196', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: '${metadata.appName || 'My Web App'}',
    description: '${metadata.description || 'Web application'}',
    url: '${cleanUrl}',
    siteName: '${metadata.appName || 'My Web App'}',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '${metadata.appName || 'My Web App'}',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '${metadata.appName || 'My Web App'}',
    description: '${metadata.description || 'Web application'}',
    images: ['/twitter-image.png'],
  },
};`;
  };

  const getViteSnippet = () => {
    return `<!-- index.html (inside <head>) -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="${metadata.themeColor || '#ffffff'}" />
<meta property="og:title" content="${metadata.appName || 'My Web App'}" />
<meta property="og:description" content="${metadata.description || 'Web application'}" />
<meta property="og:image" content="/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />`;
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

  const tabs: ('html' | 'nextjs' | 'vite')[] = ['html', 'nextjs', 'vite'];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  const updateSlider = () => {
    const activeIdx = tabs.indexOf(activeTab);
    const activeEl = tabRefs.current[activeIdx];
    if (activeEl) {
      setSliderStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        ready: true,
      });
    }
  };

  useLayoutEffect(() => {
    updateSlider();
  }, [activeTab]);

  useEffect(() => {
    window.addEventListener('resize', updateSlider);
    return () => window.removeEventListener('resize', updateSlider);
  }, [activeTab]);

  return (
    <div className="bg-[#d7f7f6] border border-[#004643]/20 rounded-[32px] p-5 sm:p-7 shadow-2xl flex flex-col justify-between h-full w-full min-h-0 overflow-hidden">
      {/* Header & Framework Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#004643]/15 shrink-0">
        <div>
          <h3 className="font-bold text-lg text-[#004643]">
            Embed Snippet
          </h3>
          <p className="text-xs text-[#004643]/70 mt-0.5">
            Add to your project's index or layout
          </p>
        </div>

        {/* Framework Tabs with Liquid Sliding Pill & Copy Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex items-center gap-1 p-1 bg-white/80 rounded-full border border-[#004643]/20">
            {sliderStyle.ready && (
              <div
                className="absolute top-1 bottom-1 rounded-full bg-[#004643] shadow-sm pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  left: `${sliderStyle.left}px`,
                  width: `${sliderStyle.width}px`,
                }}
              />
            )}

            {tabs.map((tab, idx) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative z-10 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 capitalize select-none ${
                    isActive
                      ? 'text-[#d7f7f6]'
                      : 'text-[#004643]/70 hover:text-[#004643]'
                  }`}
                >
                  {tab === 'html' ? 'HTML' : tab === 'nextjs' ? 'Next.js' : 'Vite'}
                </button>
              );
            })}
          </div>

          {/* Tactile Copy Button with Haptic Scale & Icon Flip */}
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-md active:scale-90 hover:scale-105 select-none ${
              copied
                ? 'bg-white text-[#004643] ring-2 ring-[#004643]/30'
                : 'bg-[#004643] hover:bg-[#003331] text-[#d7f7f6]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#004643] animate-checkmark-pop shrink-0" />
                <span className="animate-label-flip">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 shrink-0" />
                <span className="animate-label-flip">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Display Area - Fills remaining height of the full-sized card with smooth tab fade */}
      <div className="mt-4 relative flex-1 min-h-0 overflow-hidden">
        <pre
          key={activeTab}
          className="p-4 rounded-2xl bg-[#002B29] text-[#d7f7f6] font-mono text-xs overflow-auto border border-[#004643]/30 leading-relaxed h-full custom-scrollbar animate-tab-fade"
        >
          <code>{currentCode}</code>
        </pre>
      </div>
    </div>
  );
}
