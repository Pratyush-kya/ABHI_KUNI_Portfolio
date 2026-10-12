import { cache } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import type { Song } from '@/types/song';
import { notFound } from 'next/navigation';
import SharePrintButtons from '@/components/SharePrintButtons';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ClientImageLightbox from '@/components/ClientImageLightbox';
import LyricsTypesetter from '@/components/LyricsTypesetter';

export const dynamicParams = true;
export const revalidate = 60; // ISR cache on Vercel CDN

const getSong = cache(async (slug: string): Promise<Song | null> => {
  const decodedSlug = decodeURIComponent(slug);
  const { data } = await supabase.from('songs').select('*').eq('slug', decodedSlug).single();
  return data;
});

export async function generateStaticParams() {
  const { data } = await supabase.from('songs').select('slug');
  return (data ?? []).map((song) => ({
    slug: song.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const song = await getSong(slug);
  if (!song) return { title: 'Not Found' };
  return {
    title: `${song.title} — ABHI-KUNI`,
    description: song.lyrics.slice(0, 160),
  };
}

export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const song = await getSong(slug);
  if (!song) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-300">
      <Link
        href="/browse"
        prefetch={true}
        className="no-print inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-amber-400 transition-colors duration-200 cursor-pointer mb-6 font-ui"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Browse
      </Link>

      {song.cover_image_url && (
        <ClientImageLightbox src={song.cover_image_url} alt={song.title} />
      )}

      {/* LaTeX-Style Typeset Lyrics Viewport */}
      <div className="mb-10">
        <LyricsTypesetter
          lyrics={song.lyrics}
          title={song.title}
          author={song.author || 'ଅବିନାଶ ରଥ'}
        />
      </div>

      <SharePrintButtons title={song.title} />
    </div>
  );
}
