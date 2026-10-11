import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get('admin_session')?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { songId, cover_image_url } = await req.json();

    if (!songId || !cover_image_url) {
      return NextResponse.json({ error: 'songId and cover_image_url are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('songs')
      .update({ cover_image_url })
      .eq('id', songId)
      .select('id, slug, title, cover_image_url')
      .single();

    if (error) {
      console.error('Update song artwork error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/', 'layout');
    if (data?.slug) {
      revalidatePath(`/song/${data.slug}`);
    }

    return NextResponse.json({ success: true, song: data });
  } catch (err: any) {
    console.error('Unexpected error in update-song-artwork:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
