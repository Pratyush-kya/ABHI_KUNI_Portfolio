'use client';
import { useState, useRef } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const CATEGORIES = ['ଗୀତ', 'ଭଜନ', 'ଲୋକ'];

export default function AdminSongForm({ addSong }: { addSong: (fd: FormData) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ଗୀତ');
  const [coverUrl, setCoverUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function generateArtwork() {
    if (!title.trim()) {
      alert('Please enter a song title first.');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category }),
      });
      const data = await res.json();
      if (data.url) setCoverUrl(data.url);
      else alert('Failed to generate artwork. Check API key.');
    } catch {
      alert('Error generating artwork.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="font-ui font-semibold text-lg text-zinc-800 dark:text-zinc-200 mb-5">Add New Song</h2>
      <form ref={formRef} action={addSong} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-ui font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title (Odia)</label>
          <input
            type="text"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-odia text-base focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-dark"
            placeholder="ଗୀତର ନାମ ଲେଖନ୍ତୁ"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-ui font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-odia text-base focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-dark cursor-pointer"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Lyrics */}
        <div>
          <label className="block text-sm font-ui font-medium text-zinc-700 dark:text-zinc-300 mb-1">Lyrics (Odia)</label>
          <textarea
            name="lyrics"
            required
            rows={10}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-odia text-base focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-dark resize-y"
            placeholder="ଗୀତ ଏଠାରେ ଲେଖନ୍ତୁ..."
          />
        </div>

        {/* Artwork */}
        <div>
          <label className="block text-sm font-ui font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cover Artwork URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="cover_image_url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-ui text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-dark"
              placeholder="Auto-filled after generation or paste a URL"
            />
            <button
              type="button"
              onClick={generateArtwork}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent dark:bg-accent-dark text-white dark:text-zinc-900 text-sm font-ui font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? 'Generating…' : 'Generate AI Art'}
            </button>
          </div>
          {coverUrl && (
            <img src={coverUrl} alt="Preview" className="mt-3 h-32 w-48 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700" />
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-ui font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Add Song →
        </button>
      </form>
    </div>
  );
}
