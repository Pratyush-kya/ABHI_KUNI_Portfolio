import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get('admin_session')?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { songs } = body;

    if (!Array.isArray(songs) || songs.length === 0) {
      return NextResponse.json({ error: 'No songs provided for publication' }, { status: 400 });
    }

    const insertedSongs = [];
    const errors = [];

    for (const song of songs) {
      const title = song.title?.trim();
      const lyrics = song.lyrics?.trim();
      const category = song.category?.trim() || 'ଗୀତ';
      const cover_image_url = song.cover_image_url || null;

      if (!title || !lyrics) {
        errors.push(`Song with missing title or lyrics was skipped.`);
        continue;
      }

      const slug = generateSlug(title);
      const { data, error } = await supabaseAdmin.from('songs').insert({
        title,
        slug,
        lyrics,
        category,
        author: 'Abinash Rath',
        cover_image_url,
      }).select().single();

      if (error) {
        errors.push(`Failed to insert "${title}": ${error.message}`);
      } else {
        insertedSongs.push(data);
      }
    }

    return NextResponse.json({
      success: true,
      publishedCount: insertedSongs.length,
      errors,
    });
  } catch (err: any) {
    console.error('Batch publish error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
