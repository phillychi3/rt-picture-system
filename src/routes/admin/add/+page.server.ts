import type { Actions, PageServerLoad } from './$types';
import { createShare } from '$lib/db';
import { redirect, fail, error, isRedirect } from '@sveltejs/kit';
import { uploadFile } from '$lib/storage.server';
import { generateUniqueFileName, isValidImageType } from '$lib/storage-client';

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
			const urlImages = imagesStr ? imagesStr.split(',').filter((url) => url.trim() !== '') : [];

			// 處理上傳的檔案
			const uploadedImages: any[] = [];
			const files = formData.getAll('imageFiles') as File[];

			for (const file of files) {
				if (file && file.size > 0) {
					// 檢查檔案類型
					if (!isValidImageType(file.type)) {
						return fail(400, {
							success: false,
							error: `不支援的檔案格式: ${file.type}`,
							share: { title, name, description, images: urlImages }
						});
					}

					// 上傳到儲存服務
					const buffer = Buffer.from(await file.arrayBuffer());
					const key = generateUniqueFileName(file.name);
					const uploadResult = await uploadFile(buffer, key, file.type);

					if (uploadResult.success && uploadResult.url) {
						// 構建圖片對象，包含原圖和預覽圖
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

			// 將 URL 圖片轉換為統一格式
			const urlImageObjects = urlImages.map((url) => ({
				url,
				previewUrl: url,
				filename: url.split('/').pop() || 'unknown',
				contentType: 'image/unknown'
			}));

			// 合併 URL 圖片和上傳的圖片
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
