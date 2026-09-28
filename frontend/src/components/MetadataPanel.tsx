import type { Dispatch, SetStateAction } from 'react';

export interface MetadataState {
  appName: string;
  shortName: string;
  themeColor: string;
  backgroundColor: string;
  siteUrl: string;
  description: string;
}

interface MetadataPanelProps {
  metadata: MetadataState;
  setMetadata: Dispatch<SetStateAction<MetadataState>>;
}

export function MetadataPanel({ metadata, setMetadata }: MetadataPanelProps) {
  const handleChange = (field: keyof MetadataState, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-bold text-base tracking-tight text-[#004643]">
          App Info
        </h4>
      </div>

      <div className="space-y-2.5">
        {/* App Name & Short Name in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-[#004643] mb-1 pl-1 transition-colors">
              Title
            </label>
            <input
              type="text"
              value={metadata.appName}
              onChange={(e) => handleChange('appName', e.target.value)}
              placeholder="My Web App"
              className="w-full text-xs px-3 py-1.5 sm:py-2 rounded-xl border border-[#004643]/20 bg-white/90 text-[#004643] focus:outline-none focus:ring-2 focus:ring-[#004643]/30 focus:border-[#004643] focus:bg-white focus:scale-[1.008] hover:border-[#004643]/40 transition-all duration-200 ease-out"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#004643] mb-1 pl-1 transition-colors">
              Short Name
            </label>
            <input
              type="text"
              value={metadata.shortName}
              onChange={(e) => handleChange('shortName', e.target.value)}
              placeholder="App"
              className="w-full text-xs px-3 py-1.5 sm:py-2 rounded-xl border border-[#004643]/20 bg-white/90 text-[#004643] focus:outline-none focus:ring-2 focus:ring-[#004643]/30 focus:border-[#004643] focus:bg-white focus:scale-[1.008] hover:border-[#004643]/40 transition-all duration-200 ease-out"
            />
          </div>
        </div>

        {/* Colors in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-[#004643] mb-1 pl-1 transition-colors">
              Theme Color
            </label>
            <div className="flex items-center gap-2 p-1 rounded-xl border border-[#004643]/20 bg-white/90 focus-within:ring-2 focus-within:ring-[#004643]/30 focus-within:border-[#004643] focus-within:scale-[1.008] hover:border-[#004643]/40 transition-all duration-200 ease-out">
              <input
                type="color"
                value={metadata.themeColor}
                onChange={(e) => handleChange('themeColor', e.target.value)}
                className="w-6 h-6 rounded-lg border-0 cursor-pointer bg-transparent p-0 hover:scale-110 active:scale-95 transition-transform duration-200"
              />
              <input
                type="text"
                value={metadata.themeColor}
                onChange={(e) => handleChange('themeColor', e.target.value)}
                className="w-full font-mono text-xs bg-transparent text-[#004643] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#004643] mb-1 pl-1 transition-colors">
              Icon Background
            </label>
            <div className="flex items-center gap-2 p-1 rounded-xl border border-[#004643]/20 bg-white/90 focus-within:ring-2 focus-within:ring-[#004643]/30 focus-within:border-[#004643] focus-within:scale-[1.008] hover:border-[#004643]/40 transition-all duration-200 ease-out">
              <input
                type="color"
                value={metadata.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="w-6 h-6 rounded-lg border-0 cursor-pointer bg-transparent p-0 hover:scale-110 active:scale-95 transition-transform duration-200"
              />
              <input
                type="text"
                value={metadata.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="w-full font-mono text-xs bg-transparent text-[#004643] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Site URL */}
        <div>
          <label className="block text-[11px] font-semibold text-[#004643] mb-1 pl-1 transition-colors">
            Site URL
          </label>
          <input
            type="url"
            value={metadata.siteUrl}
            onChange={(e) => handleChange('siteUrl', e.target.value)}
            placeholder="https://example.com"
            className="w-full text-xs px-3 py-1.5 sm:py-2 rounded-xl border border-[#004643]/20 bg-white/90 text-[#004643] focus:outline-none focus:ring-2 focus:ring-[#004643]/30 focus:border-[#004643] focus:bg-white focus:scale-[1.008] hover:border-[#004643]/40 transition-all duration-200 ease-out"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-semibold text-[#004643] mb-1 pl-1 transition-colors">
            Description
          </label>
          <input
            type="text"
            value={metadata.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="For social cards..."
            className="w-full text-xs px-3 py-1.5 sm:py-2 rounded-xl border border-[#004643]/20 bg-white/90 text-[#004643] focus:outline-none focus:ring-2 focus:ring-[#004643]/30 focus:border-[#004643] focus:bg-white focus:scale-[1.008] hover:border-[#004643]/40 transition-all duration-200 ease-out"
          />
        </div>
      </div>
    </div>
  );
}
