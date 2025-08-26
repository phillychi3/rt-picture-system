<script lang="ts">
	import { onMount } from 'svelte';
	import ImageViewer from '$lib/components/ImageViewer.svelte';
	export let data;

	$: share = data.share;
	let showImageViewer = false;
	let currentImageIndex = 0;
	let masonryInstance: any;

	let loadingImages: Record<number, boolean> = {};

	interface ImageObject {
		url: string;
		previewUrl?: string;
		filename?: string;
		contentType?: string;
	}

	type ImageInput = string | ImageObject;

	function getPreviewUrl(imageInput: ImageInput): string {
		if (typeof imageInput === 'string') {
			return imageInput;
		}
		return imageInput.previewUrl || imageInput.url;
	}

	function handleImageLoad(index: number) {
		loadingImages[index] = false;
	}

	$: if (share?.images) {
		share.images.forEach((_, i) => {
			if (loadingImages[i] === undefined) {
				loadingImages[i] = true;
			}
		});
	}

	function formatDate(dateStr: string | number | Date) {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleString();
	}
	function openImageViewer(index: number) {
		currentImageIndex = index;
		showImageViewer = true;
	}
	function closeImageViewer() {
		showImageViewer = false;
	}
	function handleResize() {
		if (masonryInstance) {
			masonryInstance.layout();
		}
	}

	let masonryContainer: HTMLElement;

	onMount(() => {
		if (typeof window !== 'undefined' && share.images && share.images.length > 0) {
			loadMasonry();
		}
	});

	async function loadMasonry() {
		try {
			const [Masonry, imagesLoaded] = await Promise.all([
				import('masonry-layout'),
				import('imagesloaded')
			]);
			if (!Masonry.default || !imagesLoaded.default) {
				console.error('cannot Masonry or imagesLoaded');
				return;
			}

			masonryInstance = new Masonry.default(masonryContainer, {
				itemSelector: '.masonry-item',
				columnWidth: '.masonry-sizer',
				percentPosition: true,
				transitionDuration: '0.2s',
				gutter: 16,
				fitWidth: false
			});
			imagesLoaded.default(masonryContainer, () => {
				masonryInstance.layout();
			});
		} catch (error) {
			console.error('加載 Masonry 失敗:', error);
		}
	}

	let isdownloading = false;

	const downloadAll = async () => {
		try {
			isdownloading = true;
			const response = await fetch(`/api/downloadzip?id=${share.id}`, {
				method: 'GET'
			});

			if (!response.ok) {
				throw new Error('下載失敗');
			}

			let filename = 'images.zip';

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			a.remove();
		} catch (error) {
			console.error('下載失敗:', error);
			alert('下載失敗，請稍後再試');
		} finally {
			isdownloading = false;
		}
	};
</script>

<svelte:head>
	<title>{share.title || '分享內容'}</title>
	<meta name="description" content={share.description || '分享內容'} />
	<meta property="og:title" content={share.title || '分享內容'} />
	<meta property="og:description" content={share.description || '分享內容'} />
	<meta property="og:image" content={share.images && share.images[0]} />
</svelte:head>

<svelte:window on:resize={handleResize} />

<div class="bg-background min-h-screen">
	<div class="mx-auto max-w-7xl px-4 py-8">
		<header
			class="border-border mb-8 flex flex-col gap-6 border-b pb-6 sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="space-y-2">
				<h1 class="text-foreground text-3xl font-bold tracking-tight">{share.title}</h1>
				<p class="text-muted-foreground">由 {share.name} 分享</p>
			</div>
			<div class="flex flex-col gap-4 sm:items-end">
				<button
					class="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					onclick={downloadAll}
					disabled={isdownloading}
				>
					{#if isdownloading}
						<svg
							class="mr-2 h-4 w-4 animate-spin"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						下載中...
					{:else}
						下載全部
					{/if}
				</button>
			</div>
		</header>

		{#if share.images && share.images.length > 0}
			<div class="masonry-wrapper w-full">
				<div class="masonry-container" bind:this={masonryContainer}>
					<div class="masonry-sizer w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"></div>
					{#each share.images as imageInput, i}
						<div class="masonry-item w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5" data-index={i}>
							<div
								class="group border-border bg-card relative m-2 cursor-pointer overflow-hidden rounded-lg border shadow-sm transition-all duration-300 hover:shadow-md"
								onclick={() => openImageViewer(i)}
								onkeypress={(e) => e.key === 'Enter' && openImageViewer(i)}
								tabindex="0"
								role="button"
								aria-label="圖片 {i + 1}, 點擊放大"
							>
								<div class="bg-muted relative">
									{#if loadingImages[i]}
										<div class="absolute inset-0 flex items-center justify-center">
											<svg
												class="text-muted-foreground h-8 w-8 animate-spin"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													class="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													stroke-width="4"
												></circle>
												<path
													class="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
										</div>
									{/if}
									<img
										src={getPreviewUrl(imageInput)}
										alt="{share.title} - 圖片 {i + 1}"
										class="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
										loading="lazy"
										decoding="async"
										style={loadingImages[i] ? 'opacity: 0;' : 'opacity: 1;'}
										onload={() => handleImageLoad(i)}
									/>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if share.description}
			<div class="prose mt-8 mb-8 max-w-none">
				<p class="text-card-foreground leading-relaxed whitespace-pre-line">
					{share.description}
				</p>
			</div>
		{/if}

		<div class="border-border mt-8 border-t pt-6">
			<div class="bg-muted rounded-lg p-4">
				<div class="text-muted-foreground space-y-2 text-sm">
					<p class="flex items-center gap-2">
						<span class="font-medium">創建於:</span>
						<span>{formatDate(share.createdAt)}</span>
					</p>
					{#if share.updatedAt}
						<p class="flex items-center gap-2">
							<span class="font-medium">最後更新:</span>
							<span>{formatDate(share.updatedAt)}</span>
						</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
{#if showImageViewer && share.images && share.images.length > 0}
	<ImageViewer
		images={share.images}
		bind:currentIndex={currentImageIndex}
		title={share.title}
		onClose={closeImageViewer}
	/>
{/if}
