import { X } from 'lucide-react';
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
  const domain = metadata.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'example.com';
  const socialImageSrc = horizontalPreview || squarePreview;

  return (
    <div className="bg-[#d7f7f6] border border-[#004643]/20 rounded-[32px] p-5 sm:p-6 shadow-2xl flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="mb-3 shrink-0">
        <h4 className="font-bold text-base tracking-tight text-[#004643]">
          Live Preview
        </h4>
      </div>

      {/* Previews Stacked Directly Without Outer Card Wrappers */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0">
        {/* 1. Browser Tab Mockup */}
        <div className="space-y-1.5 shrink-0">
          <span className="text-[10px] font-bold text-[#004643]/80 uppercase tracking-wider pl-0.5">
            Browser
          </span>
          <div className="bg-white rounded-xl p-2.5 shadow-sm border border-[#004643]/15 space-y-2 hover:border-[#004643]/30 transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 opacity-70">
                <div className="w-2 h-2 rounded-full bg-rose-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div
                className="flex-1 max-w-[200px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-[#004643]/15 transition-colors duration-300"
                style={{ backgroundColor: `${metadata.themeColor || '#d7f7f6'}20` }}
              >
                {squarePreview ? (
                  <img
                    src={squarePreview}
                    alt="Favicon"
                    className="w-3.5 h-3.5 rounded object-contain shrink-0 transition-transform duration-200 hover:scale-110"
                  />
                ) : (
                  <div className="w-3.5 h-3.5 rounded bg-[#004643]/30 shrink-0" />
                )}
                <span className="text-[11px] font-semibold text-[#004643] truncate flex-1">
                  {metadata.appName || 'My Web App'}
                </span>
                <X className="w-2.5 h-2.5 text-[#004643]/70 shrink-0" />
              </div>
            </div>
            <div className="bg-[#d7f7f6]/40 px-2.5 py-1 rounded-lg text-[9px] text-[#004643] font-mono truncate border border-[#004643]/10">
              🔒 {metadata.siteUrl || 'https://example.com'}
            </div>
          </div>
        </div>

        {/* 2. iOS Home Screen Mockup with Tactile Interactive Squircle */}
        <div className="space-y-1.5 shrink-0">
          <span className="text-[10px] font-bold text-[#004643]/80 uppercase tracking-wider pl-0.5">
            iOS Icon
          </span>
          <div className="flex flex-col items-center justify-center py-2">
            <div
              className="w-16 h-16 rounded-[22%] overflow-hidden shadow-md flex items-center justify-center border border-black/10 shrink-0 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 hover:-rotate-2 hover:shadow-xl active:scale-95"
              style={{
                backgroundColor: metadata.backgroundColor || '#ffffff',
                transition: 'background-color 300ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1), box-shadow 300ms ease',
              }}
              title="iOS App Icon Preview"
            >
              {squarePreview ? (
                <img
                  src={squarePreview}
                  alt="iOS Icon"
                  className="w-full h-full object-contain p-2 transition-transform duration-200 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-white flex items-center justify-center text-xs text-[#004643] font-semibold">
                  App
                </div>
              )}
            </div>
            <span className="mt-1.5 text-xs font-semibold text-[#004643] truncate max-w-[120px] text-center">
              {metadata.shortName || 'App'}
            </span>
          </div>
        </div>

        {/* 3. Social Share Card Mockup */}
        <div className="space-y-1.5 shrink-0">
          <div className="flex items-center justify-between pl-0.5">
            <span className="text-[10px] font-bold text-[#004643]/80 uppercase tracking-wider">
              Social Card
            </span>
            <span className="text-[9px] font-mono text-[#004643]/70">
              1200 × 630
            </span>
          </div>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#004643]/15 hover:border-[#004643]/30 hover:shadow-md transition-all duration-200">
            <div
              className="w-full aspect-[1.91/1] max-h-36 overflow-hidden flex items-center justify-center transition-colors duration-300"
              style={{ backgroundColor: metadata.backgroundColor || '#004643' }}
            >
              {socialImageSrc ? (
                <img
                  src={socialImageSrc}
                  alt="Social preview"
                  className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="text-xs text-[#d7f7f6] font-mono">1.91:1 Preview Banner</div>
              )}
            </div>
            <div className="p-3 border-t border-[#004643]/15">
              <h5 className="text-xs font-bold text-[#004643] truncate">
                {metadata.appName || 'My Web App'}
              </h5>
              <p className="text-[10px] text-[#004643]/80 truncate mt-0.5">
                {metadata.description || 'Description preview'}
              </p>
              <span className="text-[9px] text-[#004643]/60 font-mono block mt-1">
                {domain}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Google Search SERP Snippet Mockup */}
        <div className="space-y-1.5 shrink-0">
          <span className="text-[10px] font-bold text-[#004643]/80 uppercase tracking-wider pl-0.5">
            Google Search
          </span>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-[#004643]/15 space-y-1 hover:border-[#004643]/30 transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#d7f7f6]/60 border border-[#004643]/15 flex items-center justify-center shrink-0">
                {squarePreview ? (
                  <img
                    src={squarePreview}
                    alt="Favicon"
                    className="w-3.5 h-3.5 rounded-full object-contain"
                  />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#004643]/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium text-[#004643] block truncate">
                  {metadata.appName || 'My Web App'}
                </span>
                <span className="text-[9px] text-[#004643]/60 font-mono block truncate">
                  {metadata.siteUrl || 'https://example.com'}
                </span>
              </div>
            </div>
            <h5 className="text-xs font-semibold text-[#004643] truncate pt-0.5">
              {metadata.appName || 'My Web App'} - Official Website
            </h5>
            <p className="text-[10px] text-[#004643]/80 line-clamp-2 leading-relaxed">
              {metadata.description || 'Explore the official application featuring complete cross-platform favicon, manifest, and modern social card assets.'}
            </p>
          </div>
        </div>

        {/* 5. Windows Start Tiles Mockup (Medium & Wide) with Full Color Actual Preview */}
        <div className="space-y-1.5 shrink-0 pb-1">
          <div className="flex items-center justify-between pl-0.5">
            <span className="text-[10px] font-bold text-[#004643]/80 uppercase tracking-wider">
              Windows Tile
            </span>
            <span className="text-[9px] font-mono text-[#004643]/70">
              Medium (150×150) & Wide (310×150)
            </span>
          </div>
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-[#004643]/15 hover:border-[#004643]/30 transition-all duration-200">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Square 150x150 Tile */}
              <div
                className="w-28 h-28 p-3 flex flex-col justify-between rounded-lg shadow-sm text-white relative transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer select-none"
                style={{
                  backgroundColor: metadata.themeColor || '#004643',
                  transition: 'background-color 300ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1)',
                }}
                title="Windows Medium Tile (150×150)"
              >
                <div className="w-12 h-12 mx-auto my-auto flex items-center justify-center">
                  {squarePreview ? (
                    <img
                      src={squarePreview}
                      alt="Tile logo"
                      className="w-full h-full object-contain drop-shadow-md rounded-md"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-[10px] text-white/70 font-mono">
                      1:1
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-tight truncate drop-shadow-md">
                  {metadata.shortName || 'App'}
                </span>
              </div>

              {/* Wide 310x150 Tile */}
              <div
                className="w-52 h-28 p-3 flex flex-col justify-between rounded-lg shadow-sm text-white relative transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer select-none"
                style={{
                  backgroundColor: metadata.themeColor || '#004643',
                  transition: 'background-color 300ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1)',
                }}
                title="Windows Wide Tile (310×150)"
              >
                <div className="w-24 h-12 mx-auto my-auto flex items-center justify-center">
                  {socialImageSrc ? (
                    <img
                      src={socialImageSrc}
                      alt="Wide tile logo"
                      className="w-full h-full object-contain drop-shadow-md rounded-md"
                    />
                  ) : (
                    <div className="w-16 h-8 rounded bg-white/20 flex items-center justify-center text-[10px] text-white/70 font-mono">
                      Wide
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-tight truncate drop-shadow-md">
                  {metadata.appName || 'My Web App'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
