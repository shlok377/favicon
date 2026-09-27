import { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface UploadSectionProps {
  squareFile: File | null;
  setSquareFile: (file: File | null) => void;
  squarePreview: string | null;
  setSquarePreview: (preview: string | null) => void;
  horizontalFile: File | null;
  setHorizontalFile: (file: File | null) => void;
  horizontalPreview: string | null;
  setHorizontalPreview: (preview: string | null) => void;
}

export function UploadSection({
  squareFile,
  setSquareFile,
  squarePreview,
  setSquarePreview,
  horizontalFile,
  setHorizontalFile,
  horizontalPreview,
  setHorizontalPreview,
}: UploadSectionProps) {
  const [isSquareDragging, setIsSquareDragging] = useState(false);
  const [isHorizontalDragging, setIsHorizontalDragging] = useState(false);

  const squareInputRef = useRef<HTMLInputElement>(null);
  const horizontalInputRef = useRef<HTMLInputElement>(null);

  const handleSquareSelect = (file: File) => {
    setSquareFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setSquarePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleHorizontalSelect = (file: File) => {
    setHorizontalFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setHorizontalPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Square Icon Slot (Required) */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 text-xs font-bold">
                1
              </span>
              <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-50">
                Square Master Icon (1:1)
              </h3>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">
              Required
            </span>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">
            Used for <code className="text-surface-700 dark:text-surface-300 font-mono">favicon.ico</code>, Apple Touch Icon (180x180), Android/PWA, and browser tabs.
          </p>
        </div>

        {squarePreview ? (
          <div className="relative border border-surface-200 dark:border-surface-700 rounded-lg p-4 bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center min-h-[160px]">
            <button
              type="button"
              onClick={() => {
                setSquareFile(null);
                setSquarePreview(null);
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-white"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 flex items-center justify-center shadow-sm">
              <img
                src={squarePreview}
                alt="Square preview"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>{squareFile?.name}</span>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsSquareDragging(true);
            }}
            onDragLeave={() => setIsSquareDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsSquareDragging(false);
              if (e.dataTransfer.files?.[0]) handleSquareSelect(e.dataTransfer.files[0]);
            }}
            onClick={() => squareInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[160px] ${
              isSquareDragging
                ? 'border-primary bg-primary-subtle dark:bg-primary-darkSubtle'
                : 'border-surface-300 dark:border-surface-700 hover:border-surface-400 dark:hover:border-surface-600 bg-surface-50/50 dark:bg-surface-950/50'
            }`}
          >
            <input
              ref={squareInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleSquareSelect(e.target.files[0]);
              }}
            />
            <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-600 dark:text-surface-300 mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-surface-800 dark:text-surface-200">
              Click or drag & drop square image
            </p>
            <p className="text-[11px] text-surface-400 mt-1 font-mono">
              PNG, JPG, WebP, SVG (min 512x512 recommended)
            </p>
          </div>
        )}
      </div>

      {/* 2. Horizontal / Social Banner Slot (Optional with Fallback) */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-xs font-bold">
                2
              </span>
              <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-50">
                Horizontal / Social Banner (~1.91:1)
              </h3>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 font-mono">
              Optional
            </span>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">
            Used for WhatsApp chat previews, OpenGraph <code className="font-mono">og:image</code>, Twitter cards, and Windows wide tiles.
          </p>
        </div>

        {horizontalPreview ? (
          <div className="relative border border-surface-200 dark:border-surface-700 rounded-lg p-4 bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center min-h-[160px]">
            <button
              type="button"
              onClick={() => {
                setHorizontalFile(null);
                setHorizontalPreview(null);
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-white"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-44 h-20 rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 flex items-center justify-center shadow-sm">
              <img
                src={horizontalPreview}
                alt="Horizontal preview"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>{horizontalFile?.name}</span>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsHorizontalDragging(true);
            }}
            onDragLeave={() => setIsHorizontalDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsHorizontalDragging(false);
              if (e.dataTransfer.files?.[0]) handleHorizontalSelect(e.dataTransfer.files[0]);
            }}
            onClick={() => horizontalInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[160px] ${
              isHorizontalDragging
                ? 'border-primary bg-primary-subtle dark:bg-primary-darkSubtle'
                : 'border-surface-300 dark:border-surface-700 hover:border-surface-400 dark:hover:border-surface-600 bg-surface-50/50 dark:bg-surface-950/50'
            }`}
          >
            <input
              ref={horizontalInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleHorizontalSelect(e.target.files[0]);
              }}
            />
            <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-600 dark:text-surface-300 mb-2">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-surface-800 dark:text-surface-200">
              Click or drag & drop horizontal banner
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-surface-500 dark:text-surface-400">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Auto-generated from square icon if left empty</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
