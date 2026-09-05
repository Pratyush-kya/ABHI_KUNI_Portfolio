'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const CATEGORIES = [
  { label: 'ଗୀତ', href: '/browse?category=ଗୀତ' },
  { label: 'ଭଜନ', href: '/browse?category=ଭଜନ' },
  { label: 'ଲୋକ', href: '/browse?category=ଲୋକ' },
  { label: 'ସବୁ', href: '/browse' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <nav className="no-print fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50 cursor-pointer">
          <Music2 className="w-5 h-5 text-accent dark:text-accent-dark" />
          <span>ABHI-KUNI</span>
        </Link>

        {/* Category links — hidden on small screens */}
        <div className="hidden sm:flex items-center gap-1">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="px-3 py-1.5 rounded-md text-sm font-odia font-medium text-zinc-600 dark:text-zinc-400 hover:text-accent dark:hover:text-accent-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200 cursor-pointer"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        <ThemeToggle />
      </div>
    </nav>
  );
}
