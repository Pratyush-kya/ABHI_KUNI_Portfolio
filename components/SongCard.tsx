import Link from 'next/link';
import Image from 'next/image';
import type { Song } from '@/types/song';
import { getLyricsExcerpt, formatDate, getSongYear, getSongMonth } from '@/lib/utils';
import { Calendar } from 'lucide-react';

const DEFAULT_GRADIENT = [
  'from-amber-500 to-orange-600',
  'from-orange-500 to-rose-600',
  'from-amber-600 to-yellow-600',
  'from-red-500 to-orange-600',
];

function getGradient(id: string) {
  return DEFAULT_GRADIENT[id.charCodeAt(0) % DEFAULT_GRADIENT.length];
}

export default function SongCard({ song }: { song: Song }) {
  const excerpt = getLyricsExcerpt(song.lyrics);
  const year = getSongYear(song.created_at);
  const month = getSongMonth(song.created_at);

  return (
    <Link
      href={`/song/${song.slug}`}
      className="group relative block rounded-2xl overflow-hidden border border-zinc-800/90 bg-zinc-900/95 hover:border-amber-500/70 hover:shadow-[0_8px_30px_rgb(245,158,11,0.12)] transition-all duration-300 cursor-pointer"
    >
      {/* Artwork Container */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-zinc-950">
        {song.cover_image_url ? (
          <>
            <Image
              src={song.cover_image_url}
              alt={song.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {/* Subtle bottom vignette for elegant contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />
          </>
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${getGradient(song.id)} flex items-center justify-center`}>
            <span className="font-odia text-white text-4xl font-bold opacity-75">{song.title.charAt(0)}</span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
          {/* Year & Month Tag */}
          <span className="px-2.5 py-1 rounded-full text-[11px] font-ui font-semibold bg-zinc-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30 shadow-md flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-400" />
            {month} {year}
          </span>

          {/* Category Tag */}
          {song.category && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-odia font-medium bg-zinc-950/85 backdrop-blur-md text-zinc-200 border border-zinc-700/60 shadow-md">
              {song.category}
            </span>
          )}
        </div>
      </div>

      {/* Info Card Content */}
      <div className="p-4 sm:p-5">
        <h2 className="font-odia font-semibold text-lg sm:text-xl text-zinc-100 group-hover:text-amber-400 transition-colors duration-200 line-clamp-1 leading-snug">
          {song.title}
        </h2>
        <p className="font-odia mt-2 text-sm text-zinc-400 line-clamp-2 leading-relaxed">
          {excerpt}
        </p>
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 font-ui">
          <span>{formatDate(song.created_at)}</span>
          <span className="text-amber-500/80 font-medium group-hover:translate-x-0.5 transition-transform">
            Read →
          </span>
        </div>
      </div>
    </Link>
  );
}
