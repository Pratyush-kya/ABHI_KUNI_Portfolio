import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SongCatalog from '@/components/SongCatalog';
import ContactSection from '@/components/ContactSection';
import type { Song } from '@/types/song';
import { Sparkles, Music2 } from 'lucide-react';

export const revalidate = 60; // ISR cache revalidation every 60s for ultra-fast performance

async function getAllSongs(): Promise<Song[]> {
  const { data } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export default async function HomePage() {
  const songs = await getAllSongs();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Section with Ambient Warm Aura */}
      <section className="relative text-center mb-12 sm:mb-16 pt-4 pb-8 overflow-hidden rounded-3xl">
        {/* Warm Ambient Glow behind hero title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-96 h-96 rounded-full bg-amber-500/15 blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium text-xs uppercase tracking-widest mb-4 font-ui shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Abinash Rath · ଅବିନାଶ ରଥ</span>
        </div>

        <h1 className="font-odia font-bold text-4xl sm:text-6xl text-zinc-50 mb-4 leading-tight tracking-tight drop-shadow-sm">
          ଓଡ଼ିଆ ଗୀତ ସଂଗ୍ରହ
        </h1>

        <p className="text-zinc-300 text-base sm:text-lg max-w-xl mx-auto font-ui leading-relaxed">
          A soulful collection of modern and spiritual Odia lyrics, poems, and musical compositions.
        </p>
      </section>

      {/* Multi-Functional Timeline Catalog (Low Latency Instant Search & Filter) */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-amber-500" />
            <h2 className="font-ui font-semibold text-xl sm:text-2xl text-zinc-50">
              Song Library & Archive
            </h2>
          </div>
        </div>

        <SongCatalog songs={songs} />
      </section>

      {/* Contact & Collaboration Hub */}
      <ContactSection />
    </div>
  );
}
