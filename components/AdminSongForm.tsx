'use client';
import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, AlertCircle, Upload, X } from 'lucide-react';

const ART_STYLES = [
  { id: 'poetic', label: '🌿 ଭାବପୂର୍ଣ୍ଣ (Poetic & Simple)', desc: 'Clean, emotional single subject' },
  { id: 'devotional', label: '🛕 ମନ୍ଦିର (Temple & Bhakti)', desc: 'Sacred diya glow & temple silhouette' },
  { id: 'pattachitra', label: '🎨 ପଟ୍ଟଚିତ୍ର (Folk Art)', desc: 'Traditional Odisha folk painting' },
  { id: 'nature', label: '🌅 ପ୍ରକୃତି (Nature & Village)', desc: 'Rural Odisha landscapes & peaceful dawn' },
];

export default function AdminSongForm({ addSong }: { addSong: (fd: FormData) => Promise<void> }) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [category, setCategory] = useState('ଗୀତ');
  const [artStyle, setArtStyle] = useState('poetic');
  const [customHint, setCustomHint] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [generatedConcept, setGeneratedConcept] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artError, setArtError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  async function generateArtwork() {
    if (!title.trim()) {
      alert('Please enter a song title first.');
      return;
    }

    if (cooldown > 0) return;

    setGenerating(true);
    setArtError(null);

    try {
      const res = await fetch('/api/generate-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          lyrics,
          style: artStyle,
          customHint,
          previousUrl: coverUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setCooldown(25);
        }
        throw new Error(data.error || 'Failed to generate artwork');
      }

      if (data.url) {
        setCoverUrl(data.url);
        if (data.prompt) setGeneratedConcept(data.prompt);
        // 25-second cooldown to respect free AI rate limits
        setCooldown(25);
        // Clear file input if AI artwork is generated
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Artwork generation error:', err);
      setArtError(err.message || 'Error generating artwork');
    } finally {
      setGenerating(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFilePreview(URL.createObjectURL(file));
      setCoverUrl('');
      setGeneratedConcept(null);
      setArtError(null);
    }
  }

  function handleClearArtwork() {
    setCoverUrl('');
    setGeneratedConcept(null);
    setFilePreview(null);
    setArtError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const isButtonDisabled = !mounted ? true : generating || !title.trim() || cooldown > 0;
  const currentPreview = filePreview || coverUrl;

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
      <h2 className="font-ui font-semibold text-lg text-zinc-200 mb-5">Add New Song</h2>

      <form
        action={addSong}
        onSubmit={(e) => {
          if (isSubmitting) {
            e.preventDefault();
            return;
          }
          setIsSubmitting(true);
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
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
              Category <span className="text-zinc-500 font-normal">(ବିଭାଗ)</span>
            </label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-50 font-odia text-base focus:outline-none focus:ring-2 focus:ring-accent-dark"
            >
              <option value="ଗୀତ">ଗୀତ (Song)</option>
              <option value="ଭଜନ">ଭଜନ (Bhajan)</option>
              <option value="କବିତା">କବିତା (Poem)</option>
              <option value="ଅନ୍ୟାନ୍ୟ">ଅନ୍ୟାନ୍ୟ (Other)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-ui font-medium text-zinc-300 mb-1">
            Lyrics <span className="text-zinc-500 font-normal">(Odia)</span>
          </label>
          <textarea
            name="lyrics"
            required
            rows={10}
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-50 font-odia text-base focus:outline-none focus:ring-2 focus:ring-accent-dark resize-y leading-relaxed"
            placeholder="ଏଠାରେ ଆପଣଙ୍କ ଗୀତ ଲେଖନ୍ତୁ…"
          />
        </div>

        {/* Artwork Generation Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-ui font-medium text-zinc-300">
              Cover Artwork <span className="text-zinc-500 font-normal text-xs">(optional)</span>
            </label>

            <button
              type="button"
              onClick={generateArtwork}
              disabled={isButtonDisabled}
              suppressHydrationWarning
              className="flex items-center gap-1.5 text-xs text-accent-dark hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {generating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {generating
                ? 'Generating AI Art…'
                : cooldown > 0
                ? `Wait ${cooldown}s to regenerate`
                : coverUrl
                ? 'Regenerate AI Art'
                : 'Generate with AI'}
            </button>
          </div>

          {/* Art Style Selector */}
          <div className="mb-2">
            <label className="block text-xs font-ui text-zinc-400 mb-1.5">Art Style (ଶୈଳୀ):</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ART_STYLES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setArtStyle(st.id)}
                  className={`py-2 px-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    artStyle === st.id
                      ? 'bg-zinc-800 border-accent-dark shadow-sm'
                      : 'border-zinc-800 bg-zinc-850/60 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div className={`text-xs font-medium font-ui ${artStyle === st.id ? 'text-accent-dark' : 'text-zinc-300'}`}>
                    {st.label}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-ui truncate mt-0.5">
                    {st.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Creative Hint */}
          <div className="mb-3">
            <input
              type="text"
              value={customHint}
              onChange={(e) => setCustomHint(e.target.value)}
              placeholder="Optional visual hint (e.g. 'lone clay lamp', 'quiet river sunrise', 'temple twilight')"
              className="w-full px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-800/60 text-zinc-300 text-xs font-ui placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-accent-dark"
            />
          </div>

          {artError && (
            <div className="mb-3 p-3 rounded-xl border border-red-900/50 bg-red-950/30 flex items-start gap-2 text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs font-ui">{artError}</p>
            </div>
          )}

          {generating ? (
            <div className="h-44 rounded-xl border border-zinc-700 bg-zinc-800 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Loader2 className="w-7 h-7 animate-spin text-accent-dark" />
              <span className="text-xs font-ui">Creating simple & meaningful poster artwork…</span>
            </div>
          ) : currentPreview ? (
            <div className="space-y-2">
              <div className="relative group rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950">
                <img
                  src={currentPreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
                {coverUrl && !filePreview && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 bg-zinc-900/80 backdrop-blur text-accent-dark text-xs font-ui px-2.5 py-1 rounded-full border border-zinc-700">
                    <Sparkles className="w-3 h-3" /> AI Generated
                  </span>
                )}
                {filePreview && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 bg-zinc-900/80 backdrop-blur text-emerald-400 text-xs font-ui px-2.5 py-1 rounded-full border border-zinc-700">
                    <Upload className="w-3 h-3" /> Device Upload
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClearArtwork}
                  className="absolute top-2 left-2 bg-red-600/90 hover:bg-red-600 text-white text-xs font-ui px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer shadow-md"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>

              {generatedConcept && coverUrl && !filePreview && (
                <div className="p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800 text-[11px] font-ui text-zinc-400">
                  <span className="text-zinc-500 font-medium">Visual Concept: </span>
                  <span className="italic">{generatedConcept}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-800/40 p-5 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-ui font-medium border border-zinc-700 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Choose file from device</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="cover_file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span className="text-zinc-500 text-xs font-ui">or</span>
                <button
                  type="button"
                  onClick={generateArtwork}
                  disabled={isButtonDisabled}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-accent-dark text-xs font-ui font-medium border border-zinc-700 cursor-pointer transition-colors disabled:opacity-40"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {generating
                      ? 'Generating…'
                      : cooldown > 0
                      ? `Wait ${cooldown}s`
                      : 'Generate with AI'}
                  </span>
                </button>
              </div>
              <p className="mt-3 text-[11px] text-zinc-500 font-ui">
                Upload your own photo from device, generate a simple & meaningful AI cover, or publish without artwork.
              </p>
            </div>
          )}

          <input type="hidden" name="cover_image_url" value={coverUrl} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || generating}
          className="w-full py-3.5 rounded-xl bg-zinc-50 text-zinc-900 font-ui font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer flex items-center justify-center gap-2 mt-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
              <span>Uploading Song…</span>
            </>
          ) : (
            <span>Upload Song →</span>
          )}
        </button>
      </form>
    </div>
  );
}
