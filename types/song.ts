export interface Song {
  id: string;
  title: string;
  slug: string;
  lyrics: string;
  category: string;
  author: string;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}
