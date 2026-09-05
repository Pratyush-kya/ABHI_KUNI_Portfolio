import type { Song } from '@/types/song';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Trash2, ExternalLink } from 'lucide-react';

export default function AdminSongTable({
  songs,
  deleteSong,
}: {
  songs: Song[];
  deleteSong: (fd: FormData) => Promise<void>;
}) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 font-odia">
        ଏଖନ ପର୍ଯ୍ୟନ୍ତ କୌଣସି ଗୀତ ନାହିଁ
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm font-ui">
        <thead className="bg-zinc-50 dark:bg-zinc-800/50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-300">Title</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-300">Category</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-300">Date</th>
            <th className="px-4 py-3 text-right font-semibold text-zinc-600 dark:text-zinc-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {songs.map((song) => (
            <tr key={song.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
              <td className="px-4 py-3 font-odia text-zinc-900 dark:text-zinc-100 font-medium max-w-xs truncate">
                {song.title}
              </td>
              <td className="px-4 py-3">
                <span className="font-odia text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  {song.category}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                {formatDate(song.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
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
                    <button
                      type="submit"
                      onClick={(e) => { if (!confirm('Delete this song?')) e.preventDefault(); }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                      title="Delete song"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
