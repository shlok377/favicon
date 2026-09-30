import { useState, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { MetadataPanel, type MetadataState } from './components/MetadataPanel';
import { PresetSelector, type PresetType, type CustomCategoriesState } from './components/PresetSelector';
import { LiveMockups } from './components/LiveMockups';
import { EmbedCodeViewer } from './components/EmbedCodeViewer';
import { generateFaviconBundleInBrowser } from './utils/clientGenerator';

export default function App() {
  // Stage State
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [maxUnlockedStage, setMaxUnlockedStage] = useState<number>(1);

  // Image Upload State
  const [squareFile, setSquareFile] = useState<File | null>(null);
  const [squarePreview, setSquarePreview] = useState<string | null>(null);
  const [horizontalFile, setHorizontalFile] = useState<File | null>(null);
  const [horizontalPreview, setHorizontalPreview] = useState<string | null>(null);

  // Metadata State
  const [metadata, setMetadata] = useState<MetadataState>({
    appName: 'My Web App',
    shortName: 'App',
    themeColor: '#004643',
    backgroundColor: '#ffffff',
    siteUrl: 'https://example.com',
    description: 'Modern web application with full favicon & social share asset support.',
  });

  // Preset State
  const [preset, setPreset] = useState<PresetType>('standard');
  const [customCategories, setCustomCategories] = useState<CustomCategoriesState>({
    standard_favicons: true,
    apple_ios: true,
    android_pwa: true,
    windows_tiles: true,
    social_cards: true,
  });

  // Pre-generated bundle cache & Status
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cachedZipBlob, setCachedZipBlob] = useState<Blob | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const generationPromiseRef = useRef<Promise<Blob | null> | null>(null);

  // Synchronize square icon requirement alert:
  // Appears after uploading rectangle image (before uploading square one)
  // Disappears as soon as square image is uploaded
  useEffect(() => {
    if (currentStage === 1) {
      if (horizontalFile && !squareFile) {
        setErrorMessage('Please upload a square master icon first.');
      } else if (squareFile) {
        setErrorMessage((prev) => (prev === 'Please upload a square master icon first.' ? null : prev));
      } else if (!horizontalFile && !squareFile) {
        setErrorMessage((prev) => (prev === 'Please upload a square master icon first.' ? null : prev));
      }
    }
  }, [squareFile, horizontalFile, currentStage]);

  // Helper to trigger browser download
  const triggerDownload = (blob: Blob) => {
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${(metadata.shortName || 'app').toLowerCase().replace(/\s+/g, '-')}-favicons.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Keep object URL valid briefly for browser download manager
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
    }, 1000);

    setHasDownloaded(true);
    setSuccessMessage('Favicon bundle downloaded successfully!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Trigger background generation
  const startBackgroundGeneration = async (): Promise<Blob | null> => {
    if (!squareFile) return null;
    setIsGenerating(true);
    setErrorMessage(null);

    const promise = (async () => {
      try {
        let blob: Blob | null = null;

        const isLocalHost =
          typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           window.location.port === '1937');

        // Only attempt local backend API if actually running locally in desktop daemon
        if (isLocalHost) {
          try {
            const formData = new FormData();
            formData.append('square_image', squareFile);
            if (horizontalFile) {
              formData.append('horizontal_image', horizontalFile);
            }
            formData.append('app_name', metadata.appName);
            formData.append('short_name', metadata.shortName);
            formData.append('theme_color', metadata.themeColor);
            formData.append('background_color', metadata.backgroundColor);
            formData.append('site_url', metadata.siteUrl);
            formData.append('description', metadata.description);
            formData.append('preset', preset);

            if (preset === 'custom') {
              formData.append('custom_categories_json', JSON.stringify(customCategories));
            }

            const response = await fetch('/api/generate', {
              method: 'POST',
              body: formData,
            });

            const contentType = response.headers.get('content-type') || '';
            // Ensure response is actually a zip archive and NOT an HTML SPA fallback page
            if (response.ok && contentType.toLowerCase().includes('zip')) {
              blob = await response.blob();
            }
          } catch {
            // Local API unreachable
          }
        }

        // When running on web (Firebase Hosting) or if local daemon is not running, generate directly in browser
        if (!blob) {
          blob = await generateFaviconBundleInBrowser({
            squareFile,
            horizontalFile,
            metadata,
            preset,
            customCategories,
          });
        }

        setCachedZipBlob(blob);
        return blob;
      } catch (err: any) {
        setErrorMessage(err.message || 'An unexpected error occurred during generation.');
        return null;
      } finally {
        setIsGenerating(false);
      }
    })();

    generationPromiseRef.current = promise;
    return promise;
  };

  // Stage 1 -> Stage 2
  const handleProceedToCustomize = () => {
    if (!squareFile) {
      setErrorMessage('Please upload a square master icon first.');
      return;
    }
    setErrorMessage(null);
    setCurrentStage(2);
    setMaxUnlockedStage((prev) => Math.max(prev, 2));
  };

  // Stage 2 -> Stage 3 ("Cook Now!"): cooks assets & auto-downloads once ready
  const handleCookNow = async () => {
    if (!squareFile) {
      setErrorMessage('Please upload a square master icon before cooking assets.');
      return;
    }
    setErrorMessage(null);
    setCurrentStage(3);
    setMaxUnlockedStage(3);

    // Pre-generate in background and auto-download as soon as cooked
    const blob = await startBackgroundGeneration();
    if (blob) {
      triggerDownload(blob);
    }
  };

  // Stage 3 Download Click (manual download / re-download)
  const handleDownloadZip = async () => {
    let blob = cachedZipBlob;

    if (!blob && isGenerating && generationPromiseRef.current) {
      blob = await generationPromiseRef.current;
    } else if (!blob && !isGenerating) {
      blob = await startBackgroundGeneration();
    }

    if (!blob) return;

    triggerDownload(blob);
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#004643] text-[#004643] flex flex-col justify-between selection:bg-[#d7f7f6] selection:text-[#004643] transition-colors duration-300 p-3 sm:p-5">
      <main className="relative flex-1 min-h-0 w-full max-w-6xl mx-auto flex flex-col justify-center items-center overflow-hidden py-1">
        {/* Floating alerts dropping smoothly from Dynamic Island with spring bounce */}
        {errorMessage && (
          <div className="absolute top-1 z-30 px-4 py-2 rounded-2xl border border-rose-300 bg-rose-50 flex items-center gap-2.5 text-rose-800 text-xs animate-island-alert shadow-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="absolute top-1 z-30 px-4 py-2 rounded-2xl border border-[#004643]/30 bg-[#d7f7f6] flex items-center gap-2.5 text-[#004643] text-xs animate-island-alert shadow-xl">
            <CheckCircle className="w-4 h-4 text-[#004643] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STAGE 1: Bento Boxes with Dual Slide-in Dropzones */}
        {currentStage === 1 && (
          <div className="w-full h-full max-h-[calc(100vh-80px)] flex flex-col justify-center min-h-0 animate-fade-in-scale">
            <UploadSection
              squareFile={squareFile}
              setSquareFile={setSquareFile}
              squarePreview={squarePreview}
              setSquarePreview={setSquarePreview}
              horizontalFile={horizontalFile}
              setHorizontalFile={setHorizontalFile}
              horizontalPreview={horizontalPreview}
              setHorizontalPreview={setHorizontalPreview}
              onProceed={handleProceedToCustomize}
            />
          </div>
        )}

        {/* STAGE 2: Bento Grid (Left: Live Previews, Right: Unified Settings Box - Full Viewport) */}
        {currentStage === 2 && (
          <div className="w-full h-full max-h-[calc(100vh-80px)] flex flex-col justify-center animate-fade-in-scale min-h-0 overflow-hidden">
            {/* 50/50 Bento Box Split with matching gap-4 and height */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch h-full min-h-0 overflow-hidden">
              {/* Left Bento Box: Live Simulated Previews */}
              <div className="h-full min-h-0 overflow-hidden flex flex-col">
                <LiveMockups
                  squarePreview={squarePreview}
                  horizontalPreview={horizontalPreview}
                  metadata={metadata}
                />
              </div>

              {/* Right Bento Box: Settings (App Info & Presets) - Seamless Flow */}
              <div className="bg-[#d7f7f6] border border-[#004643]/20 rounded-[32px] p-5 sm:p-6 shadow-2xl flex flex-col justify-between h-full min-h-0 overflow-y-auto custom-scrollbar">
                <MetadataPanel
                  metadata={metadata}
                  setMetadata={(data) => {
                    setMetadata(data);
                    setCachedZipBlob(null);
                  }}
                />

                <div className="border-t border-[#004643]/15 my-3 shrink-0" />

                <PresetSelector
                  preset={preset}
                  setPreset={(p) => {
                    setPreset(p);
                    setCachedZipBlob(null);
                  }}
                  customCategories={customCategories}
                  setCustomCategories={(c) => {
                    setCustomCategories(c);
                    setCachedZipBlob(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: Hero Single Bento Card (Matching Stage 1 & 2 Width and Height) */}
        {currentStage === 3 && (
          <div className="w-full h-full max-h-[calc(100vh-80px)] flex flex-col justify-center animate-fade-in-scale min-h-0 overflow-hidden">
            <EmbedCodeViewer metadata={metadata} preset={preset} />
          </div>
        )}
      </main>

      {/* Bottom Floating Island Navbar with Stage Actions */}
      <Header
        currentStage={currentStage}
        onSelectStage={(stage) => setCurrentStage(stage)}
        maxUnlockedStage={maxUnlockedStage}
        canContinue={Boolean(squareFile)}
        onContinue={handleProceedToCustomize}
        onCookNow={handleCookNow}
        onDownload={handleDownloadZip}
        isGenerating={isGenerating}
        hasDownloaded={hasDownloaded}
      />
    </div>
  );
}
