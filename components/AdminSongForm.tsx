'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminSongForm({ addSong }: { addSong: (fd: FormData) => Promise<void> }) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [artError, setArtError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function generateArtwork(isManual = false) {
    if (!title.trim()) {
      if (isManual) alert('Please enter a song title first.');
      return;
    }
    
    setGenerating(true);
    setArtError(null);
    
    try {
      const res = await fetch('/api/generate-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, lyrics }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate artwork');
      }
      
      if (data.url) {
        setCoverUrl(data.url);
      }
    } catch (err: any) {
      console.error('Artwork generation error:', err);
      setArtError(err.message || 'Error generating artwork');
      if (isManual) {
        alert(`Artwork failed: ${err.message}`);
      }
    } finally {
      setGenerating(false);
    }
  }

  function handleLyricsBlur() {
    if (title.trim() && !coverUrl && !generating && !artError) {
      generateArtwork(false);
    }
  }

  const isButtonDisabled = !mounted ? true : (generating || !title.trim());

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
      <h2 className="font-ui font-semibold text-lg text-zinc-200 mb-5">Add New Song</h2>
      
      <form action={addSong} className="space-y-4">
        <input type="hidden" name="category" value="ଗୀତ" />

        <div>
          <label className="block text-sm font-ui font-medium text-zinc-300 mb-1">
            Title <span className="text-zinc-500 font-normal">(Odia)</span>
          </label>
          <input
            type="text"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-50 font-odia text-base focus:outline-none focus:ring-2 focus:ring-accent-dark"
            placeholder="ଗୀତର ନାମ ଲେଖନ୍ତୁ…"
          />
        </div>

        <div>
          <label className="block text-sm font-ui font-medium text-zinc-300 mb-1">
            Lyrics <span className="text-zinc-500 font-normal">(Odia)</span>
          </label>
          <textarea
            name="lyrics"
            required
            rows={12}
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            onBlur={handleLyricsBlur}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-50 font-odia text-base focus:outline-none focus:ring-2 focus:ring-accent-dark resize-y"
            placeholder="ଏଠାରେ ଆପଣଙ୍କ ଗୀତ ଲେଖନ୍ତୁ…"
          />
          <p className="mt-1.5 text-xs text-zinc-500 font-ui">
            Artwork will be auto-generated when you finish writing lyrics.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-ui font-medium text-zinc-300">
              Cover Artwork
            </label>
            <button
              type="button"
              onClick={() => generateArtwork(true)}
              disabled={isButtonDisabled}
              suppressHydrationWarning
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-accent-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {generating
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <RefreshCw className="w-3 h-3" />}
              {generating ? 'Generating…' : coverUrl ? 'Regenerate' : 'Generate now'}
            </button>
          </div>

          {artError && (
            <div className="mb-2 p-2.5 rounded-lg border border-red-900/50 bg-red-950/30 flex items-start gap-2 text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs font-ui">{artError}</p>
            </div>
          )}

          {generating ? (
            <div className="h-40 rounded-xl border border-zinc-700 bg-zinc-800 flex flex-col items-center justify-center gap-2 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-accent-dark" />
              <span className="text-xs font-ui">Generating artwork…</span>
            </div>
          ) : coverUrl ? (
            <div className="relative group">
              <img
                src={coverUrl}
                alt="Cover preview"
                className="w-full h-48 object-cover rounded-xl border border-zinc-700"
              />
              <span className="absolute top-2 right-2 flex items-center gap-1 bg-zinc-900/80 text-accent-dark text-xs font-ui px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3" /> AI Generated
              </span>
              <button
                type="button"
                onClick={() => setCoverUrl('')}
                className="absolute top-2 left-2 bg-red-500/80 hover:bg-red-500 text-white text-xs font-ui px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="h-40 rounded-xl border border-dashed border-zinc-700 bg-zinc-800/50 flex flex-col items-center justify-center text-zinc-600 text-xs font-ui p-4 text-center">
              <span>Auto-fills after you write lyrics</span>
              <span className="(or click 'Generate now' above) mt-1 opacity-70">
                You can also just upload without artwork.
              </span>
            </div>
          )}

          <input type="hidden" name="cover_image_url" value={coverUrl} />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-zinc-50 text-zinc-900 font-ui font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Upload Song →
        </button>
      </form>
    </div>
  );
}
