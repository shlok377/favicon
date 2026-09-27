import type { Dispatch, SetStateAction } from 'react';
import { Check, CheckSquare, Square, Package, Sparkles, Filter } from 'lucide-react';

export type PresetType = 'standard' | 'minimal' | 'custom';

export interface CustomCategoriesState {
  standard_favicons: boolean;
  apple_ios: boolean;
  android_pwa: boolean;
  windows_tiles: boolean;
  social_cards: boolean;
}

interface PresetSelectorProps {
  preset: PresetType;
  setPreset: (preset: PresetType) => void;
  customCategories: CustomCategoriesState;
  setCustomCategories: Dispatch<SetStateAction<CustomCategoriesState>>;
}

export function PresetSelector({
  preset,
  setPreset,
  customCategories,
  setCustomCategories,
}: PresetSelectorProps) {
  const toggleCategory = (key: keyof CustomCategoriesState) => {
    setCustomCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAllCategories = (select: boolean) => {
    setCustomCategories({
      standard_favicons: select,
      apple_ios: select,
      android_pwa: select,
      windows_tiles: select,
      social_cards: select,
    });
  };

  return (
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-surface-600 dark:text-surface-300" />
          <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-50">
            Output Bundle Preset
          </h3>
        </div>
        <span className="text-xs text-surface-500 font-mono">
          {preset === 'standard' ? 'Full Suite (16+ assets)' : preset === 'minimal' ? 'Essential (4 assets)' : 'Custom Selected'}
        </span>
      </div>

      {/* Preset Radio Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Standard Preset */}
        <button
          type="button"
          onClick={() => setPreset('standard')}
          className={`p-3.5 rounded-lg border text-left transition-all relative ${
            preset === 'standard'
              ? 'border-primary bg-primary-subtle dark:bg-primary-darkSubtle/40 ring-1 ring-primary'
              : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700 bg-surface-50/50 dark:bg-surface-950/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-surface-900 dark:text-surface-100">
                Standard
              </span>
            </div>
            {preset === 'standard' && (
              <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
          <p className="text-[11px] text-surface-500 dark:text-surface-400 leading-relaxed">
            Complete modern suite: Favicons, Apple Touch, Android PWA, Windows Tiles, WhatsApp/Social Cards & Manifests.
          </p>
        </button>

        {/* Minimal Preset */}
        <button
          type="button"
          onClick={() => setPreset('minimal')}
          className={`p-3.5 rounded-lg border text-left transition-all relative ${
            preset === 'minimal'
              ? 'border-primary bg-primary-subtle dark:bg-primary-darkSubtle/40 ring-1 ring-primary'
              : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700 bg-surface-50/50 dark:bg-surface-950/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-surface-900 dark:text-surface-100">
              Minimal Essentials Only
            </span>
            {preset === 'minimal' && (
              <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
          <p className="text-[11px] text-surface-500 dark:text-surface-400 leading-relaxed">
            Lightweight pack: <code className="font-mono">favicon.ico</code>, <code className="font-mono">apple-touch-icon.png</code>, 16/32 PNGs and simple HTML.
          </p>
        </button>

        {/* Custom Preset */}
        <button
          type="button"
          onClick={() => setPreset('custom')}
          className={`p-3.5 rounded-lg border text-left transition-all relative ${
            preset === 'custom'
              ? 'border-primary bg-primary-subtle dark:bg-primary-darkSubtle/40 ring-1 ring-primary'
              : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700 bg-surface-50/50 dark:bg-surface-950/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-surface-600 dark:text-surface-300" />
              <span className="text-xs font-bold text-surface-900 dark:text-surface-100">
                Select Manually
              </span>
            </div>
            {preset === 'custom' && (
              <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
          <p className="text-[11px] text-surface-500 dark:text-surface-400 leading-relaxed">
            Fine-grained checklist: choose specific target platforms and asset categories.
          </p>
        </button>
      </div>

      {/* Manual Selection Accordion */}
      {preset === 'custom' && (
        <div className="pt-3 border-t border-surface-200 dark:border-surface-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
              Active Category Selection
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => selectAllCategories(true)}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Select All
              </button>
              <span className="text-surface-300 dark:text-surface-700">•</span>
              <button
                type="button"
                onClick={() => selectAllCategories(false)}
                className="text-[11px] text-surface-500 hover:underline font-medium"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <label
              onClick={() => toggleCategory('standard_favicons')}
              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 cursor-pointer text-xs select-none"
            >
              {customCategories.standard_favicons ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-surface-400 shrink-0" />
              )}
              <div>
                <span className="font-medium text-surface-900 dark:text-surface-100">
                  Standard Favicons
                </span>
                <p className="text-[10px] text-surface-500 font-mono">.ico, 16x16, 32x32, 48x48</p>
              </div>
            </label>

            <label
              onClick={() => toggleCategory('apple_ios')}
              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 cursor-pointer text-xs select-none"
            >
              {customCategories.apple_ios ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-surface-400 shrink-0" />
              )}
              <div>
                <span className="font-medium text-surface-900 dark:text-surface-100">
                  Apple iOS & Safari
                </span>
                <p className="text-[10px] text-surface-500 font-mono">apple-touch-icon, pinned-tab.svg</p>
              </div>
            </label>

            <label
              onClick={() => toggleCategory('android_pwa')}
              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 cursor-pointer text-xs select-none"
            >
              {customCategories.android_pwa ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-surface-400 shrink-0" />
              )}
              <div>
                <span className="font-medium text-surface-900 dark:text-surface-100">
                  Android & PWA
                </span>
                <p className="text-[10px] text-surface-500 font-mono">192x192, 512x512, webmanifest</p>
              </div>
            </label>

            <label
              onClick={() => toggleCategory('windows_tiles')}
              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 cursor-pointer text-xs select-none"
            >
              {customCategories.windows_tiles ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-surface-400 shrink-0" />
              )}
              <div>
                <span className="font-medium text-surface-900 dark:text-surface-100">
                  Windows Microsoft Tiles
                </span>
                <p className="text-[10px] text-surface-500 font-mono">mstile-* & browserconfig.xml</p>
              </div>
            </label>

            <label
              onClick={() => toggleCategory('social_cards')}
              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 cursor-pointer text-xs select-none"
            >
              {customCategories.social_cards ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-surface-400 shrink-0" />
              )}
              <div>
                <span className="font-medium text-surface-900 dark:text-surface-100">
                  Social & WhatsApp Share Cards
                </span>
                <p className="text-[10px] text-surface-500 font-mono">og-image.png, twitter-image.png</p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
