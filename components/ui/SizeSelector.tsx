"use client";

import { useState } from 'react';

interface SizeSelectorProps {
  sizes?: string[];
  selectedSize?: string;
  onSizeChange?: (size: string) => void;
  className?: string;
}

const defaultSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

export default function SizeSelector({ 
  sizes = defaultSizes, 
  selectedSize, 
  onSizeChange,
  className = ""
}: SizeSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedSize || '');

  const handleSizeSelect = (size: string) => {
    setSelected(size);
    onSizeChange?.(size);
  };

  if (sizes.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Tamanho</h3>
        {selected && (
          <span className="text-sm text-gray-600">Selecionado: {selected}</span>
        )}
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => handleSizeSelect(size)}
            className={`
              relative h-12 flex items-center justify-center text-sm font-medium rounded-md border transition-all
              ${selected === size
                ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-200'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            {size}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Guia de tamanhos • Tamanhos em EU
      </p>
    </div>
  );
}