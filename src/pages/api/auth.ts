import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  const action = url.searchParams.get('action');

  if (action === 'logout') {
    cookies.delete('admin_session', { path: '/' });
    return redirect('/admin/login');
  }

  // Login
  const formData = await request.formData();
  const password = formData.get('password') as string;
  const adminPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

  if (password === adminPassword) {
    cookies.set('admin_session', 'authenticated', {
      path: '/',
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return redirect('/admin');
  }

  return redirect('/admin/login?error=1');
};
