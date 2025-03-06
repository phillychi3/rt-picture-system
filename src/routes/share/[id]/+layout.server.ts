import type { LayoutServerLoad } from './$types';
import { getShareById } from '$lib/db';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params, depends }) => {
	const { id } = params;

	depends('shares:' + id);

	try {
		const share = await getShareById(id);

		if (!share) {
			throw error(404, '找不到分享項目');
		}

		return { share: share };
	} catch (err) {
		console.error('載入出錯:', err);
		if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
			//到底三小問題?
			throw err;
		}
		throw error(500, '載入出錯');
	}
};
