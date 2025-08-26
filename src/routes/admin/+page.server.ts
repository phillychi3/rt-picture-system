import type { PageServerLoad } from './$types';
import { getAllShares } from '$lib/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, depends }) => {
	if (!locals.user) {
		throw error(401, '請先登入');
	}
	depends('shares:list');

	try {
		const isAdmin = locals.user.role === 'admin';
		const shares = await getAllShares(locals.user.id, isAdmin);

		return {
			shares,
			isAdmin
		};
	} catch (err) {
		console.error('加載分享數據失敗:', err);
		throw error(500, '加載數據失敗');
	}
};
