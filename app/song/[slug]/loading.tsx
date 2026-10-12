export default function SongLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 w-28 bg-zinc-800 rounded-lg mb-8" />

      {/* Artwork container skeleton */}
      <div className="aspect-[4/3] sm:aspect-video max-h-[480px] w-full rounded-2xl bg-zinc-900 border border-zinc-800/80 mb-8" />

      {/* Title & metadata skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-10 w-3/4 bg-zinc-850 rounded-xl" />
        <div className="h-4 w-48 bg-zinc-900 rounded-lg" />
      </div>

      {/* Lyrics box skeleton */}
      <div className="h-72 w-full bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 space-y-4">
        <div className="h-4 w-5/6 bg-zinc-800/70 rounded" />
        <div className="h-4 w-4/6 bg-zinc-800/70 rounded" />
        <div className="h-4 w-3/4 bg-zinc-800/70 rounded" />
        <div className="h-4 w-2/3 bg-zinc-800/70 rounded" />
      </div>
    </div>
  );
}
