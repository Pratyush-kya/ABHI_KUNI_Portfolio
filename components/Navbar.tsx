'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav className="no-print fixed top-0 inset-x-0 z-50 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" prefetch={true} className="flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-50 cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500/25 transition-colors">
            <Music2 className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-ui">ABHI-KUNI</span>
          <span className="hidden sm:inline-block text-[11px] font-odia px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            ଓଡ଼ିଆ ସଂଗୀତ
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/browse"
            prefetch={true}
            className="text-xs sm:text-sm font-ui font-medium text-zinc-300 hover:text-amber-400 transition-colors duration-200 cursor-pointer"
          >
            All Songs Archive
          </Link>
          <a
            href="https://wa.me/?text=Hello%20Abinash%20Rath,%20I%20would%20like%20to%20connect%20regarding%20music%20lyrics."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-amber-400 border border-amber-500/30 text-xs font-ui font-medium transition-all"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}
