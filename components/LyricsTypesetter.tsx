'use client';

import { useState, useMemo } from 'react';
import { AlignCenter, AlignLeft, ZoomIn, ZoomOut, Copy, Check, BookOpen } from 'lucide-react';

interface LyricsTypesetterProps {
  lyrics: string;
  title: string;
  author: string;
}

export default function LyricsTypesetter({ lyrics, title, author }: LyricsTypesetterProps) {
  const [alignment, setAlignment] = useState<'center' | 'left'>('center');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copied, setCopied] = useState(false);

  // Parse raw text into structured poetic stanzas & verse numbers (LaTeX verse style)
  const stanzas = useMemo(() => {
    if (!lyrics) return [];
    
    // Normalize newlines and split by double newlines or blank lines
    const rawStanzas = lyrics
      .split(/\r?\n\s*\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    return rawStanzas.map((stanzaText, index) => {
      const lines = stanzaText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      
      // Check if last line contains an Odia/Bengali/Arabic verse numeral (e.g., ୧।, ୨।, । ୧ ।, 1., etc.)
      let verseNumber: string | null = null;
      const cleanLines = lines.map((line) => {
        // Regex matching Odia verse markers like "। ୧ ।" or "୧।" or "(୧)" at end of verse
        const match = line.match(/(?:[।|॥\s]*)([୦-୯0-9]+)(?:[।|॥\s]*)$/);
        if (match && !verseNumber) {
          verseNumber = match[1];
          // Strip trailing verse number from line text for clean LaTeX typesetting
          return line.replace(/(?:[।|॥\s]*)([୦-୯0-9]+)(?:[।|॥\s]*)$/, '').trim();
        }
        return line;
      });

      return {
        id: index + 1,
        verseNumber: verseNumber || `${index + 1}`,
        lines: cleanLines.filter(Boolean),
      };
    });
  }, [lyrics]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n- ${author}\n\n${lyrics}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  const fontSizeClasses = {
    normal: 'text-lg sm:text-xl leading-[2.3]',
    large: 'text-xl sm:text-2xl leading-[2.4]',
    xlarge: 'text-2xl sm:text-3xl leading-[2.5]',
  };

  return (
    <div className="space-y-6">
      {/* LaTeX Typesetting Control Toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md backdrop-blur-sm text-xs font-ui">
        {/* Alignment Toggles */}
        <div className="flex items-center gap-1.5 bg-zinc-950/70 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setAlignment('center')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              alignment === 'center'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Classical Centered Poetry Alignment"
          >
            <AlignCenter className="w-3.5 h-3.5" />
            <span>Centered (ଶାସ୍ତ୍ରୀୟ)</span>
          </button>

          <button
            onClick={() => setAlignment('left')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              alignment === 'left'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Book Left-Aligned Typography"
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Book (ପୁସ୍ତକ)</span>
          </button>
        </div>

        {/* Font Size & Copy Actions */}
        <div className="flex items-center gap-2">
          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-zinc-950/70 p-1 rounded-xl border border-zinc-800 text-zinc-400">
            <button
              onClick={() => setFontSize(fontSize === 'xlarge' ? 'large' : 'normal')}
              className="p-1.5 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-semibold text-zinc-300">
              {fontSize === 'normal' ? 'Standard' : fontSize === 'large' ? 'Large' : 'XL'}
            </span>
            <button
              onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'xlarge')}
              className="p-1.5 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
              title="Increase Font Size"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy Lyrics Button */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700/80 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Typeset Poetry Canvas */}
      <div className="relative rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 p-6 sm:p-12 border border-zinc-800/90 shadow-2xl overflow-hidden">
        {/* Subtle Decorative Floral/Ornate Watermark Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Typesetting Header */}
        <div className="text-center mb-8 pb-6 border-b border-zinc-800/80">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-ui mb-3 border border-amber-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>ପଦ୍ୟ ସାହିତ୍ୟ · Odia Poetic Composition</span>
          </div>
          <h2 className="font-odia font-bold text-2xl sm:text-3xl text-zinc-100 tracking-wide">
            {title}
          </h2>
          <p className="font-odia text-xs sm:text-sm text-zinc-400 mt-1">
            ରଚୟିତା: {author}
          </p>
        </div>

        {/* Stanzas Layout */}
        <div className="space-y-8 sm:space-y-10">
          {stanzas.map((stanza) => (
            <div
              key={stanza.id}
              className={`group relative transition-all duration-300 ${
                alignment === 'center' ? 'text-center' : 'text-left sm:pl-8'
              }`}
            >
              {/* Verse Lines */}
              <div
                className={`font-odia text-zinc-100 tracking-wide font-normal ${fontSizeClasses[fontSize]} whitespace-pre-wrap`}
              >
                {stanza.lines.map((line, idx) => (
                  <p key={idx} className="transition-colors group-hover:text-amber-100/90">
                    {line}
                  </p>
                ))}
              </div>

              {/* LaTeX-Style Verse Indicator Badge */}
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-zinc-950/80 border border-amber-500/30 text-amber-400 font-odia text-xs shadow-sm">
                  ॥ {stanza.verseNumber} ॥
                </span>
              </div>

              {/* Decorative Subtle Stanza Divider */}
              <div className="mt-6 flex items-center justify-center gap-2 text-zinc-700/60 text-xs">
                <span>·</span>
                <span className="text-amber-500/30">✦</span>
                <span>·</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Colophon Footer */}
        <div className="mt-12 pt-6 border-t border-zinc-800/80 text-center font-odia text-xs text-zinc-500">
          <p>॥ ସମାପ୍ତ ॥</p>
          <p className="font-ui text-[11px] text-zinc-600 mt-1">
            Typeset with classical Odia poetic alignment · ABHI-KUNI Literary Archive
          </p>
        </div>
      </div>
    </div>
  );
}
