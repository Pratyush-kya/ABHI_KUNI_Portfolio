'use client';
import { Share2, Printer, Link2, Check } from 'lucide-react';
import { useState } from 'react';

export default function SharePrintButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="no-print flex items-center gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-ui text-zinc-600 dark:text-zinc-300 hover:border-accent dark:hover:border-accent-dark hover:text-accent dark:hover:text-accent-dark transition-colors duration-200 cursor-pointer"
      >
        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
        {copied ? 'Link Copied!' : 'Share'}
      </button>

      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-ui text-zinc-600 dark:text-zinc-300 hover:border-accent dark:hover:border-accent-dark hover:text-accent dark:hover:text-accent-dark transition-colors duration-200 cursor-pointer"
      >
        <Printer className="w-4 h-4" />
        Print / PDF
      </button>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-ui text-zinc-600 dark:text-zinc-300 hover:border-accent dark:hover:border-accent-dark hover:text-accent dark:hover:text-accent-dark transition-colors duration-200 cursor-pointer"
      >
        <Link2 className="w-4 h-4" />
        Share on X
      </a>
    </div>
  );
}
