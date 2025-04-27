<script lang="ts">
	import { onMount } from 'svelte';
	export let data;

	$: share = data.share;

	let showLightbox = false;
	let currentImageIndex = 0;
	let lightboxElement: HTMLDivElement;
	let masonryInstance: any;

	let loadingImages: Record<number, boolean> = {};

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

	function openLightbox(index: number) {
		currentImageIndex = index;
		showLightbox = true;
		setTimeout(() => {
			if (lightboxElement) lightboxElement.focus();
		}, 50);
	}

	function closeLightbox() {
		showLightbox = false;
	}

	function nextImage() {
		if (share.images && share.images.length > 0) {
			currentImageIndex = (currentImageIndex + 1) % share.images.length;
		}
	}

	function prevImage() {
		if (share.images && share.images.length > 0) {
			currentImageIndex = (currentImageIndex - 1 + share.images.length) % share.images.length;
		}
	}

	function handleKeydown(event: { key: any; preventDefault: () => void }) {
		if (!showLightbox) return;

		switch (event.key) {
			case 'ArrowRight':
				nextImage();
				event.preventDefault();
				break;
			case 'ArrowLeft':
				prevImage();
				event.preventDefault();
				break;
			case 'Escape':
				closeLightbox();
				event.preventDefault();
				break;
		}
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
				gutter: 20,
				fitWidth: false
			});

			imagesLoaded
				.default(masonryContainer)
				.on('progress', () => {
					masonryInstance.layout();
				})
				.on('done', () => {
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

<svelte:window on:keydown={handleKeydown} on:resize={handleResize} />

<div class="mx-auto max-w-full px-4 py-8">
	<header class="mb-8 flex items-center border-b border-gray-200 pb-4">
		<div>
			<h1 class="mb-2 text-3xl font-bold text-gray-900">{share.title}</h1>
			<p class="text-gray-600 italic">由 {share.name} 分享</p>
		</div>
		<div class="ml-auto">
			<button
				class="flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-green-700 disabled:bg-green-400"
				onclick={downloadAll}
				disabled={isdownloading}
			>
				{#if isdownloading}
					<svg
						class="mr-2 h-4 w-4 animate-spin text-white"
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

				{#each share.images as imageUrl, i}
					<div class="masonry-item w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5">
						<div
							class="m-2 cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
							onclick={() => openLightbox(i)}
							onkeypress={(e) => e.key === 'Enter' && openLightbox(i)}
							tabindex="0"
							role="button"
							aria-label="圖片 {i + 1}, 點擊放大"
						>
							<div class="relative bg-gray-100">
								{#if loadingImages[i]}
									<div class="absolute inset-0 flex items-center justify-center">
										<svg
											class="h-10 w-10 animate-spin text-gray-400"
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
									src={imageUrl}
									alt="{share.title} - 圖片 {i + 1}"
									class="h-auto w-full object-cover"
									loading="lazy"
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
			<p class="whitespace-pre-line text-gray-700">{share.description}</p>
		</div>
	{/if}

	<div class="mt-8 border-t border-gray-200 pt-4 text-sm text-gray-500">
		<p>創建於: {formatDate(share.createdAt)}</p>
		{#if share.updatedAt}
			<p>最後更新: {formatDate(share.updatedAt)}</p>
		{/if}
	</div>
</div>

{#if showLightbox && share.images && share.images.length > 0}
	<div
		class="bg-opacity-90 fixed inset-0 z-50 flex items-center justify-center bg-black"
		onclick={closeLightbox}
		onkeydown={(e) => e.key === 'Escape' && closeLightbox()}
		bind:this={lightboxElement}
		tabindex="0"
		role="dialog"
		aria-modal="true"
		aria-label="圖片檢視器"
	>
		<section class="relative max-h-[90vh] max-w-5xl" role="document">
			<img
				src={share.images[currentImageIndex]}
				alt="{share.title} - 圖片 {currentImageIndex + 1}"
				class="max-h-[85vh] max-w-full object-contain"
			/>

			<button
				type="button"
				class="bg-opacity-50 hover:bg-opacity-70 absolute top-1/2 left-2 z-20 -translate-y-1/2 rounded-full bg-black p-2 text-white"
				onclick={(e) => {
					e.stopPropagation();
					prevImage();
				}}
				aria-label="上一張圖片"
			>
				&lt;
			</button>

			<button
				type="button"
				class="bg-opacity-50 hover:bg-opacity-70 absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-full bg-black p-2 text-white"
				onclick={(e) => {
					e.stopPropagation();
					nextImage();
				}}
				aria-label="下一張圖片"
			>
				&gt;
			</button>

			<div class="mt-2 text-center text-white">
				{currentImageIndex + 1} / {share.images.length}
			</div>

			<button
				type="button"
				class="bg-opacity-50 hover:bg-opacity-70 absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"
				onclick={(e) => {
					e.stopPropagation();
					closeLightbox();
				}}
				aria-label="關閉圖片檢視器"
			>
				✕
			</button>
		</section>
	</div>
{/if}
