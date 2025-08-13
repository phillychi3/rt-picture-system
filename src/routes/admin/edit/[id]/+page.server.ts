import type { PageServerLoad, Actions } from './$types';
import { getShareById, updateShare, deleteShare } from '$lib/db';
import { error, redirect, fail, isRedirect } from '@sveltejs/kit';
import { uploadFile } from '$lib/storage.server';
import { generateUniqueFileName, isValidImageType } from '$lib/storage-client';

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
			const urlImages = imagesStr ? imagesStr.split(',').filter((url) => url.trim() !== '') : [];

			const uploadedImages: any[] = [];
			const files = formData.getAll('imageFiles') as File[];

			for (const file of files) {
				if (file && file.size > 0) {
					if (!isValidImageType(file.type)) {
						return fail(400, {
							success: false,
							error: `不支援的檔案格式: ${file.type}`,
							share: { title, name, description, images: urlImages }
						});
					}

					const buffer = Buffer.from(await file.arrayBuffer());
					const key = generateUniqueFileName(file.name);
					const uploadResult = await uploadFile(buffer, key, file.type);

					if (uploadResult.success && uploadResult.url) {
						const imageObj = {
							url: uploadResult.url,
							previewUrl: uploadResult.previewUrl || uploadResult.url,
							filename: file.name,
							contentType: file.type
						};
						uploadedImages.push(imageObj);
					} else {
						return fail(500, {
							success: false,
							error: `上傳圖片失敗: ${uploadResult.error}`,
							share: { title, name, description, images: urlImages }
						});
					}
				}
			}

			const urlImageObjects = urlImages.map((url) => ({
				url,
				previewUrl: url,
				filename: url.split('/').pop() || 'unknown',
				contentType: 'image/unknown'
			}));

			const allImages = [...urlImageObjects, ...uploadedImages];

			if (!title || !name) {
				return fail(400, {
					success: false,
					error: '標題和創建者名稱為必填項',
					share: { title, name, description, images: allImages }
				});
			}

			const shareData = {
				title,
				name,
				description,
				images: allImages
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
