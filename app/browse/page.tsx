import { supabase } from '@/lib/supabase';
import SongCard from '@/components/SongCard';
import type { Song } from '@/types/song';
import Link from 'next/link';

async function getSongs(sort?: string): Promise<Song[]> {
  const { data } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: sort === 'oldest' });
  return data ?? [];
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const songs = await getSongs(sort);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-ui font-bold text-3xl text-zinc-50">All Songs</h1>

        {/* Sort */}
        <div className="flex gap-2">
          {[
            { label: 'Newest', value: 'newest' },
            { label: 'Oldest', value: 'oldest' },
          ].map(({ label, value }) => {
            const isActive = (sort ?? 'newest') === value;
            return (
              <Link
                key={value}
                href={`/browse?sort=${value}`}
                className={`px-3 py-1.5 rounded-full text-xs font-ui font-medium border transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-50 text-zinc-900 border-zinc-50'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-400'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {songs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-zinc-600">
          <p className="font-odia text-2xl mb-2">କୌଣସି ଗୀତ ମିଳିଲା ନାହିଁ</p>
          <p className="font-ui text-sm">No songs yet.</p>
        </div>
      )}
    </div>
  );
}
