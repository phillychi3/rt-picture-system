<script lang="ts">
	import { onMount } from 'svelte';
	import pkg from 'exifr';
	const { parse } = pkg;

	let { imageUrl, imageName = '' } = $props();

	let exifData: Record<string, any> | null = $state(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function loadExifData() {
		if (!imageUrl) return;

		try {
			loading = true;
			error = null;
			const data = await parse(imageUrl, true);

			exifData = data;
		} catch (err) {
			console.error('無法讀取 EXIF 資訊:', err);
			error = '無法讀取 EXIF 資訊';
			exifData = null;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadExifData();
	});

	$effect(() => {
		if (imageUrl) {
			loadExifData();
		}
	});
	1;

	function formatExifValue(key: string, value: any): string {
		if (value === null || value === undefined) return '無';

		switch (key) {
			case 'DateTime':
			case 'DateTimeOriginal':
			case 'DateTimeDigitized':
				return new Date(value).toLocaleString();
			case 'FocalLength':
				return `${value}mm`;
			case 'FNumber':
				return `f/${value}`;
			case 'ExposureTime':
				return typeof value === 'number' && value < 1 ? `1/${Math.round(1 / value)}s` : `${value}s`;
			case 'ISO':
				return `ISO ${value}`;
			case 'ImageWidth':
			case 'ImageHeight':
			case 'ExifImageWidth':
			case 'ExifImageHeight':
				return `${value}px`;
			case 'Flash':
				return value === 0 ? '無閃光燈' : '使用閃光燈';
			case 'WhiteBalance':
				return value === 0 ? '自動' : '手動';
			default:
				if (typeof value === 'object') {
					return JSON.stringify(value);
				}
				return String(value);
		}
	}

	function getDisplayName(key: string): string {
		const displayNames: Record<string, string> = {
			Make: '相機品牌',
			Model: '相機型號',
			DateTime: '拍攝時間',
			DateTimeOriginal: '原始拍攝時間',
			DateTimeDigitized: '數位化時間',
			ImageWidth: '圖片寬度',
			ImageHeight: '圖片高度',
			ExifImageWidth: 'EXIF 圖片寬度',
			ExifImageHeight: 'EXIF 圖片高度',
			FocalLength: '焦距',
			FNumber: '光圈值',
			ExposureTime: '快門速度',
			ISO: 'ISO 感光度',
			Flash: '閃光燈',
			WhiteBalance: '白平衡',
			Orientation: '方向',
			XResolution: '水平解析度',
			YResolution: '垂直解析度',
			ResolutionUnit: '解析度單位',
			Software: '軟體',
			Artist: '作者',
			Copyright: '版權',
			ColorSpace: '色彩空間',
			ExposureMode: '曝光模式',
			ExposureProgram: '曝光程式',
			MeteringMode: '測光模式',
			LensModel: '鏡頭型號',
			LensMake: '鏡頭品牌'
		};
		return displayNames[key] || key;
	}

	function getImportantFields(): string[] {
		return [
			'Make',
			'Model',
			'LensMake',
			'LensModel',
			'DateTime',
			'DateTimeOriginal',
			'ImageWidth',
			'ImageHeight',
			'FocalLength',
			'FNumber',
			'ExposureTime',
			'ISO',
			'Flash',
			'WhiteBalance'
		];
	}
</script>

<div class="flex h-full flex-col bg-white">
	<div class="border-b border-gray-200 p-3 md:p-4">
		<h3 class="text-base font-semibold text-gray-900 md:text-lg">圖片資訊</h3>
		{#if imageName}
			<p class="mt-1 text-xs text-gray-600 md:text-sm">{imageName}</p>
		{/if}
	</div>

	<div class="flex-1 overflow-y-auto p-3 md:p-4">
		{#if loading}
			<div class="flex items-center justify-center py-6 md:py-8">
				<div class="flex items-center space-x-2">
					<svg
						class="h-4 w-4 animate-spin text-gray-400 md:h-5 md:w-5"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span class="text-xs text-gray-500 md:text-sm">載入 EXIF 資訊中...</span>
				</div>
			</div>
		{:else if error}
			<div class="rounded-md bg-red-50 p-4">
				<div class="flex">
					<div class="flex-shrink-0">
						<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">錯誤</h3>
						<div class="mt-1 text-sm text-red-700">
							<p>{error}</p>
						</div>
					</div>
				</div>
			</div>
		{:else if exifData}
			<div class="space-y-4 md:space-y-6">
				<div class="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-4">
					<h4
						class="mb-3 flex items-center text-sm font-semibold text-gray-900 md:mb-4 md:text-base"
					>
						<svg
							class="mr-2 h-4 w-4 text-blue-600 md:h-5 md:w-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						拍攝資訊
					</h4>
					<div class="grid gap-2 md:gap-3">
						{#each getImportantFields() as field}
							{#if exifData[field] !== undefined && exifData[field] !== null}
								<div
									class="bg-opacity-60 flex flex-col gap-1 rounded-md bg-white px-2 py-2 shadow-sm md:px-3 md:py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-2"
								>
									<span class="flex-shrink-0 text-xs font-medium text-gray-700 md:text-sm"
										>{getDisplayName(field)}</span
									>
									<span
										class="rounded-md bg-white px-1.5 py-0.5 text-right text-xs font-semibold break-words text-gray-900 shadow-sm md:px-2 md:py-1 md:text-sm"
										>{formatExifValue(field, exifData[field])}</span
									>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<div class="rounded-md bg-gray-50 p-4">
				<div class="text-center">
					<svg
						class="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					<h3 class="mt-2 text-sm font-medium text-gray-900">無 EXIF 資訊</h3>
					<p class="mt-1 text-sm text-gray-500">此圖片不包含 EXIF 資訊或無法讀取</p>
				</div>
			</div>
		{/if}
	</div>
</div>
