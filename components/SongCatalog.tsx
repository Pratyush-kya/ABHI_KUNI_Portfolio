'use client';
import { useState, useMemo } from 'react';
import type { Song } from '@/types/song';
import SongCard from '@/components/SongCard';
import { Search, Calendar, Filter, Sparkles, X } from 'lucide-react';
import { getSongYear, getSongMonth } from '@/lib/utils';

export default function SongCatalog({ songs }: { songs: Song[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract available years, months, and categories dynamically
  const { availableYears, availableMonths, availableCategories } = useMemo(() => {
    const years = new Set<string>();
    const months = new Set<string>();
    const cats = new Set<string>();

    songs.forEach((s) => {
      years.add(getSongYear(s.created_at));
      months.add(getSongMonth(s.created_at));
      if (s.category) cats.add(s.category);
    });

    return {
      availableYears: Array.from(years).sort().reverse(),
      availableMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].filter((m) => months.has(m)),
      availableCategories: Array.from(cats),
    };
  }, [songs]);

  // Instant client-side low-latency filter
  const filteredSongs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return songs.filter((s) => {
      // Search matching (Title, Lyrics, Category)
      if (query) {
        const matchesTitle = s.title.toLowerCase().includes(query);
        const matchesLyrics = s.lyrics.toLowerCase().includes(query);
        const matchesCategory = s.category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLyrics && !matchesCategory) return false;
      }

      // Year matching
      if (selectedYear !== 'all') {
        const year = getSongYear(s.created_at);
        if (year !== selectedYear) return false;
      }

      // Month matching
      if (selectedMonth !== 'all') {
        const month = getSongMonth(s.created_at);
        if (month !== selectedMonth) return false;
      }

      // Category matching
      if (selectedCategory !== 'all') {
        if (s.category !== selectedCategory) return false;
      }

      return true;
    });
  }, [songs, searchQuery, selectedYear, selectedMonth, selectedCategory]);

  const hasActiveFilters = selectedYear !== 'all' || selectedMonth !== 'all' || selectedCategory !== 'all' || searchQuery.length > 0;

  function resetFilters() {
    setSelectedYear('all');
    setSelectedMonth('all');
    setSelectedCategory('all');
    setSearchQuery('');
  }

  return (
    <div className="space-y-6">
      {/* Search & Timeline Filter Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        {/* Instant Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs by title or lyrics (ଗୀତ ବା ଶବ୍ଦ ଖୋଜନ୍ତୁ)…"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-750 bg-zinc-950/70 text-zinc-100 placeholder:text-zinc-500 font-odia text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Year Pills Filter */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-ui font-medium text-zinc-400 flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" /> Year:
            </span>

            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3 py-1 rounded-full text-xs font-ui font-medium transition-all cursor-pointer ${
                selectedYear === 'all'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-750 border border-zinc-700/60'
              }`}
            >
              All Years ({songs.length})
            </button>

            {availableYears.map((yr) => {
              const count = songs.filter((s) => getSongYear(s.created_at) === yr).length;
              const isActive = selectedYear === yr;
              return (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(isActive ? 'all' : yr)}
                  className={`px-3 py-1 rounded-full text-xs font-ui font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-750 border border-zinc-700/60'
                  }`}
                >
                  {yr} <span className="opacity-75 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Month Pills Filter (Shows when specific year is active or available) */}
          {availableMonths.length > 1 && (
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-1 border-t border-zinc-800/60">
              <span className="text-[11px] font-ui text-zinc-500 mr-1">Month:</span>
              <button
                onClick={() => setSelectedMonth('all')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-ui transition-all cursor-pointer ${
                  selectedMonth === 'all'
                    ? 'bg-zinc-200 text-zinc-900 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All
              </button>
              {availableMonths.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(selectedMonth === m ? 'all' : m)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-ui transition-all cursor-pointer ${
                    selectedMonth === m
                      ? 'bg-zinc-200 text-zinc-900 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* Category Chips */}
          {availableCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-800/60">
              <span className="text-xs font-ui text-zinc-400 mr-1">Category:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-odia transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border border-zinc-750'
                }`}
              >
                ସବୁ ବିଭାଗ
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-odia transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 font-medium'
                      : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border border-zinc-750'
                  }`}
                >
                  {cat}
                </button>
              ))}

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="ml-auto text-xs font-ui text-amber-500 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Catalog Status Bar */}
      <div className="flex items-center justify-between px-1 text-xs font-ui text-zinc-400">
        <span>
          Showing <strong className="text-zinc-200">{filteredSongs.length}</strong> of{' '}
          <strong className="text-zinc-200">{songs.length}</strong> songs
        </span>
        {selectedYear !== 'all' && (
          <span className="text-amber-400/90 font-medium">Filtered by: Year {selectedYear}</span>
        )}
      </div>

      {/* Results Grid */}
      {filteredSongs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
          <p className="font-odia text-xl text-zinc-300 mb-2">କୌଣସି ଗୀତ ମିଳିଲା ନାହିଁ</p>
          <p className="font-ui text-sm text-zinc-500 mb-4">
            No songs match the current search and filter combination.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-semibold font-ui text-xs hover:bg-amber-400 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
