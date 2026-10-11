import { supabase } from '@/lib/supabase';
import SongCatalog from '@/components/SongCatalog';
import ContactSection from '@/components/ContactSection';
import type { Song } from '@/types/song';
import Link from 'next/link';
import { ArrowLeft, Library } from 'lucide-react';

export const revalidate = 60;

async function getAllSongs(): Promise<Song[]> {
  const { data } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export default async function BrowsePage() {
  const songs = await getAllSongs();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-ui text-zinc-400 hover:text-amber-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <div className="flex items-center gap-2.5">
          <Library className="w-6 h-6 text-amber-500" />
          <h1 className="font-ui font-bold text-3xl sm:text-4xl text-zinc-50 tracking-tight">
            All Songs Archive
          </h1>
        </div>
        <p className="font-ui text-sm text-zinc-400 mt-1">
          Explore complete collection filtered by year, month, category, and keywords.
        </p>
      </div>

      {/* Multi-Functional Catalog */}
      <SongCatalog songs={songs} />

      {/* Contact Banner */}
      <ContactSection />
    </div>
  );
}
