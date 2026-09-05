import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function login(formData: FormData) {
    'use server';
    const password = formData.get('password');
    if (password === process.env.ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      redirect('/admin/dashboard');
    } else {
      redirect('/admin?error=1');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-ui font-bold text-2xl text-zinc-900 dark:text-zinc-50">Admin Panel</h1>
          <p className="font-odia text-zinc-500 dark:text-zinc-400 mt-1">ABHI-KUNI · ଅବିନାଶ ରଥ</p>
        </div>
        <form action={login} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm font-ui text-center">Wrong password. Try again.</p>
          )}
          <div>
            <label className="block text-sm font-ui font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-ui text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-dark"
              placeholder="Enter admin password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-accent dark:bg-accent-dark text-white dark:text-zinc-900 font-ui font-semibold text-sm hover:opacity-90 transition-opacity duration-200 cursor-pointer"
          >
            Login →
          </button>
        </form>
      </div>
    </div>
  );
}
