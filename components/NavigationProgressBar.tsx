'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    // When pathname changes, navigation has finished!
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Only trigger for internal links that navigate away from current path
      if (
        href.startsWith('/') &&
        !href.startsWith('/#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        href !== pathname &&
        target.target !== '_blank'
      ) {
        startTransition(() => {
          setIsNavigating(true);
        });
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, [pathname]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] pointer-events-none h-[2.5px] bg-zinc-950/20">
      <div className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse w-full transition-all duration-300" />
    </div>
  );
}
