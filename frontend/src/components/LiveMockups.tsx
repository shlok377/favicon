import { Eye, Smartphone, MessageSquare, Monitor, LayoutGrid, X } from 'lucide-react';
import { useState } from 'react';
import type { MetadataState } from './MetadataPanel';

interface LiveMockupsProps {
  squarePreview: string | null;
  horizontalPreview: string | null;
  metadata: MetadataState;
}

export function LiveMockups({
  squarePreview,
  horizontalPreview,
  metadata,
}: LiveMockupsProps) {
  const [activeTab, setActiveTab] = useState<'browser' | 'ios' | 'whatsapp' | 'windows'>('browser');

  const domain = metadata.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'example.com';
  const socialImageSrc = horizontalPreview || squarePreview;

  return (
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-surface-600 dark:text-surface-300" />
          <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-50">
            Live Simulated Previews
          </h3>
        </div>

        {/* Mockup Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('browser')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'browser'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-50 shadow-sm'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Browser Tab</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-50 shadow-sm'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iOS Icon</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'whatsapp'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-50 shadow-sm'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp / Social</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('windows')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'windows'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-50 shadow-sm'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Windows Tile</span>
          </button>
        </div>
      </div>

      {/* Mockup Canvas */}
      <div className="border border-surface-200 dark:border-surface-800 rounded-lg p-6 bg-surface-50/50 dark:bg-surface-950/50 flex items-center justify-center min-h-[260px]">
        {/* 1. Browser Tab Mockup */}
        {activeTab === 'browser' && (
          <div className="w-full max-w-lg bg-surface-200 dark:bg-surface-800 rounded-xl overflow-hidden shadow-sm border border-surface-300 dark:border-surface-700">
            {/* Window bar */}
            <div className="px-3 pt-2 pb-1.5 flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              </div>

              {/* Active Tab */}
              <div className="bg-white dark:bg-surface-900 px-3 py-1.5 rounded-t-lg flex items-center gap-2 max-w-[240px] shadow-sm">
                {squarePreview ? (
                  <img
                    src={squarePreview}
                    alt="Favicon"
                    className="w-4 h-4 rounded object-contain shrink-0"
                  />
                ) : (
                  <div className="w-4 h-4 rounded bg-surface-300 dark:bg-surface-700 shrink-0"></div>
                )}
                <span className="text-xs font-medium text-surface-900 dark:text-surface-100 truncate">
                  {metadata.appName || 'My Web App'}
                </span>
                <X className="w-3 h-3 text-surface-400 ml-auto shrink-0 cursor-pointer" />
              </div>
            </div>

            {/* Address bar */}
            <div className="bg-white dark:bg-surface-900 p-2 border-t border-surface-300 dark:border-surface-700">
              <div className="bg-surface-100 dark:bg-surface-800 rounded-md px-3 py-1 text-xs text-surface-600 dark:text-surface-300 font-mono flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">🔒</span>
                <span className="truncate">{metadata.siteUrl || 'https://example.com'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. iOS Home Screen Mockup */}
        {activeTab === 'ios' && (
          <div className="flex flex-col items-center">
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden shadow-md flex items-center justify-center border border-black/10"
              style={{ backgroundColor: metadata.backgroundColor || '#ffffff' }}
            >
              {squarePreview ? (
                <img
                  src={squarePreview}
                  alt="iOS App Icon"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="w-full h-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center text-xs text-surface-400">
                  Icon
                </div>
              )}
            </div>
            <span className="mt-2 text-xs font-medium text-surface-800 dark:text-surface-200">
              {metadata.shortName || 'App'}
            </span>
          </div>
        )}

        {/* 3. WhatsApp / Social Share Chat Bubble Mockup */}
        {activeTab === 'whatsapp' && (
          <div className="w-full max-w-sm bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl overflow-hidden shadow-sm">
            {/* Card Banner Image */}
            <div
              className="w-full h-40 overflow-hidden flex items-center justify-center relative"
              style={{ backgroundColor: metadata.backgroundColor || '#121212' }}
            >
              {socialImageSrc ? (
                <img
                  src={socialImageSrc}
                  alt="Social Card Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-xs text-surface-400 flex items-center gap-1.5 font-mono">
                  <span>1200 × 630 Preview</span>
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-3.5 bg-surface-50 dark:bg-surface-800/60 border-t border-surface-100 dark:border-surface-800">
              <p className="text-[11px] font-mono text-surface-500 uppercase tracking-wider mb-1">
                {domain}
              </p>
              <h4 className="text-xs font-bold text-surface-900 dark:text-surface-50 mb-1 leading-snug">
                {metadata.appName || 'My Web App'}
              </h4>
              <p className="text-[11px] text-surface-600 dark:text-surface-400 line-clamp-2 leading-relaxed">
                {metadata.description || 'Modern web application with full favicon & social share asset support.'}
              </p>
            </div>
          </div>
        )}

        {/* 4. Windows Start Tile Mockup */}
        {activeTab === 'windows' && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Square 150x150 Tile */}
            <div
              className="w-28 h-28 p-3 flex flex-col justify-between rounded shadow-sm text-white relative"
              style={{ backgroundColor: metadata.themeColor || '#2563eb' }}
            >
              <div className="w-10 h-10 mx-auto my-auto flex items-center justify-center">
                {squarePreview ? (
                  <img src={squarePreview} alt="Tile logo" className="max-w-full max-h-full object-contain filter brightness-0 invert" />
                ) : (
                  <div className="w-8 h-8 rounded bg-white/20"></div>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight truncate">
                {metadata.shortName || 'App'}
              </span>
            </div>

            {/* Wide 310x150 Tile */}
            <div
              className="w-48 h-28 p-3 flex flex-col justify-between rounded shadow-sm text-white relative"
              style={{ backgroundColor: metadata.themeColor || '#2563eb' }}
            >
              <div className="w-16 h-10 mx-auto my-auto flex items-center justify-center">
                {socialImageSrc ? (
                  <img src={socialImageSrc} alt="Wide tile logo" className="max-w-full max-h-full object-contain filter brightness-0 invert" />
                ) : (
                  <div className="w-12 h-6 rounded bg-white/20"></div>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight truncate">
                {metadata.appName || 'My Web App'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
