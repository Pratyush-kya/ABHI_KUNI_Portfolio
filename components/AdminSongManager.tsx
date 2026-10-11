'use client';
import { useState } from 'react';
import AdminSongForm from '@/components/AdminSongForm';
import BulkSongIngest from '@/components/BulkSongIngest';
import { PlusCircle, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminSongManager({
  addSong,
}: {
  addSong: (fd: FormData) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2 rounded-xl text-xs font-ui font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'single'
              ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Single Song Upload
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2 rounded-xl text-xs font-ui font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'bulk'
              ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Bulk Ingestion & Auto-Artwork Studio
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'single' ? (
        <AdminSongForm addSong={addSong} />
      ) : (
        <BulkSongIngest onComplete={() => router.refresh()} />
      )}
    </div>
  );
}
