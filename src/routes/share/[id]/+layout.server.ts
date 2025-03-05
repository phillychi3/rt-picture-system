import type { LayoutServerLoad } from './$types';
import { getShareById } from '$lib/db';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params, depends }) => {
	const { id } = params;

	depends('shares:' + id);

	try {
		const share = await getShareById(id);

		if (!share) {
			throw error(404, '找不到分享');
		}

		const serializableShare = {
			id: share.id,
			title: share.title || '',
			name: share.name || '',
			description: share.description || '',
			images: [...(share.images || [])],
			createdAt: share.createdAt
				? new Date(share.createdAt).toISOString()
				: new Date().toISOString(),
			updatedAt: share.updatedAt ? new Date(share.updatedAt).toISOString() : undefined
		};

		return { share: serializableShare };
	} catch (err) {
		console.error('載入出錯:', err);
		if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
			//到底三小問題?
			throw err;
		}
		throw error(500, '載入出錯');
	}
};
