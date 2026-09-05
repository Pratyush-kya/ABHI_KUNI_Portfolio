export function generateSlug(title: string): string {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[\s]+/g, '-')
      .replace(/[^\w\u0B00-\u0B7F-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '') || `song-${Date.now()}`
  );
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('or-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getLyricsExcerpt(lyrics: string, maxLength = 80): string {
  const firstLine = lyrics.split('\n').find((l) => l.trim().length > 0) ?? '';
  return firstLine.length > maxLength ? firstLine.slice(0, maxLength) + '…' : firstLine;
}
