import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import type { Song } from '@/types/song';
import { notFound } from 'next/navigation';
import SharePrintButtons from '@/components/SharePrintButtons';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ClientImageLightbox from '@/components/ClientImageLightbox';

async function getSong(slug: string): Promise<Song | null> {
  const decodedSlug = decodeURIComponent(slug);
  const { data } = await supabase.from('songs').select('*').eq('slug', decodedSlug).single();
  return data;
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
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/browse"
        className="no-print inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-accent-dark transition-colors duration-200 cursor-pointer mb-8 font-ui"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Browse
      </Link>

      {song.cover_image_url && (
        <ClientImageLightbox src={song.cover_image_url} alt={song.title} />
      )}

      <div className="mb-8">
        <h1 className="print-title font-odia font-bold text-4xl text-zinc-50 mt-4 mb-2 leading-tight">
          {song.title}
        </h1>
        <p className="print-meta font-odia text-sm text-zinc-400">
          {song.author} · {formatDate(song.created_at)}
        </p>
      </div>

      <div className="mb-10">
        <pre className="lyrics-block font-odia text-xl text-zinc-100 leading-loose whitespace-pre-wrap break-words bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-xl">
          {song.lyrics}
        </pre>
      </div>

      <SharePrintButtons title={song.title} />
    </div>
  );
}
