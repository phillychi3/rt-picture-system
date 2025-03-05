import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { validateCredentials, createToken } from '$lib/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
	const error = url.searchParams.get('error');

	return {
		error: error || undefined,
		user: locals.user
	};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;

		if (!username || !password) {
			return fail(400, {
				error: '請提供用戶名和密碼',
				username
			});
		}

		try {
			const user = await validateCredentials(username, password);

			if (!user) {
				return fail(400, {
					error: '用戶名或密碼不正確',
					username
				});
			}

			const token = createToken({
				id: user.id,
				username: user.username,
				role: user.role
			});

			cookies.set('jwt', token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7 // 7 天
			});

			return {
				success: true,
				user: {
					username: user.username,
					role: user.role
				}
			};
		} catch (err) {
			console.error('登入失敗:', err);
			return fail(500, {
				error: '登入處理過程中出錯',
				username
			});
		}
	}
};
