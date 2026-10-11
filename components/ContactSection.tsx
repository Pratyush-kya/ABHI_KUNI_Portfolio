import Link from 'next/link';
import { Mail, MessageCircle, Music, Sparkles } from 'lucide-react';

export default function ContactSection() {
  return (
    <section className="mt-20 relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-8 sm:p-10 shadow-2xl">
      {/* Decorative Warm Backlight */}
      <div className="absolute top-0 right-1/4 -z-10 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-ui font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ସହଯୋଗ ଓ ଯୋଗାଯୋଗ · Collaboration & Inquiries</span>
        </div>

        <h2 className="font-odia font-bold text-3xl sm:text-4xl text-zinc-100 leading-tight">
          ନୂତନ ଗୀତ କିମ୍ବା ସଙ୍ଗୀତ ପ୍ରକଳ୍ପ ପାଇଁ ସମ୍ପର୍କ କରନ୍ତୁ
        </h2>

        <p className="font-ui text-zinc-400 text-sm sm:text-base leading-relaxed">
          Looking for authentic Odia song lyrics, devotional compositions, or music collaboration with Abinash Rath? Connect directly:
        </p>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {/* WhatsApp Direct Chat */}
          <a
            href="https://wa.me/?text=Hello%20Abinash%20Rath,%20I%20visited%20your%20ABHI-KUNI%20lyrics%20portfolio%20and%20would%20like%20to%20connect."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-ui font-medium text-sm transition-all shadow-lg hover:shadow-emerald-900/30 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            Chat on WhatsApp
          </a>

          {/* Email Inquiry */}
          <a
            href="mailto:contact@abhikuni.com?subject=Music%20Collaboration%20Inquiry%20-%20Abinash%20Rath"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-ui font-medium text-sm transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            Send Email
          </a>

          {/* Browse Library Button */}
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-ui font-medium text-sm transition-all cursor-pointer"
          >
            <Music className="w-4 h-4" />
            Explore Full Library
          </Link>
        </div>
      </div>
    </section>
  );
}
