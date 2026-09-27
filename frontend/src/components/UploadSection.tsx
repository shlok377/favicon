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

interface ImageDropzoneProps {
  stepNumber: number;
  title: string;
  badgeText: string;
  badgeColorClass: string;
  description: React.ReactNode;
  file: File | null;
  preview: string | null;
  onFileSelected: (file: File) => void;
  onFileCleared: () => void;
  previewContainerClass: string;
  emptyTitle: string;
  emptySubtitle: React.ReactNode;
  emptyIcon: React.ReactNode;
}

function ImageDropzone({
  stepNumber,
  title,
  badgeText,
  badgeColorClass,
  description,
  file,
  preview,
  onFileSelected,
  onFileCleared,
  previewContainerClass,
  emptyTitle,
  emptySubtitle,
  emptyIcon,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 text-xs font-bold">
              {stepNumber}
            </span>
            <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-50">
              {title}
            </h3>
          </div>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded font-mono ${badgeColorClass}`}>
            {badgeText}
          </span>
        </div>
        <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">
          {description}
        </p>
      </div>

      {preview ? (
        <div className="relative border border-surface-200 dark:border-surface-700 rounded-lg p-4 bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center min-h-[160px]">
          <button
            type="button"
            onClick={onFileCleared}
            className="absolute top-2 right-2 p-1 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-white"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
          <div className={`overflow-hidden border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 flex items-center justify-center shadow-sm ${previewContainerClass}`}>
            <img
              src={preview}
              alt="Image preview"
              className="w-full h-full object-contain p-1"
            />
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>{file?.name}</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) onFileSelected(e.dataTransfer.files[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[160px] ${
            isDragging
              ? 'border-primary bg-primary-subtle dark:bg-primary-darkSubtle'
              : 'border-surface-300 dark:border-surface-700 hover:border-surface-400 dark:hover:border-surface-600 bg-surface-50/50 dark:bg-surface-950/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) onFileSelected(e.target.files[0]);
            }}
          />
          <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-600 dark:text-surface-300 mb-2">
            {emptyIcon}
          </div>
          <p className="text-xs font-medium text-surface-800 dark:text-surface-200">
            {emptyTitle}
          </p>
          {emptySubtitle}
        </div>
      )}
    </div>
  );
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
      <ImageDropzone
        stepNumber={1}
        title="Square Master Icon (1:1)"
        badgeText="Required"
        badgeColorClass="bg-primary/10 text-primary"
        description={
          <>
            Used for <code className="text-surface-700 dark:text-surface-300 font-mono">favicon.ico</code>, Apple Touch Icon (180x180), Android/PWA, and browser tabs.
          </>
        }
        file={squareFile}
        preview={squarePreview}
        onFileSelected={handleSquareSelect}
        onFileCleared={() => {
          setSquareFile(null);
          setSquarePreview(null);
        }}
        previewContainerClass="w-20 h-20 rounded-xl"
        emptyTitle="Click or drag & drop square image"
        emptySubtitle={
          <p className="text-[11px] text-surface-400 mt-1 font-mono">
            PNG, JPG, WebP, SVG (min 512x512 recommended)
          </p>
        }
        emptyIcon={<Upload className="w-5 h-5" />}
      />

      <ImageDropzone
        stepNumber={2}
        title="Horizontal / Social Banner (~1.91:1)"
        badgeText="Optional"
        badgeColorClass="bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400"
        description={
          <>
            Used for WhatsApp chat previews, OpenGraph <code className="font-mono">og:image</code>, Twitter cards, and Windows wide tiles.
          </>
        }
        file={horizontalFile}
        preview={horizontalPreview}
        onFileSelected={handleHorizontalSelect}
        onFileCleared={() => {
          setHorizontalFile(null);
          setHorizontalPreview(null);
        }}
        previewContainerClass="w-44 h-20 rounded-lg"
        emptyTitle="Click or drag & drop horizontal banner"
        emptySubtitle={
          <div className="mt-1 flex items-center gap-1 text-[11px] text-surface-500 dark:text-surface-400">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Auto-generated from square icon if left empty</span>
          </div>
        }
        emptyIcon={<ImageIcon className="w-5 h-5" />}
      />
    </div>
  );
}
