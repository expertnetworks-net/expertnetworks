import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // Only protect /admin/* routes (but not /admin/login)
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    const cookie = context.cookies.get('admin_session');
    if (!cookie || cookie.value !== 'authenticated') {
      return context.redirect('/admin/login');
    }
  }

  // Protect /api/* routes (except /api/auth)
  if (url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/auth')) {
    const cookie = context.cookies.get('admin_session');
    if (!cookie || cookie.value !== 'authenticated') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return next();
});
