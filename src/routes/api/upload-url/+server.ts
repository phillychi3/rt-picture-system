import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { generatePresignedUploadUrl, getCurrentStorageProvider } from '$lib/storage.server';
import { generateUniqueFileName, isValidImageType } from '$lib/storage-client';

export const POST = async ({ request, locals }: RequestEvent) => {
	if (!locals.user) {
		throw error(401, '請先登入');
	}

	try {
		const { fileName, contentType } = await request.json();

		if (!fileName || !contentType) {
			throw error(400, '缺少必要參數');
		}

		if (!isValidImageType(contentType)) {
			throw error(400, '不支援的檔案格式');
		}

		const key = generateUniqueFileName(fileName);

		const presignedUrl = await generatePresignedUploadUrl(key, contentType);

		const provider = getCurrentStorageProvider();
		let publicUrl: string;

		if (provider === 'cloudflare-r2') {
			const customUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
			if (customUrl) {
				publicUrl = `${customUrl}/${key}`;
			} else {
				publicUrl = `https://${process.env.CLOUDFLARE_R2_BUCKET}.${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
			}
		} else {
			publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
		}

		return json({
			success: true,
			uploadUrl: presignedUrl,
			key,
			publicUrl,
			provider
		});
	} catch (err) {
		console.error('生成預簽名 URL 失敗:', err);

		if (err instanceof Response) {
			throw err;
		}

		throw error(500, '生成上傳 URL 失敗');
	}
};
