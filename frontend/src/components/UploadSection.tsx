import React, { useRef, useState } from 'react';
import { Upload, X, Sparkles, Image as ImageIcon, Check } from 'lucide-react';

interface UploadSectionProps {
  squareFile: File | null;
  setSquareFile: (file: File | null) => void;
  squarePreview: string | null;
  setSquarePreview: (preview: string | null) => void;
  horizontalFile: File | null;
  setHorizontalFile: (file: File | null) => void;
  horizontalPreview: string | null;
  setHorizontalPreview: (preview: string | null) => void;
  onProceed?: () => void;
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
    reader.onload = (e) => {
      setSquarePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleHorizontalSelect = (file: File) => {
    setHorizontalFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setHorizontalPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSquare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSquareFile(null);
    setSquarePreview(null);
    if (squareInputRef.current) {
      squareInputRef.current.value = '';
    }
  };

  const handleRemoveHorizontal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHorizontalFile(null);
    setHorizontalPreview(null);
    if (horizontalInputRef.current) {
      horizontalInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center min-h-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch h-full min-h-0">
        {/* Bento Box 1: 1:1 Master Icon */}
        <div
          onClick={() => !squarePreview && squareInputRef.current?.click()}
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
          className={`group relative bg-[#d7f7f6] rounded-[32px] p-6 sm:p-8 border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between shadow-2xl cursor-pointer animate-slide-in-left h-full min-h-0 ${
            isSquareDragging
              ? 'border-[#004643] ring-2 ring-[#004643]/30 bg-white scale-[1.012]'
              : 'border-[#004643]/20 hover:border-[#004643]/50 hover:-translate-y-1 hover:shadow-2xl'
          }`}
        >
          <input
            ref={squareInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleSquareSelect(e.target.files[0]);
            }}
          />

          {/* Visual Canvas Area */}
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            {squarePreview ? (
              <div className="relative group/preview animate-spring-pop">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-white border border-[#004643]/20 shadow-md flex items-center justify-center p-3 transition-transform duration-300 group-hover/preview:scale-105">
                  <img
                    src={squarePreview}
                    alt="Square master icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveSquare}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#d7f7f6] shadow-md border border-[#004643]/30 text-[#004643] hover:text-black hover:bg-white flex items-center justify-center transition-all duration-200 hover:scale-115 hover:rotate-90 active:scale-90 cursor-pointer z-20"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#004643] text-[#d7f7f6] flex items-center justify-center shadow-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSquareDragging
                      ? '-translate-y-2.5 scale-110 shadow-xl'
                      : 'group-hover:scale-105 group-hover:-translate-y-1'
                  }`}
                >
                  <Upload className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="text-xs font-semibold text-[#004643] bg-white/70 px-4 py-1.5 rounded-full border border-[#004643]/15 transition-all duration-200 group-hover:bg-white group-hover:shadow-sm">
                  Drop 1:1 image or browse
                </span>
              </div>
            )}
          </div>

          {/* Bottom Headline & Tag */}
          <div className="pt-3 border-t border-[#004643]/15 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#004643]">
                  App Icon
                </h3>
                {squareFile && (
                  <span className="w-5 h-5 rounded-full bg-[#004643] text-[#d7f7f6] flex items-center justify-center text-[10px] animate-checkmark-pop shadow-sm">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-xs text-[#004643]/80 mt-0.5">
                Master icon for tabs & app stores
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#004643]/10 text-[#004643] border border-[#004643]/20 transition-all duration-200 group-hover:scale-105">
              1:1
            </span>
          </div>
        </div>

        {/* Bento Box 2: 1.91:1 Horizontal Banner */}
        <div
          onClick={() => !horizontalPreview && horizontalInputRef.current?.click()}
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
          className={`group relative bg-[#d7f7f6] rounded-[32px] p-6 sm:p-8 border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between shadow-2xl cursor-pointer animate-slide-in-right h-full min-h-0 ${
            isHorizontalDragging
              ? 'border-[#004643] ring-2 ring-[#004643]/30 bg-white scale-[1.012]'
              : 'border-[#004643]/20 hover:border-[#004643]/50 hover:-translate-y-1 hover:shadow-2xl'
          }`}
        >
          <input
            ref={horizontalInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleHorizontalSelect(e.target.files[0]);
            }}
          />

          {/* Visual Canvas Area */}
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            {horizontalPreview ? (
              <div className="relative group/preview w-full max-w-[280px] sm:max-w-[320px] animate-spring-pop">
                <div className="w-full aspect-[1.91/1] rounded-2xl overflow-hidden bg-white border border-[#004643]/20 shadow-md flex items-center justify-center p-2 transition-transform duration-300 group-hover/preview:scale-105">
                  <img
                    src={horizontalPreview}
                    alt="Social banner preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveHorizontal}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#d7f7f6] shadow-md border border-[#004643]/30 text-[#004643] hover:text-black hover:bg-white flex items-center justify-center transition-all duration-200 hover:scale-115 hover:rotate-90 active:scale-90 cursor-pointer z-20"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#004643]/10 text-[#004643] flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isHorizontalDragging
                      ? '-translate-y-2.5 scale-110 shadow-xl bg-[#004643] text-[#d7f7f6]'
                      : 'group-hover:scale-105 group-hover:-translate-y-1'
                  }`}
                >
                  <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#004643] bg-white/70 px-4 py-1.5 rounded-full border border-[#004643]/15 transition-all duration-200 group-hover:bg-white group-hover:shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#004643]" />
                  <span>Auto-generated if empty</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Headline & Tag */}
          <div className="pt-3 border-t border-[#004643]/15 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#004643]">
                  Social Banner
                </h3>
                {horizontalFile && (
                  <span className="w-5 h-5 rounded-full bg-[#004643] text-[#d7f7f6] flex items-center justify-center text-[10px] animate-checkmark-pop shadow-sm">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-xs text-[#004643]/80 mt-0.5">
                For Twitter, WhatsApp & OpenGraph
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#004643]/10 text-[#004643] border border-[#004643]/20 transition-all duration-200 group-hover:scale-105">
              1.91:1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
