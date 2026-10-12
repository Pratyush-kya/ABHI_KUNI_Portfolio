export default function GlobalLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse space-y-8">
      <div className="space-y-4 max-w-md mx-auto text-center">
        <div className="h-6 w-32 bg-zinc-800 rounded-full mx-auto" />
        <div className="h-10 w-64 bg-zinc-800 rounded-xl mx-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <div className="aspect-[4/3] bg-zinc-850" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-zinc-800 rounded" />
              <div className="h-4 w-5/6 bg-zinc-850 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
