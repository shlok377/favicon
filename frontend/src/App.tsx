import { useState } from 'react';
import { Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { MetadataPanel, type MetadataState } from './components/MetadataPanel';
import { PresetSelector, type PresetType, type CustomCategoriesState } from './components/PresetSelector';
import { LiveMockups } from './components/LiveMockups';
import { EmbedCodeViewer } from './components/EmbedCodeViewer';
import { AssetSummaryGrid } from './components/AssetSummaryGrid';

export default function App() {
  // Image Upload State
  const [squareFile, setSquareFile] = useState<File | null>(null);
  const [squarePreview, setSquarePreview] = useState<string | null>(null);
  const [horizontalFile, setHorizontalFile] = useState<File | null>(null);
  const [horizontalPreview, setHorizontalPreview] = useState<string | null>(null);

  // Metadata State
  const [metadata, setMetadata] = useState<MetadataState>({
    appName: 'My Web App',
    shortName: 'App',
    themeColor: '#2563eb',
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

  // Generation & Status State
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!squareFile) {
      setErrorMessage('Please upload a square master icon to generate assets.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGenerating(true);

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

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Generation failed' }));
        throw new Error(errData.detail || 'Failed to generate favicons');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${metadata.shortName.toLowerCase().replace(/\s+/g, '-')}-favicons.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSuccessMessage('Favicon bundle generated and downloaded successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-800 dark:text-surface-100 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Alerts */}
        {errorMessage && (
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-sm">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. Upload Section */}
        <UploadSection
          squareFile={squareFile}
          setSquareFile={setSquareFile}
          squarePreview={squarePreview}
          setSquarePreview={setSquarePreview}
          horizontalFile={horizontalFile}
          setHorizontalFile={setHorizontalFile}
          horizontalPreview={horizontalPreview}
          setHorizontalPreview={setHorizontalPreview}
        />

        {/* 2. Metadata Panel */}
        <MetadataPanel metadata={metadata} setMetadata={setMetadata} />

        {/* 3. Output Preset Selection */}
        <PresetSelector
          preset={preset}
          setPreset={setPreset}
          customCategories={customCategories}
          setCustomCategories={setCustomCategories}
        />

        {/* 4. Live Previews */}
        <LiveMockups
          squarePreview={squarePreview}
          horizontalPreview={horizontalPreview}
          metadata={metadata}
        />

        {/* 5. Embed Snippets */}
        <EmbedCodeViewer metadata={metadata} preset={preset} />

        {/* 6. Bundle Summary */}
        <AssetSummaryGrid preset={preset} customCategories={customCategories} />

        {/* Bottom Download Bar */}
        <div className="sticky bottom-4 z-20">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <p className="text-xs font-semibold text-surface-900 dark:text-surface-100">
                  {squareFile ? `${squareFile.name} ready` : 'Awaiting square master icon'}
                </p>
                <p className="text-[11px] text-surface-500">
                  {preset === 'standard' ? 'Full Suite' : preset === 'minimal' ? 'Minimal Pack' : 'Custom Pack'} • Flat structure for public/
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !squareFile}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-sm ${
                !squareFile
                  ? 'bg-surface-200 dark:bg-surface-800 text-surface-400 dark:text-surface-600 cursor-not-allowed'
                  : isGenerating
                  ? 'bg-primary/80 text-white cursor-wait'
                  : 'bg-primary hover:bg-primary-hover text-white active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Assets...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generate & Download ZIP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-surface-200 dark:border-surface-800 py-4 text-center text-xs text-surface-500">
        Favicon & Social Asset Generator • Built for Vibe Coders
      </footer>
    </div>
  );
}
