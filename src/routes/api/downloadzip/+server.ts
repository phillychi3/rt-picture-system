import { getShareById } from '$lib/db';
import { randomUUID } from 'crypto';
import type { RequestHandler } from './$types';
import JSZip from 'jszip';

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) {
		return new Response('缺少參數id', {
			status: 400
		});
	}

	const share = await getShareById(id);
	if (!share) {
		return new Response('找不到分享項目', {
			status: 404
		});
	}
	try {
		const zip = new JSZip();
		for (const image of share.images) {
			try {
				const response = await fetch(image);
				if (!response.ok) {
					console.error(`下載圖片失敗: ${image}`, response.statusText);
					continue;
				}

				const imageBuffer = await response.arrayBuffer();
				let filename = '';
				const possibleFilename = image.split('/').pop().split('?').shift() || '';
				if (possibleFilename && possibleFilename.includes('.')) {
					filename = possibleFilename;
				} else {
					const contentDisposition = response.headers.get('Content-Disposition');
					if (contentDisposition) {
						const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
						if (matches && matches[1]) {
							filename = matches[1].replace(/['"]/g, '');
						}
					}
					if (!filename) {
						const contentType = response.headers.get('Content-Type') || '';
						let extension = '.jpg';

						if (contentType.includes('png')) extension = '.png';
						else if (contentType.includes('gif')) extension = '.gif';
						else if (contentType.includes('webp')) extension = '.webp';
						else if (contentType.includes('jpeg') || contentType.includes('jpg'))
							extension = '.jpg';

						filename = `image-${randomUUID()}${extension}`;
					}
				}

				let counter = 1;
				let finalFilename = filename;
				while (zip.file(finalFilename)) {
					const nameParts = filename.split('.');
					const extension = nameParts.pop() || '';
					const name = nameParts.join('.');
					finalFilename = `${name}_${counter}.${extension}`;
					counter++;
				}

				zip.file(finalFilename, Buffer.from(imageBuffer));
			} catch (error) {
				console.error(`下載圖片失敗: ${image}`, error);
				continue;
			}
		}
		const zipContent = await zip.generateAsync({ type: 'arraybuffer' });

		const filename = share.title || 'images';
		const encodedFilename = encodeURIComponent(filename).replace(/%20/g, ' ');

		return new Response(zipContent, {
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="${encodedFilename}.zip"; filename*=UTF-8''${encodeURIComponent(filename)}.zip`
			}
		});
	} catch (error) {
		console.error('下載出錯:', error);
		return new Response('下載出錯', {
			status: 500
		});
	}
};
