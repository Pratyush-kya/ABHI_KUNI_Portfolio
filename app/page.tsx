import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SongCard from '@/components/SongCard';
import type { Song } from '@/types/song';

async function getFeaturedSongs(): Promise<Song[]> {
  const { data } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);
  return data ?? [];
}

const CATEGORIES = [
  { label: 'ଗୀତ', desc: 'Song Lyrics', href: '/browse?category=ଗୀତ', emoji: '🎵' },
  { label: 'ଭଜନ', desc: 'Devotional', href: '/browse?category=ଭଜନ', emoji: '🪔' },
  { label: 'ଲୋକ', desc: 'Folk Songs', href: '/browse?category=ଲୋକ', emoji: '🌾' },
];

export default async function HomePage() {
  const songs = await getFeaturedSongs();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <p className="text-accent dark:text-accent-dark font-semibold text-sm uppercase tracking-widest mb-3 font-ui">
          ଅବିନାଶ ରଥ · Abhinash Rath
        </p>
        <h1 className="font-odia font-bold text-5xl sm:text-6xl text-zinc-900 dark:text-zinc-50 mb-4 leading-tight">
          ଓଡ଼ିଆ ସଂଗୀତ ସଂଗ୍ରହ
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto font-ui">
          A heartfelt collection of Odia music writings — lyrics, devotional songs, and folk compositions.
        </p>
        <Link
          href="/browse"
          className="inline-block mt-8 px-6 py-3 rounded-xl bg-accent dark:bg-accent-dark text-white dark:text-zinc-900 font-semibold font-ui hover:opacity-90 transition-opacity duration-200 cursor-pointer"
        >
          Browse All Songs →
        </Link>
      </section>

      {/* Category Quick Links */}
      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-accent dark:hover:border-accent-dark hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <h3 className="font-odia font-semibold text-xl text-zinc-900 dark:text-zinc-50 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors duration-200">
                {cat.label}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-ui mt-0.5">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Songs */}
      {songs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-ui font-semibold text-2xl text-zinc-900 dark:text-zinc-50">Latest Writings</h2>
            <Link href="/browse" className="text-sm text-accent dark:text-accent-dark hover:underline font-ui cursor-pointer">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {songs.length === 0 && (
        <div className="text-center py-24 text-zinc-400 dark:text-zinc-600">
          <p className="font-odia text-2xl mb-2">ଏখନ ପର୍ଯ୍ୟନ୍ତ କୌଣସି ଗୀତ ନାହିଁ</p>
          <p className="font-ui text-sm">No songs yet. Add your first song from the admin panel.</p>
        </div>
      )}
    </div>
  );
}
