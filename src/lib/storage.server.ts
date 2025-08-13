import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '$env/dynamic/private';
import sharp from 'sharp';
import type { UploadResult, StorageProvider } from './storage-client.js';

interface StorageConfig {
	client: S3Client;
	bucket: string;
	publicUrl: string;
}

function createS3Client(): StorageConfig {
	const client = new S3Client({
		region: env.AWS_REGION || 'us-east-1',
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID || '',
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY || ''
		}
	});

	const bucket = env.AWS_S3_BUCKET || '';
	const publicUrl = `https://${bucket}.s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com`;

	return { client, bucket, publicUrl };
}

function createR2Client(): StorageConfig {
	const client = new S3Client({
		region: 'auto',
		endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
			secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || ''
		}
	});

	const bucket = env.CLOUDFLARE_R2_BUCKET || '';

	const customDomain = env.CLOUDFLARE_R2_CUSTOM_DOMAIN;
	const publicUrl =
		customDomain ||
		env.CLOUDFLARE_R2_PUBLIC_URL ||
		`https://${bucket}.${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

	return { client, bucket, publicUrl };
}

function getStorageConfig(): StorageConfig {
	const provider = (env.STORAGE_PROVIDER || 'aws-s3') as StorageProvider;

	switch (provider) {
		case 'cloudflare-r2':
			return createR2Client();
		case 'aws-s3':
		default:
			return createS3Client();
	}
}

export async function generatePresignedUploadUrl(
	key: string,
	contentType: string
): Promise<string> {
	const { client, bucket } = getStorageConfig();

	const command = new PutObjectCommand({
		Bucket: bucket,
		Key: key,
		ContentType: contentType
	});

	return await getSignedUrl(client, command, { expiresIn: 3600 });
}

async function generateWebpPreview(buffer: Buffer): Promise<Buffer> {
	return await sharp(buffer)
		.webp({ quality: 80 })
		.resize(1200, 1200, {
			fit: 'inside',
			withoutEnlargement: true
		})
		.toBuffer();
}

export async function uploadFile(
	buffer: Buffer,
	key: string,
	contentType: string
): Promise<UploadResult> {
	try {
		const { client, bucket, publicUrl } = getStorageConfig();

		const originalCommand = new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: buffer,
			ContentType: contentType
		});

		await client.send(originalCommand);
		const url = `${publicUrl}/${key}`;

		let previewUrl: string | undefined;

		if (contentType.startsWith('image/')) {
			try {
				const webpBuffer = await generateWebpPreview(buffer);
				const previewKey = key.replace(/\.[^/.]+$/, '_preview.webp');

				const previewCommand = new PutObjectCommand({
					Bucket: bucket,
					Key: previewKey,
					Body: webpBuffer,
					ContentType: 'image/webp'
				});

				await client.send(previewCommand);
				previewUrl = `${publicUrl}/${previewKey}`;
			} catch (previewError) {
				console.warn('WebP 預覽生成失敗:', previewError);
			}
		}

		return {
			success: true,
			url,
			key,
			previewUrl
		};
	} catch (error) {
		console.error('儲存服務上傳錯誤:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : '未知錯誤'
		};
	}
}

export async function deleteFile(key: string): Promise<boolean> {
	try {
		const { client, bucket } = getStorageConfig();

		const command = new DeleteObjectCommand({
			Bucket: bucket,
			Key: key
		});

		await client.send(command);
		return true;
	} catch (error) {
		console.error('儲存服務刪除錯誤:', error);
		return false;
	}
}

export function getCurrentStorageProvider(): StorageProvider {
	return (env.STORAGE_PROVIDER || 'aws-s3') as StorageProvider;
}
