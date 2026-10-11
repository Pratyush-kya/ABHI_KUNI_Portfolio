'use client';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Song } from '@/types/song';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ExternalLink, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm('Are you sure you want to delete this song?')) {
          e.preventDefault();
        }
      }}
      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors cursor-pointer"
      title="Delete song"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}

export default function AdminSongTable({
  songs: initialSongs,
  deleteSong,
}: {
  songs: Song[];
  deleteSong: (fd: FormData) => Promise<void>;
}) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Sync state if props change
  if (initialSongs.length !== songs.length && generatingId === null) {
    setSongs(initialSongs);
  }

  async function generateArtworkForSong(song: Song) {
    if (generatingId) return;
    setGeneratingId(song.id);

    try {
      // 1. Generate artwork in turbo mode
      const genRes = await fetch('/api/generate-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: song.title,
          lyrics: song.lyrics || '',
          style: 'poetic',
          turbo: true,
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || 'Failed to generate artwork');

      // 2. Attach cover to database
      const updateRes = await fetch('/api/update-song-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: song.id,
          cover_image_url: genData.url,
        }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.error || 'Failed to save artwork');

      // 3. Update table row immediately
      setSongs((prev) =>
        prev.map((s) => (s.id === song.id ? { ...s, cover_image_url: genData.url } : s))
      );
    } catch (err: any) {
      alert(`Artwork generation error: ${err.message}`);
    } finally {
      setGeneratingId(null);
    }
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 font-odia">
        ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଗୀତ ନାହିଁ
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm font-ui">
        <thead className="bg-zinc-50 dark:bg-zinc-800/50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-300">Cover</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-300">Title</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-300">Category</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-300">Date</th>
            <th className="px-4 py-3 text-right font-semibold text-zinc-600 dark:text-zinc-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {songs.map((song) => {
            const isGenerating = generatingId === song.id;

            return (
              <tr key={song.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                {/* Artwork Thumbnail / Instant Generator Button */}
                <td className="px-4 py-2.5">
                  <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0">
                    {song.cover_image_url ? (
                      <Image
                        src={song.cover_image_url}
                        alt={song.title}
                        fill
                        className="object-cover"
                      />
                    ) : isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => generateArtworkForSong(song)}
                        disabled={generatingId !== null}
                        className="w-full h-full flex flex-col items-center justify-center text-[9px] text-amber-400 hover:text-amber-300 hover:bg-zinc-700/50 transition-colors cursor-pointer group"
                        title="Generate AI Artwork for this song"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 font-odia text-zinc-900 dark:text-zinc-100 font-medium max-w-xs truncate">
                  {song.title}
                </td>
                <td className="px-4 py-3">
                  <span className="font-odia text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    {song.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap text-xs">
                  {formatDate(song.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {!song.cover_image_url && (
                      <button
                        type="button"
                        onClick={() => generateArtworkForSong(song)}
                        disabled={generatingId !== null}
                        className="px-2 py-1 rounded-md text-[11px] font-ui bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                        title="Generate AI Cover"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        <span>{isGenerating ? 'Creating…' : 'AI Cover'}</span>
                      </button>
                    )}
                    <Link
                      href={`/song/${song.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-accent dark:hover:text-accent-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="View song"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <form action={deleteSong}>
                      <input type="hidden" name="id" value={song.id} />
                      <DeleteButton />
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
