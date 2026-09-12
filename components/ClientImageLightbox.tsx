'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function ClientImageLightbox({ src, alt }: { src: string; alt: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden mb-8 cursor-zoom-in group border border-zinc-800 transition-all hover:border-zinc-700 hover:shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        <Image src={src} alt={alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-white font-ui font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm transition-opacity duration-300">
            View Full Image
          </span>
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 cursor-zoom-out"
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-full text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-7xl h-[80vh]">
            <Image src={src} alt={alt} fill className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
