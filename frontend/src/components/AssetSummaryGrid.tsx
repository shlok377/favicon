import { FileText, Image as ImageIcon, Sparkles } from 'lucide-react';
import type { CustomCategoriesState, PresetType } from './PresetSelector';

interface AssetSummaryGridProps {
  preset: PresetType;
  customCategories: CustomCategoriesState;
}

export function AssetSummaryGrid({ preset, customCategories }: AssetSummaryGridProps) {
  const assets: { name: string; size: string; category: string; description: string }[] = [];

  const includeStandard =
    preset === 'standard' ||
    preset === 'minimal' ||
    (preset === 'custom' && customCategories.standard_favicons);

  const includeApple =
    preset === 'standard' ||
    preset === 'minimal' ||
    (preset === 'custom' && customCategories.apple_ios);

  const includeAndroid =
    preset === 'standard' ||
    (preset === 'custom' && customCategories.android_pwa);

  const includeWindows =
    preset === 'standard' ||
    (preset === 'custom' && customCategories.windows_tiles);

  const includeSocial =
    preset === 'standard' ||
    (preset === 'custom' && customCategories.social_cards);

  if (includeStandard) {
    assets.push(
      { name: 'favicon.ico', size: '16/32/48', category: 'Browser', description: 'Multi-layer legacy and modern tab icon' },
      { name: 'favicon-16x16.png', size: '16×16', category: 'Browser', description: 'Standard resolution browser tab icon' },
      { name: 'favicon-32x32.png', size: '32×32', category: 'Browser', description: 'Retina/HiDPI browser tab icon' },
      { name: 'favicon-48x48.png', size: '48×48', category: 'Browser', description: 'Desktop shortcut / bookmark icon' },
      { name: 'favicon-96x96.png', size: '96×96', category: 'Browser', description: 'High-DPI Android/desktop favicon' },
      { name: 'favicon-128.png', size: '128×128', category: 'Browser', description: 'Chrome Web Store & desktop icon' },
      { name: 'favicon-196x196.png', size: '196×196', category: 'Browser', description: 'Android home screen legacy icon' },
    );
  }

  if (includeApple) {
    assets.push(
      { name: 'apple-touch-icon.png', size: '180×180', category: 'Apple iOS', description: 'iOS Home Screen bookmark icon' },
      { name: 'apple-touch-icon-precomposed.png', size: '180×180', category: 'Apple iOS', description: 'Precomposed iOS icon' },
      { name: 'apple-touch-icon-152x152.png', size: '152×152', category: 'Apple iOS', description: 'iPad Retina touch icon' },
      { name: 'apple-touch-icon-144x144.png', size: '144×144', category: 'Apple iOS', description: 'iPad Retina legacy touch icon' },
      { name: 'apple-touch-icon-120x120.png', size: '120×120', category: 'Apple iOS', description: 'iPhone Retina touch icon' },
      { name: 'apple-touch-icon-114x114.png', size: '114×114', category: 'Apple iOS', description: 'iPhone Retina legacy icon' },
      { name: 'apple-touch-icon-76x76.png', size: '76×76', category: 'Apple iOS', description: 'iPad touch icon' },
      { name: 'apple-touch-icon-72x72.png', size: '72×72', category: 'Apple iOS', description: 'iPad legacy touch icon' },
      { name: 'apple-touch-icon-60x60.png', size: '60×60', category: 'Apple iOS', description: 'iPhone touch icon' },
      { name: 'apple-touch-icon-57x57.png', size: '57×57', category: 'Apple iOS', description: 'Classic iPhone touch icon' },
      { name: 'safari-pinned-tab.svg', size: 'Vector', category: 'Safari', description: 'Monochrome pinned tab & touchbar mask' },
    );
  }

  if (includeAndroid) {
    assets.push(
      { name: 'android-chrome-192x192.png', size: '192×192', category: 'Android / PWA', description: 'Android launcher & splash icon' },
      { name: 'android-chrome-512x512.png', size: '512×512', category: 'Android / PWA', description: 'PWA high-res splash icon' },
      { name: 'site.webmanifest', size: 'JSON', category: 'Android / PWA', description: 'Web app manifest configuration' },
    );
  }

  if (includeWindows) {
    assets.push(
      { name: 'mstile-70x70.png', size: '70×70', category: 'Windows', description: 'Small Start Menu tile' },
      { name: 'mstile-144x144.png', size: '144×144', category: 'Windows', description: 'Windows 8 IE10 tile' },
      { name: 'mstile-150x150.png', size: '150×150', category: 'Windows', description: 'Medium Start Menu tile' },
      { name: 'mstile-310x150.png', size: '310×150', category: 'Windows', description: 'Wide Start Menu banner tile' },
      { name: 'mstile-310x310.png', size: '310×310', category: 'Windows', description: 'Large Start Menu square tile' },
      { name: 'browserconfig.xml', size: 'XML', category: 'Windows', description: 'IE/Edge tile manifest configuration' },
    );
  }

  if (includeSocial) {
    assets.push(
      { name: 'og-image.png', size: '1200×630', category: 'Social Cards', description: 'WhatsApp, Facebook & LinkedIn share preview' },
      { name: 'twitter-image.png', size: '1200×630', category: 'Social Cards', description: 'Twitter summary large card image' },
    );
  }

  assets.push(
    { name: 'snippet-html.txt', size: 'TXT', category: 'Snippets', description: 'Standard HTML <head> meta tags' },
    { name: 'snippet-nextjs.txt', size: 'TXT', category: 'Snippets', description: 'Next.js App Router metadata configuration' },
    { name: 'snippet-vite.txt', size: 'TXT', category: 'Snippets', description: 'Vite / SPA HTML template & PWA instructions' },
    { name: 'code.txt', size: 'TXT', category: 'Snippets', description: 'Favic-o-matic compatible snippet' },
    { name: 'head-tags.html', size: 'HTML', category: 'Guide', description: 'Pre-formatted embed tags ready to copy' },
    { name: 'README.md', size: 'Markdown', category: 'Guide', description: 'Step-by-step extraction & placement instructions' },
  );

  return (
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-surface-600 dark:text-surface-300" />
          <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-50">
            ZIP Bundle Manifest ({assets.length} items)
          </h3>
        </div>
        <span className="text-xs text-surface-500 font-mono">Flat root structure for public/</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {assets.map((asset) => (
          <div
            key={asset.name}
            className="flex items-start gap-2.5 p-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-950/50"
          >
            <div className="p-1.5 rounded bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 shrink-0 mt-0.5">
              {asset.name.endsWith('.png') || asset.name.endsWith('.ico') || asset.name.endsWith('.svg') ? (
                <ImageIcon className="w-3.5 h-3.5" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-medium text-surface-900 dark:text-surface-100 truncate">
                  {asset.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
                  {asset.size}
                </span>
              </div>
              <p className="text-[11px] text-surface-500 truncate mt-0.5">
                {asset.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
