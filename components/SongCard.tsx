import Link from 'next/link';
import Image from 'next/image';
import type { Song } from '@/types/song';
import { getLyricsExcerpt, formatDate } from '@/lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  ଗୀତ: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  ଭଜନ: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  ଲୋକ: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

const DEFAULT_GRADIENT = [
  'from-amber-400 to-orange-500',
  'from-orange-400 to-rose-500',
  'from-yellow-400 to-amber-600',
  'from-red-400 to-orange-500',
];

function getGradient(id: string) {
  const idx = id.charCodeAt(0) % DEFAULT_GRADIENT.length;
  return DEFAULT_GRADIENT[idx];
}

export default function SongCard({ song }: { song: Song }) {
  const excerpt = getLyricsExcerpt(song.lyrics);
  const badgeClass = CATEGORY_COLORS[song.category] ?? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';

  return (
    <Link
      href={`/song/${song.slug}`}
      className="group block rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-accent dark:hover:border-accent-dark hover:shadow-lg transition-all duration-200 cursor-pointer"
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
        <span className={`absolute top-3 left-3 font-odia text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
          {song.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h2 className="font-odia font-semibold text-lg text-zinc-900 dark:text-zinc-50 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors duration-200 line-clamp-1">
          {song.title}
        </h2>
        <p className="font-odia mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{excerpt}</p>
        <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{formatDate(song.created_at)}</p>
      </div>
    </Link>
  );
}
