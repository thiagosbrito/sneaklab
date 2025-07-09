import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
};

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, className, fallback }) => {
  if (!src) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
        <ImageIcon className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
    }
  };

  return (
    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className={className || 'w-full h-full object-cover rounded-lg'}
        onError={handleError}
      />
    </div>
  );
};

export default ImageWithFallback;
