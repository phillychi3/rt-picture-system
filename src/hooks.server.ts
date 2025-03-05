import { verifyToken, initializeRootAdmin } from '$lib/auth';
import { redirect, type Handle } from '@sveltejs/kit';

initializeRootAdmin().catch((err) => {
	console.error('初始化根管理員賬號失敗:', err);
});

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	const isLoginPage = path === '/admin/login';

	const authHeader = event.request.headers.get('Authorization');
	const token = authHeader ? authHeader.replace('Bearer ', '') : event.cookies.get('jwt');

	event.locals.user = null;

	if (token) {
		try {
			const decoded = verifyToken(token);
			if (decoded) {
				event.locals.user = {
					id: decoded.id,
					username: decoded.username,
					role: decoded.role as 'admin' | 'user'
				};
			}
		} catch (err) {
			console.error('JWT 驗證失敗:', err);
			event.cookies.delete('jwt', { path: '/' });
		}
	}

	if (path.startsWith('/admin') && !isLoginPage) {
		if (!event.locals.user) {
			console.log(`未認證訪問: ${path} => 重定向到登入頁面`);
			throw redirect(302, '/admin/login');
		}

		if (path.startsWith('/admin/users') && event.locals.user.role !== 'admin') {
			console.log(`非管理員訪問: ${path} => 重定向到 /admin`);
			throw redirect(302, '/admin');
		}
	} else if (isLoginPage && event.locals.user) {
		console.log(`已登入用戶訪問登入頁面 => 重定向到 /admin`);
		throw redirect(302, '/admin');
	}

	return await resolve(event);
};
