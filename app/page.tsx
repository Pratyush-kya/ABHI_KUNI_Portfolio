import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SongCard from '@/components/SongCard';
import type { Song } from '@/types/song';

async function getLatestSongs(): Promise<Song[]> {
  const { data } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);
  return data ?? [];
}

export default async function HomePage() {
  const songs = await getLatestSongs();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <p className="text-accent-dark font-semibold text-sm uppercase tracking-widest mb-3 font-ui">
          Abinash Rath · ଅବିନାଶ ରଥ
        </p>
        <h1 className="font-odia font-bold text-5xl sm:text-6xl text-zinc-50 mb-4 leading-tight">
          ଓଡ଼ିଆ ଗୀତ ସଂଗ୍ରହ
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto font-ui">
          A heartfelt collection of Odia song lyrics by Abinash Rath.
        </p>
        <Link
          href="/browse"
          className="inline-block mt-8 px-6 py-3 rounded-xl bg-accent-dark text-zinc-900 font-semibold font-ui hover:opacity-90 transition-opacity duration-200 cursor-pointer"
        >
          Browse All Songs →
        </Link>
      </section>

      {/* Latest Songs */}
      {songs.length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-ui font-semibold text-2xl text-zinc-50">Latest Songs</h2>
            <Link href="/browse" className="text-sm text-accent-dark hover:underline font-ui cursor-pointer">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center py-24 text-zinc-600">
          <p className="font-odia text-2xl mb-2">ଏଖନ ପର୍ଯ୍ୟନ୍ତ କୌଣସି ଗୀତ ନାହିଁ</p>
          <p className="font-ui text-sm">No songs yet — add your first from the admin panel.</p>
        </div>
      )}
    </div>
  );
}
