import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Check } from 'lucide-react';

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

  const categories = [
    { key: 'standard_favicons' as const, label: 'Favicons (.ico, png)' },
    { key: 'apple_ios' as const, label: 'Apple Touch Icons' },
    { key: 'android_pwa' as const, label: 'Android & PWA' },
    { key: 'windows_tiles' as const, label: 'Windows Tiles' },
    { key: 'social_cards' as const, label: 'Social Share Cards' },
  ];

  const presetsList: PresetType[] = ['standard', 'minimal', 'custom'];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  const updateSlider = () => {
    const activeIdx = presetsList.indexOf(preset);
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
  }, [preset]);

  useEffect(() => {
    window.addEventListener('resize', updateSlider);
    return () => window.removeEventListener('resize', updateSlider);
  }, [preset]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-bold text-base tracking-tight text-[#004643]">
          Output Preset
        </h4>
      </div>

      {/* Segmented Pill Selector with Liquid Sliding Pill */}
      <div className="relative grid grid-cols-3 p-1 rounded-2xl bg-white/80 border border-[#004643]/20">
        {sliderStyle.ready && (
          <div
            className="absolute top-1 bottom-1 rounded-xl bg-[#004643] shadow-sm pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              left: `${sliderStyle.left}px`,
              width: `${sliderStyle.width}px`,
            }}
          />
        )}

        {presetsList.map((p, idx) => {
          const isActive = preset === p;
          return (
            <button
              key={p}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              type="button"
              onClick={() => setPreset(p)}
              className={`relative z-10 py-1.5 text-xs font-semibold rounded-xl capitalize transition-colors duration-200 select-none ${
                isActive
                  ? 'text-[#d7f7f6]'
                  : 'text-[#004643]/70 hover:text-[#004643]'
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Custom Category Accordion with Spring Transition */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          preset === 'custom'
            ? 'grid-rows-[1fr] opacity-100 mt-2'
            : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-2 border-t border-[#004643]/15 flex flex-wrap gap-1.5">
            {categories.map(({ key, label }) => {
              const isSelected = customCategories[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleCategory(key)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? 'bg-[#004643] text-[#d7f7f6] shadow-sm'
                      : 'bg-white text-[#004643] border border-[#004643]/20 hover:border-[#004643]/50 hover:bg-[#d7f7f6]/40'
                  }`}
                >
                  {isSelected && (
                    <Check className="w-3 h-3 text-[#d7f7f6] animate-checkmark-pop shrink-0" />
                  )}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
