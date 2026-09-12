'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav className="no-print fixed top-0 inset-x-0 z-50 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-50 cursor-pointer">
          <Music2 className="w-5 h-5 text-accent-dark" />
          <span>ABHI-KUNI</span>
        </Link>

        <Link
          href="/browse"
          className="text-sm font-ui font-medium text-zinc-400 hover:text-accent-dark transition-colors duration-200 cursor-pointer"
        >
          All Songs →
        </Link>
      </div>
    </nav>
  );
}
