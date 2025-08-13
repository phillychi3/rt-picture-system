export interface UploadResult {
	success: boolean;
	url?: string;
	key?: string;
	previewUrl?: string;
	error?: string;
}

export type StorageProvider = 'aws-s3' | 'cloudflare-r2';

/**
 * 生成唯一的文件名
 */
export function generateUniqueFileName(originalName: string): string {
	const timestamp = Date.now();
	const randomString = Math.random().toString(36).substring(2, 8);
	const extension = originalName.split('.').pop();
	return `images/${timestamp}-${randomString}.${extension}`;
}

/**
 * 檢查文件類型是否為支援的圖片格式
 */
export function isValidImageType(contentType: string): boolean {
	const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
	return validTypes.includes(contentType);
}
