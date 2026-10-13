import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SongCatalog from '@/components/SongCatalog';
import ContactSection from '@/components/ContactSection';
import type { Song } from '@/types/song';
import { Sparkles, Music2, Library, Mail, Award, BookOpen, Quote } from 'lucide-react';

export const revalidate = 60; // ISR cache revalidation every 60s for ultra-fast performance

async function getAllSongs(): Promise<Song[]> {
  const { data } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export default async function HomePage() {
  const songs = await getAllSongs();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Section with Creative One-Time Render Animation */}
      <section className="relative text-center mb-14 sm:mb-16 pt-6 pb-10 overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900/40 via-zinc-950/80 to-transparent border border-zinc-800/60 p-6 sm:p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Soft Stationary Golden Aura Backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[500px] h-[350px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />

        {/* Lyrical Artist Crest */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium text-xs sm:text-sm mb-5 font-ui shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Abinash Rath · ସଂଗୀତକାର ଅବିନାଶ ରଥ</span>
        </div>

        {/* Grand Headline with Golden Odishan Gradient */}
        <h1 className="font-odia font-bold text-4xl sm:text-6xl lg:text-7xl mb-4 leading-tight tracking-tight drop-shadow-md bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent">
          ଓଡ଼ିଆ ଗୀତ ସଂଗ୍ରହ
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-300 text-sm sm:text-lg max-w-2xl mx-auto font-ui leading-relaxed mb-6">
          A timeless digital archive of devotional bhajans, cultural folk melodies, and contemporary Odia poetry composed by Abinash Rath.
        </p>

        {/* Live Archive Metrics Banner */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8 text-xs font-ui text-zinc-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span><strong className="text-zinc-100">{songs.length}+</strong> Compositions (ଗୀତ)</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span><strong className="text-zinc-100">100%</strong> Original Lyrics (ମୌଳିକ)</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <Music2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Decade of Artistry</span>
          </div>
        </div>

        {/* Hero Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8">
          <Link
            href="/browse"
            prefetch={true}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-ui font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Library className="w-4 h-4" />
            Browse All Songs Archive
          </Link>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-700/80 font-ui font-medium text-sm transition-all active:scale-95 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            Contact via Gmail
          </a>
        </div>

        {/* Featured Stanza Quote Spotlight */}
        <div className="max-w-xl mx-auto rounded-2xl bg-zinc-950/70 border border-amber-500/20 p-4 sm:p-5 text-center relative overflow-hidden">
          <Quote className="w-5 h-5 text-amber-500/30 mx-auto mb-2" />
          <p className="font-odia text-zinc-300 text-sm sm:text-base leading-relaxed italic">
            &ldquo;ପତ୍ର ଫୁଲ ଫଳ ସବୁର ମହତ୍ତ୍ୱ ବିଜ୍ଞାନରେ ପ୍ରମାଣିତ, ସୁଆଦିଆ ଖାଦ୍ୟ ସବୁରେ ପ୍ରସ୍ତୁତ ଘରେ ଘରେ ପରିଚିତ।&rdquo;
          </p>
          <span className="block font-odia text-xs text-amber-400/80 mt-2">
            — ସଜନା ଗଛ (ଅବିନାଶ ରଥ)
          </span>
        </div>
      </section>

      {/* Multi-Functional Timeline Catalog (Low Latency Instant Search & Filter) */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-amber-500" />
            <h2 className="font-ui font-semibold text-xl sm:text-2xl text-zinc-50">
              Song Library & Archive
            </h2>
          </div>
        </div>

        <SongCatalog songs={songs} />
      </section>

      {/* Contact & Collaboration Hub */}
      <ContactSection />
    </div>
  );
}
