import type { Actions, PageServerLoad } from './$types';
import { createShare } from '$lib/db';
import { redirect, fail, error, isRedirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, '請先登入');
	}

	return {
		share: {
			title: '',
			name: '',
			images: [],
			description: ''
		},
		isAdmin: locals.user.role === 'admin'
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, '請先登入');
		}
		const formData = await request.formData();

		try {
			const title = formData.get('title') as string;
			const name = formData.get('name') as string;
			const description = formData.get('description') as string;
			const imagesStr = formData.get('images') as string;
			const images = imagesStr ? imagesStr.split(',').filter((url) => url.trim() !== '') : [];

			if (!title || !name) {
				return fail(400, {
					success: false,
					error: '標題和創建者名稱為必填項',
					share: { title, name, description, images }
				});
			}

			const shareData = {
				title,
				name,
				description,
				images
			};

			await createShare(shareData, locals.user.id);

			throw redirect(303, '/admin');
		} catch (err) {
			if (err instanceof Response) throw err;
			if (isRedirect(err)) throw redirect(303, '/admin'); // 世界最智障的事情

			console.error('保存分享數據時出錯:', err);
			return fail(500, {
				success: false,
				error: '保存分享數據時出錯: ' + (err instanceof Error ? err.message : String(err))
			});
		}
	}
};
