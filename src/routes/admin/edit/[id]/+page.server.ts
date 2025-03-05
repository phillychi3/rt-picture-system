import type { PageServerLoad, Actions } from './$types';
import { getShareById, updateShare, deleteShare } from '$lib/db';
import { error, redirect, fail, isRedirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals, depends }) => {
	const { id } = params;

	if (!locals.user) {
		throw error(401, '請先登入');
	}
	depends('shares:' + id);

	try {
		const isAdmin = locals.user.role === 'admin';
		const share = await getShareById(id, isAdmin ? undefined : locals.user.id);

		if (!share) {
			throw error(404, '找不到該分享內容或您沒有權限查看');
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
		console.error('加載分享數據時出錯:', err);

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, '加載分享數據時出錯');
	}
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const { id } = params;
		const formData = await request.formData();

		if (!locals.user) {
			throw error(401, '請先登入');
		}

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

			const isAdmin = locals.user.role === 'admin';
			await updateShare(id, shareData, locals.user.id, isAdmin);

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
	},

	delete: async ({ params, locals }) => {
		const { id } = params;
		if (!locals.user) {
			throw error(401, '請先登入');
		}
		try {
			const isAdmin = locals.user.role === 'admin';

			await deleteShare(id, locals.user.id, isAdmin);
			return redirect(303, '/admin');
		} catch (err) {
			if (isRedirect(err)) throw redirect(303, '/admin'); // 世界最智障的事情
			console.error('刪除分享數據時出錯:', err);
			return fail(500, {
				success: false,
				error: '刪除分享數據時出錯: ' + (err instanceof Error ? err.message : String(err))
			});
		}
	}
};
