'use client';
import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, RefreshCw, Send, Trash2, Layers } from 'lucide-react';
import Image from 'next/image';

interface DraftSong {
  id: string;
  title: string;
  category: string;
  lyrics: string;
  style: string;
  customHint?: string;
  cover_image_url?: string;
  promptConcept?: string;
  status: 'idle' | 'generating' | 'ready' | 'error';
  errorMsg?: string;
}

const ART_STYLES = [
  { id: 'poetic', label: '🌿 ଭାବପୂର୍ଣ୍ଣ (Poetic)' },
  { id: 'devotional', label: '🛕 ମନ୍ଦିର (Temple)' },
  { id: 'pattachitra', label: '🎨 ପଟ୍ଟଚିତ୍ର (Folk Art)' },
  { id: 'nature', label: '🌅 ପ୍ରକୃତି (Nature)' },
];

export default function BulkSongIngest({ onComplete }: { onComplete: () => void }) {
  const [rawText, setRawText] = useState('');
  const [globalStyle, setGlobalStyle] = useState('poetic');
  const [drafts, setDrafts] = useState<DraftSong[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Parse raw text into structured drafts
  function parseSongs() {
    if (!rawText.trim()) return;

    const blocks = rawText.split(/\n\s*---\s*\n/).filter((b) => b.trim().length > 0);
    const parsed: DraftSong[] = [];

    blocks.forEach((block, idx) => {
      const lines = block.trim().split('\n');
      let title = '';
      let category = 'ଗୀତ';
      const lyricsLines: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (/^Title\s*:\s*/i.test(trimmed)) {
          title = trimmed.replace(/^Title\s*:\s*/i, '').trim();
        } else if (/^Category\s*:\s*/i.test(trimmed)) {
          category = trimmed.replace(/^Category\s*:\s*/i, '').trim();
        } else if (/^Lyrics\s*:\s*/i.test(trimmed)) {
          // ignore keyword line, rest will be lyrics
        } else {
          lyricsLines.push(line);
        }
      }

      // If no Title: keyword found, use first non-empty line as title
      if (!title && lyricsLines.length > 0) {
        title = lyricsLines.shift()?.trim() || `Song ${idx + 1}`;
      }

      const lyrics = lyricsLines.join('\n').trim();

      if (title) {
        parsed.push({
          id: `draft-${idx}-${Date.now()}`,
          title,
          category: category || 'ଗୀତ',
          lyrics,
          style: globalStyle,
          status: 'idle',
        });
      }
    });

    setDrafts(parsed);
  }

  // Generate artwork for a single song
  async function generateArtworkForDraft(draftId: string) {
    setDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, status: 'generating', errorMsg: undefined } : d))
    );

    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;

    try {
      const res = await fetch('/api/generate-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          lyrics: draft.lyrics,
          style: draft.style,
          customHint: draft.customHint,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate artwork');
      }

      setDrafts((prev) =>
        prev.map((d) =>
          d.id === draftId
            ? {
                ...d,
                status: 'ready',
                cover_image_url: data.url,
                promptConcept: data.prompt,
              }
            : d
        )
      );
    } catch (err: any) {
      setDrafts((prev) =>
        prev.map((d) =>
          d.id === draftId
            ? {
                ...d,
                status: 'error',
                errorMsg: err.message,
              }
            : d
        )
      );
    }
  }

  // Process all drafts in batch (generates images with safe cooldown pauses)
  async function generateAllArtworks() {
    setIsProcessing(true);
    setPublishSuccess(null);

    for (let i = 0; i < drafts.length; i++) {
      const draft = drafts[i];
      if (draft.status !== 'ready') {
        await generateArtworkForDraft(draft.id);
        // Wait 15s between images to respect free API rate limits if there are more
        if (i < drafts.length - 1) {
          await new Promise((r) => setTimeout(r, 15000));
        }
      }
    }

    setIsProcessing(false);
  }

  // Explicit User Approval Gate: Pushes all reviewed songs to database
  async function publishAllApproved() {
    const readySongs = drafts.filter((d) => d.title.trim() && d.lyrics.trim());
    if (readySongs.length === 0) {
      alert('No songs ready to publish.');
      return;
    }

    setIsPublishing(true);

    try {
      const res = await fetch('/api/batch-publish-songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songs: readySongs.map((d) => ({
            title: d.title,
            category: d.category,
            lyrics: d.lyrics,
            cover_image_url: d.cover_image_url || null,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Batch publish failed');

      setPublishSuccess(`Successfully published ${data.publishedCount} song(s) to the live website!`);
      setDrafts([]);
      setRawText('');
      onComplete();
    } catch (err: any) {
      alert(`Error publishing: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  }

  function removeDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-ui font-semibold text-lg text-zinc-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            Bulk Song Ingestion Studio
          </h2>
          <p className="font-ui text-xs text-zinc-400 mt-1">
            Paste multiple songs, auto-generate artwork, preview each result, and publish all with your approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-ui text-zinc-400">Default Style:</span>
          <select
            value={globalStyle}
            onChange={(e) => setGlobalStyle(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-ui text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {ART_STYLES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {publishSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-sm font-ui flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{publishSuccess}</span>
        </div>
      )}

      {/* Input area */}
      {drafts.length === 0 ? (
        <div className="space-y-3">
          <label className="block text-xs font-ui text-zinc-400">
            Paste songs below (separate each song with <code className="text-amber-400">---</code>):
          </label>
          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Title: ନୀଳ ସାଗର
Category: ଗୀତ
Lyrics:
ତୁମେ ନୀଳ ସାଗର, ମୁଁ ତଟର ବାଲି...
---
Title: ମୋ ପିଲାଦିନ
Category: ଭାବପୂର୍ଣ୍ଣ
Lyrics:
ସେଇ ନଈ ତୁଠ, ସେଇ ବରଗଛ ମୂଳ...`}
            className="w-full px-4 py-3 rounded-xl border border-zinc-750 bg-zinc-950 text-zinc-100 font-odia text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 leading-relaxed"
          />

          <button
            type="button"
            onClick={parseSongs}
            disabled={!rawText.trim()}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-ui font-semibold text-xs transition-colors cursor-pointer"
          >
            Parse & Prepare Drafts →
          </button>
        </div>
      ) : (
        /* Staging & Review Gallery */
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
            <div>
              <span className="text-sm font-ui font-semibold text-zinc-200">
                Staged Songs ({drafts.length})
              </span>
              <p className="text-xs font-ui text-zinc-500">
                {drafts.filter((d) => d.status === 'ready').length} artwork(s) generated and ready.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={generateAllArtworks}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-ui text-zinc-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                )}
                {isProcessing ? 'Generating Batch Images…' : 'Generate All Images'}
              </button>

              <button
                type="button"
                onClick={publishAllApproved}
                disabled={isPublishing || isProcessing}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-ui font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-40"
              >
                {isPublishing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Approve & Publish to Live Web
              </button>
            </div>
          </div>

          {/* Cards Gallery for Visual Review */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="border border-zinc-800 bg-zinc-950/60 rounded-xl p-4 flex gap-4 relative overflow-hidden"
              >
                {/* Artwork Thumbnail / Generator */}
                <div className="w-28 h-28 relative rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 flex items-center justify-center">
                  {draft.cover_image_url ? (
                    <Image
                      src={draft.cover_image_url}
                      alt={draft.title}
                      fill
                      className="object-cover"
                    />
                  ) : draft.status === 'generating' ? (
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => generateArtworkForDraft(draft.id)}
                      className="text-[11px] font-ui text-amber-500/80 hover:text-amber-400 text-center px-2 cursor-pointer"
                    >
                      Click to Generate
                    </button>
                  )}
                </div>

                {/* Draft Information */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-odia font-semibold text-base text-zinc-100 truncate">
                      {draft.title}
                    </h3>
                    <button
                      onClick={() => removeDraft(draft.id)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-odia bg-zinc-800 text-zinc-300">
                    {draft.category}
                  </span>

                  <p className="font-odia text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {draft.lyrics}
                  </p>

                  {draft.status === 'error' && (
                    <p className="text-[10px] font-ui text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {draft.errorMsg}
                    </p>
                  )}

                  {draft.cover_image_url && (
                    <button
                      type="button"
                      onClick={() => generateArtworkForDraft(draft.id)}
                      className="text-[10px] font-ui text-zinc-500 hover:text-amber-400 flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Regenerate Artwork
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
