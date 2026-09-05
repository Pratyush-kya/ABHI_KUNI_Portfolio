import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ABHI-KUNI — ଅବିନାଶ ରଥ',
  description: 'ଅବିନାଶ ରଥଙ୍କ ଓଡ଼ିଆ ସଂଗୀତ ସଂଗ୍ରହ — My collection of Odia music writings',
  keywords: ['Odia', 'music', 'lyrics', 'ଓଡ଼ିଆ', 'ଗୀତ', 'ଅବିନାଶ ରଥ'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="or" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
          <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400 no-print">
            <p className="font-odia">© {new Date().getFullYear()} ଅବିନାଶ ରଥ · ABHI-KUNI</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
