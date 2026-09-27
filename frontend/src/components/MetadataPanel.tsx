import type { Dispatch, SetStateAction } from 'react';
import { Palette, Globe, Sliders } from 'lucide-react';

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
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-4 h-4 text-surface-600 dark:text-surface-300" />
        <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-50">
          App & Social Metadata
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* App Name */}
        <div>
          <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">
            Application Name
          </label>
          <input
            type="text"
            value={metadata.appName}
            onChange={(e) => handleChange('appName', e.target.value)}
            placeholder="My Web App"
            className="w-full text-xs px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Short Name */}
        <div>
          <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">
            Short Name (Homescreen)
          </label>
          <input
            type="text"
            value={metadata.shortName}
            onChange={(e) => handleChange('shortName', e.target.value)}
            placeholder="App"
            className="w-full text-xs px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Theme Color */}
        <div>
          <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>Theme Color</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={metadata.themeColor}
              onChange={(e) => handleChange('themeColor', e.target.value)}
              className="w-8 h-8 rounded border border-surface-200 dark:border-surface-700 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={metadata.themeColor}
              onChange={(e) => handleChange('themeColor', e.target.value)}
              className="w-full font-mono text-xs px-2.5 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>Background Color</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={metadata.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-8 h-8 rounded border border-surface-200 dark:border-surface-700 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={metadata.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-full font-mono text-xs px-2.5 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {/* Site URL */}
        <div>
          <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>Production Site URL</span>
          </label>
          <input
            type="url"
            value={metadata.siteUrl}
            onChange={(e) => handleChange('siteUrl', e.target.value)}
            placeholder="https://example.com"
            className="w-full text-xs px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">
            Site Description (for WhatsApp & Social Cards)
          </label>
          <input
            type="text"
            value={metadata.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Description for link preview cards..."
            className="w-full text-xs px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}
