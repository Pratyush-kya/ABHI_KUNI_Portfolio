import Link from 'next/link';
import Image from 'next/image';
import type { Song } from '@/types/song';
import { getLyricsExcerpt, formatDate } from '@/lib/utils';

const DEFAULT_GRADIENT = [
  'from-amber-400 to-orange-500',
  'from-orange-400 to-rose-500',
  'from-yellow-400 to-amber-600',
  'from-red-400 to-orange-500',
];

function getGradient(id: string) {
  return DEFAULT_GRADIENT[id.charCodeAt(0) % DEFAULT_GRADIENT.length];
}

export default function SongCard({ song }: { song: Song }) {
  const excerpt = getLyricsExcerpt(song.lyrics);

  return (
    <Link
      href={`/song/${song.slug}`}
      className="group block rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-accent-dark hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {/* Artwork */}
      <div className="relative h-48 w-full overflow-hidden">
        {song.cover_image_url ? (
          <Image
            src={song.cover_image_url}
            alt={song.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${getGradient(song.id)} flex items-center justify-center`}>
            <span className="font-odia text-white text-3xl font-bold opacity-60">{song.title.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h2 className="font-odia font-semibold text-lg text-zinc-50 group-hover:text-accent-dark transition-colors duration-200 line-clamp-1">
          {song.title}
        </h2>
        <p className="font-odia mt-1 text-sm text-zinc-400 line-clamp-2">{excerpt}</p>
        <p className="mt-3 text-xs text-zinc-500">{formatDate(song.created_at)}</p>
      </div>
    </Link>
  );
}
