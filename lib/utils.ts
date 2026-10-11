export function generateSlug(title: string): string {
  // Always append a timestamp suffix to guarantee uniqueness
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\u0B00-\u0B7F-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
  // suffix prevents duplicate-slug DB constraint errors
  return `${base || 'song'}-${Date.now()}`;
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('or-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getSongYear(isoString: string): string {
  return new Date(isoString).getFullYear().toString();
}

export function getSongMonth(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short' });
}

export function getLyricsExcerpt(lyrics: string, maxLength = 80): string {
  const firstLine = lyrics.split('\n').find((l) => l.trim().length > 0) ?? '';
  return firstLine.length > maxLength ? firstLine.slice(0, maxLength) + '…' : firstLine;
}
