import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import type { Song } from '@/types/song';
import AdminSongTable from '@/components/AdminSongTable';
import AdminSongForm from '@/components/AdminSongForm';

async function guardAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_session')?.value !== 'authenticated') {
    redirect('/admin');
  }
}

async function getSongs(): Promise<Song[]> {
  const { data } = await supabaseAdmin
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export default async function AdminDashboard() {
  await guardAdmin();
  const songs = await getSongs();

  async function addSong(formData: FormData) {
    'use server';
    await guardAdmin();
    const title = formData.get('title') as string;
    const lyrics = formData.get('lyrics') as string;
    const category = formData.get('category') as string;
    const cover_image_url = (formData.get('cover_image_url') as string) || null;
    const slug = generateSlug(title);
    await supabaseAdmin.from('songs').insert({
      title,
      slug,
      lyrics,
      category,
      author: 'ଅବିନାଶ ରଥ',
      cover_image_url,
    });
    redirect('/admin/dashboard');
  }

  async function deleteSong(formData: FormData) {
    'use server';
    await guardAdmin();
    const id = formData.get('id') as string;
    await supabaseAdmin.from('songs').delete().eq('id', id);
    redirect('/admin/dashboard');
  }

  async function logout() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/admin');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-ui font-bold text-2xl text-zinc-900 dark:text-zinc-50">Admin Dashboard</h1>
          <p className="font-odia text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">ABHI-KUNI · ଅବିନାଶ ରଥ</p>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm font-ui text-zinc-500 hover:text-red-500 transition-colors cursor-pointer">
            Logout
          </button>
        </form>
      </div>

      {/* Add new song form */}
      <AdminSongForm addSong={addSong} />

      {/* Songs table */}
      <div className="mt-12">
        <h2 className="font-ui font-semibold text-lg text-zinc-800 dark:text-zinc-200 mb-4">
          All Songs ({songs.length})
        </h2>
        <AdminSongTable songs={songs} deleteSong={deleteSong} />
      </div>
    </div>
  );
}
