import { supabase } from '@/lib/supabase';
import SongCard from '@/components/SongCard';
import type { Song } from '@/types/song';
import Link from 'next/link';

const CATEGORIES = ['ସବୁ', 'ଗୀତ', 'ଭଜନ', 'ଲୋକ'];

async function getSongs(category?: string, sort?: string): Promise<Song[]> {
  let query = supabase.from('songs').select('*');
  if (category && category !== 'ସବୁ') query = query.eq('category', category);
  query = query.order('created_at', { ascending: sort === 'oldest' });
  const { data } = await query;
  return data ?? [];
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { category, sort } = await searchParams;
  const songs = await getSongs(category, sort);
  const activeCategory = category || 'ସବୁ';

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-ui font-bold text-3xl text-zinc-900 dark:text-zinc-50 mb-8">
        Browse All Writings
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-10">
        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const href = cat === 'ସବୁ' ? '/browse' : `/browse?category=${encodeURIComponent(cat)}`;
            return (
              <Link
                key={cat}
                href={href}
                className={`font-odia px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-accent dark:bg-accent-dark text-white dark:text-zinc-900 border-accent dark:border-accent-dark'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-accent dark:hover:border-accent-dark hover:text-accent dark:hover:text-accent-dark'
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Sort */}
        <div className="ml-auto flex gap-2">
          {[
            { label: 'Newest', value: 'newest' },
            { label: 'Oldest', value: 'oldest' },
          ].map(({ label, value }) => {
            const isActive = (sort ?? 'newest') === value;
            const params = new URLSearchParams();
            if (category) params.set('category', category);
            params.set('sort', value);
            return (
              <Link
                key={value}
                href={`/browse?${params}`}
                className={`px-3 py-1.5 rounded-full text-xs font-ui font-medium border transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-50'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {songs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-zinc-400 dark:text-zinc-600">
          <p className="font-odia text-2xl mb-2">କୌଣସି ଫଳ ମିଳିଲା ନାହିଁ</p>
          <p className="font-ui text-sm">No songs found in this category yet.</p>
        </div>
      )}
    </div>
  );
}
