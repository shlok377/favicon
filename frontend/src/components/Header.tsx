import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { ArrowRight, Loader2, Download, Check } from 'lucide-react';

interface HeaderProps {
  currentStage: 1 | 2 | 3;
  onSelectStage: (stage: 1 | 2 | 3) => void;
  maxUnlockedStage: number;
  canContinue: boolean;
  onContinue: () => void;
  onCookNow: () => void;
  onDownload: () => void;
  isGenerating: boolean;
  hasDownloaded: boolean;
}

export function Header({
  currentStage,
  onSelectStage,
  maxUnlockedStage,
  canContinue,
  onContinue,
  onCookNow,
  onDownload,
  isGenerating,
  hasDownloaded,
}: HeaderProps) {
  // 1. Liquid Sliding Stepper Pill state & refs
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  const updateSlider = () => {
    const currentTab = tabRefs.current[currentStage - 1];
    if (currentTab) {
      setSliderStyle({
        left: currentTab.offsetLeft,
        width: currentTab.offsetWidth,
        ready: true,
      });
    }
  };

  useLayoutEffect(() => {
    updateSlider();
  }, [currentStage]);

  useEffect(() => {
    window.addEventListener('resize', updateSlider);
    return () => window.removeEventListener('resize', updateSlider);
  }, [currentStage]);

  // Bouncy Island Morph trigger on stage transition
  const [islandBumping, setIslandBumping] = useState(false);
  const prevStageRef = useRef(currentStage);

  useEffect(() => {
    if (prevStageRef.current !== currentStage) {
      setIslandBumping(true);
      const t = setTimeout(() => setIslandBumping(false), 450);
      prevStageRef.current = currentStage;
      return () => clearTimeout(t);
    }
  }, [currentStage]);

  // 4. Celebratory Spring Bounce trigger on auto-download
  const [celebrating, setCelebrating] = useState(false);
  const prevDownloadedRef = useRef(hasDownloaded);

  useEffect(() => {
    if (hasDownloaded && !prevDownloadedRef.current) {
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), 1400);
      return () => clearTimeout(timer);
    }
    prevDownloadedRef.current = hasDownloaded;
  }, [hasDownloaded]);

  // Compute action button state key for label flip animation
  const actionKey =
    currentStage === 1
      ? `stage1-${canContinue}`
      : currentStage === 2
      ? 'stage2'
      : isGenerating
      ? 'cooking'
      : celebrating
      ? 'celebrating'
      : hasDownloaded
      ? 'download-again'
      : 'download';

  // Action button click handler based on current stage
  const handleActionClick = () => {
    if (currentStage === 1) {
      if (canContinue) onContinue();
    } else if (currentStage === 2) {
      onCookNow();
    } else if (currentStage === 3) {
      if (!isGenerating) onDownload();
    }
  };

  const isActionDisabled = currentStage === 1 ? !canContinue : currentStage === 3 ? isGenerating : false;

  return (
    <nav className="w-full pt-2 pb-1 sm:pb-2 px-4 flex items-center justify-center shrink-0">
      {/* Dynamic Island Capsule with Bouncy Fluid Resizing */}
      <div
        className={`flex items-center gap-2 sm:gap-3 bg-[#d7f7f6] px-3.5 py-1.5 rounded-full border border-[#004643]/20 shadow-2xl transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          islandBumping ? 'animate-island-bounce' : ''
        }`}
      >
        {/* 1. Brand Logo */}
        <div className="flex items-center select-none cursor-pointer" title="Favi">
          <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm shrink-0 transition-transform duration-300 hover:rotate-12 hover:scale-110 active:scale-95 overflow-hidden border border-[#004643]/20 bg-white">
            <img src="/favi.png" alt="Favi Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Spacer / Divider */}
        <div className="w-px h-4 bg-[#004643]/20 shrink-0" />

        {/* 2. Stage Stepper [UPLOAD] [CUSTOMIZE] [EXPORT] with Liquid Sliding Pill */}
        <div className="relative flex items-center gap-1 p-0.5">
          {/* Animated Liquid Background Pill */}
          {sliderStyle.ready && (
            <div
              className="absolute top-0.5 bottom-0.5 rounded-full bg-[#004643] shadow-sm pointer-events-none transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                left: `${sliderStyle.left}px`,
                width: `${sliderStyle.width}px`,
              }}
            />
          )}

          {[1, 2, 3].map((step, idx) => {
            const isActive = currentStage === step;
            const isUnlocked = step <= maxUnlockedStage;
            return (
              <button
                key={step}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                type="button"
                disabled={!isUnlocked}
                onClick={() => isUnlocked && onSelectStage(step as 1 | 2 | 3)}
                className={`relative z-10 h-7 px-3 rounded-full text-xs font-semibold transition-colors duration-200 select-none ${
                  isActive
                    ? 'text-[#d7f7f6]'
                    : isUnlocked
                    ? 'text-[#004643]/70 hover:text-[#004643] cursor-pointer hover:scale-105 active:scale-95'
                    : 'text-[#004643]/30 cursor-not-allowed'
                }`}
              >
                {step === 1 ? 'Upload' : step === 2 ? 'Customize' : 'Export'}
              </button>
            );
          })}
        </div>

        {/* Spacer / Divider */}
        <div className="w-px h-4 bg-[#004643]/20 shrink-0" />

        {/* 3. Dynamic Action Button with Morphing Width, Label Flip, Cooking Pulse, and Celebratory Bounce */}
        <div className="pl-0.5">
          <button
            type="button"
            disabled={isActionDisabled}
            onClick={handleActionClick}
            className={`relative flex items-center justify-center h-7 px-3.5 sm:px-4 rounded-full text-xs font-bold shadow-sm transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] select-none ${
              isActionDisabled
                ? currentStage === 3 && isGenerating
                  ? 'bg-[#004643]/85 text-[#d7f7f6] cursor-wait animate-cooking-pulse'
                  : 'bg-[#004643]/15 text-[#004643]/40 cursor-not-allowed'
                : celebrating
                ? 'bg-[#004643] text-[#d7f7f6] animate-celebrate-bounce cursor-pointer'
                : 'bg-[#004643] hover:bg-[#003331] text-[#d7f7f6] cursor-pointer hover:scale-105 active:scale-95'
            }`}
          >
            {/* Label Flip Container */}
            <div className="overflow-hidden h-4 flex items-center justify-center">
              <span
                key={actionKey}
                className="inline-flex items-center gap-1.5 animate-label-flip whitespace-nowrap"
              >
                {currentStage === 1 && (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}

                {currentStage === 2 && (
                  <>
                    <span>Cook Now!</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}

                {currentStage === 3 && (
                  <>
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Cooking...</span>
                      </>
                    ) : celebrating ? (
                      <>
                        <Check className="w-3 h-3 text-[#d7f7f6]" />
                        <span>Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        <span>{hasDownloaded ? 'Download Again' : 'Download!'}</span>
                      </>
                    )}
                  </>
                )}
              </span>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
