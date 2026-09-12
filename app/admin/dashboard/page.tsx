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
  const { data, error } = await supabaseAdmin
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('getSongs error:', error.message);
  return data ?? [];
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await guardAdmin();
  const songs = await getSongs();
  const { error: uploadError } = await searchParams;

  // Check env vars once on page load so admin knows immediately
  const missingEnv: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://')) missingEnv.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'YOUR_ANON_KEY') missingEnv.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY') missingEnv.push('SUPABASE_SERVICE_ROLE_KEY');

  async function addSong(formData: FormData) {
    'use server';
    await guardAdmin();
    const title = (formData.get('title') as string)?.trim();
    const lyrics = (formData.get('lyrics') as string)?.trim();
    const category = (formData.get('category') as string)?.trim() || 'ଗୀତ';
    const cover_image_url = (formData.get('cover_image_url') as string)?.trim() || null;

    if (!title || !lyrics) {
      redirect('/admin/dashboard?error=Title+and+lyrics+are+required');
    }

    const slug = generateSlug(title);
    const { error } = await supabaseAdmin.from('songs').insert({
      title,
      slug,
      lyrics,
      category,
      author: 'Abinash Rath',
      cover_image_url: cover_image_url || null,
    });

    if (error) {
      console.error('Insert error:', error.message);
      redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
    }

    redirect('/admin/dashboard');
  }

  async function deleteSong(formData: FormData) {
    'use server';
    await guardAdmin();
    const id = formData.get('id') as string;
    const { error } = await supabaseAdmin.from('songs').delete().eq('id', id);
    if (error) console.error('Delete error:', error.message);
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
          <h1 className="font-ui font-bold text-2xl text-zinc-50">Admin Dashboard</h1>
          <p className="font-ui text-sm text-zinc-500 mt-0.5">ABHI-KUNI · Abinash Rath</p>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm font-ui text-zinc-500 hover:text-red-500 transition-colors cursor-pointer">
            Logout
          </button>
        </form>
      </div>

      {/* Missing env-var warning */}
      {missingEnv.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/40 bg-red-950/30 text-red-400 text-sm font-ui">
          <p className="font-semibold mb-1">⚠ Missing environment variables — songs cannot be saved:</p>
          {missingEnv.map((v) => (
            <p key={v} className="font-mono text-xs">• {v}</p>
          ))}
          <p className="mt-2 text-xs text-red-500">Edit <code>.env.local</code> and restart the dev server.</p>
        </div>
      )}

      {/* Upload error banner */}
      {uploadError && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/40 bg-red-950/30 text-red-400 text-sm font-ui">
          <p className="font-semibold">Upload failed:</p>
          <p className="text-xs mt-0.5">{decodeURIComponent(uploadError)}</p>
        </div>
      )}

      <AdminSongForm addSong={addSong} />

      <div className="mt-12">
        <h2 className="font-ui font-semibold text-lg text-zinc-200 mb-4">
          All Songs ({songs.length})
        </h2>
        <AdminSongTable songs={songs} deleteSong={deleteSong} />
      </div>
    </div>
  );
}
