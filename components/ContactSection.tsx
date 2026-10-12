'use client';

import { useState } from 'react';
import { Mail, Copy, Check, ExternalLink, Sparkles, Send, CheckCircle2 } from 'lucide-react';

const CONTACT_EMAIL = 'abinash.rath.music@gmail.com';

export default function ContactSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    CONTACT_EMAIL
  )}&su=${encodeURIComponent('Inquiry Regarding Odia Music / Lyrics — Abinash Rath')}&body=${encodeURIComponent(
    'Hello Abinash Rath,\n\nI am contacting you regarding your Odia music and poetry portfolio (ABHI-KUNI).\n\nMy Details:\n• Name: \n• Collaboration Type (e.g. Song Composition / Lyrics / Project): \n• Message: \n'
  )}`;

  return (
    <section
      id="contact"
      className="mt-20 relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900/95 to-zinc-950 p-6 sm:p-12 shadow-2xl"
    >
      {/* Decorative Atmospheric Glow */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-ui font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ସହଯୋଗ ଓ ଯୋଗାଯୋଗ · Direct Collaboration</span>
          </div>

          <h2 className="font-odia font-bold text-3xl sm:text-4xl text-zinc-100 leading-tight">
            ସଙ୍ଗୀତ ରଚନା ଓ ପ୍ରକଳ୍ପ ପାଇଁ ସମ୍ପର୍କ କରନ୍ତୁ
          </h2>

          <p className="font-ui text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Interested in original Odia song lyrics, devotional compositions, or artistic music collaboration? Connect directly with Abinash Rath via Gmail.
          </p>
        </div>

        {/* Primary Contact Action Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-xl space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Mail className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs font-ui font-medium uppercase tracking-wider text-zinc-400">
              Official Email Address
            </span>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
              <code className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-750 font-mono text-sm sm:text-base text-amber-300 select-all">
                {CONTACT_EMAIL}
              </code>
              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 text-xs font-ui font-medium transition-all cursor-pointer border border-zinc-700 shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-400" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {/* Open Direct in Gmail Web */}
            <a
              href={gmailWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-ui font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Open Directly in Gmail
            </a>

            {/* Default Mail Client fallback */}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Music%20Collaboration%20Inquiry%20-%20Abinash%20Rath`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-ui font-medium text-sm transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4 text-amber-400" />
              Open Default Mail App
            </a>
          </div>
        </div>

        {/* 3 Clear Steps for Users */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-ui text-xs font-semibold">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">1</span>
              <span>Select Email Method</span>
            </div>
            <p className="text-xs font-ui text-zinc-400 leading-relaxed">
              Click &quot;Open in Gmail&quot; or copy the address to paste into your preferred email software.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-ui text-xs font-semibold">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">2</span>
              <span>Describe Your Project</span>
            </div>
            <p className="text-xs font-ui text-zinc-400 leading-relaxed">
              Share details about your musical project, lyrics requirement, poem licensing, or publication ideas.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-ui text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Direct Response</span>
            </div>
            <p className="text-xs font-ui text-zinc-400 leading-relaxed">
              Abinash Rath directly reviews collaboration requests and responds promptly via email.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
