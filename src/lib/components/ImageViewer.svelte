<script lang="ts">
	import ExifInfo from './ExifInfo.svelte';
	let {
		images,
		currentIndex = $bindable(0),
		title = '',
		onClose
	}: {
		images: string[];
		currentIndex: number;
		title?: string;
		onClose: () => void;
		onNext?: () => void;
		onPrev?: () => void;
	} = $props();
	let showExifSidebar = $state(false);
	let imageLoading = $state(false);
	let imageElement: HTMLImageElement;
	let windowWidth = $state(1024);

	$effect(() => {
		if (typeof window !== 'undefined') {
			windowWidth = window.innerWidth;

			showExifSidebar = windowWidth >= 1024;

			const handleResize = () => {
				const newWidth = window.innerWidth;

				if (windowWidth >= 1024 && newWidth < 1024) {
					showExifSidebar = false;
				} else if (windowWidth < 1024 && newWidth >= 1024) {
					showExifSidebar = true;
				}
				windowWidth = newWidth;
			};
			window.addEventListener('resize', handleResize);
			return () => window.removeEventListener('resize', handleResize);
		}
	});

	$effect(() => {
		if (images[currentIndex]) {
			imageLoading = true;
		}
	});

	function handleImageLoad() {
		imageLoading = false;
	}

	function handleImageError() {
		imageLoading = false;
	}
	function handleKeydown(event: KeyboardEvent) {
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
				onClose();
				event.preventDefault();
				break;
			case 'i':
			case 'I':
				showExifSidebar = !showExifSidebar;
				event.preventDefault();
				break;
		}
	}
	function nextImage() {
		if (images && images.length > 0) {
			currentIndex = (currentIndex + 1) % images.length;
		}
	}

	function prevImage() {
		if (images && images.length > 0) {
			currentIndex = (currentIndex - 1 + images.length) % images.length;
		}
	}

	function handleOverlayClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="bg-opacity-95 fixed inset-0 z-50 flex bg-black"
	onclick={handleOverlayClick}
	onkeydown={handleKeydown}
	role="dialog"
	aria-modal="true"
	aria-label="圖片檢視器"
	tabindex="0"
>
	<div class="flex flex-1 transition-all duration-300" class:lg:pr-96={showExifSidebar}>
		<div class="relative flex flex-1 items-center justify-center p-2 md:p-4">
			{#if imageLoading}
				<div class="bg-opacity-50 absolute inset-0 z-10 flex items-center justify-center bg-black">
					<div class="flex flex-col items-center space-y-3">
						<svg
							class="h-8 w-8 animate-spin text-white"
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
						<span class="text-sm text-white">載入中...</span>
					</div>
				</div>
			{/if}

			<img
				bind:this={imageElement}
				src={images[currentIndex]}
				alt="{title} - 圖片 {currentIndex + 1}"
				class="max-h-full max-w-full object-contain transition-opacity duration-300"
				class:opacity-50={imageLoading}
				onload={handleImageLoad}
				onerror={handleImageError}
			/>

			{#if images.length > 1}
				<button
					type="button"
					class="bg-opacity-50 hover:bg-opacity-70 absolute top-1/2 left-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white transition-all md:left-4 md:h-12 md:w-12"
					onclick={(e) => {
						e.stopPropagation();
						prevImage();
					}}
					aria-label="上一張圖片"
				>
					<svg class="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</button>

				<button
					type="button"
					class="bg-opacity-50 hover:bg-opacity-70 absolute top-1/2 right-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white transition-all md:right-4 md:h-12 md:w-12"
					onclick={(e) => {
						e.stopPropagation();
						nextImage();
					}}
					aria-label="下一張圖片"
				>
					<svg class="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>
			{/if}

			{#if images.length > 1}
				<div
					class="bg-opacity-50 absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black px-3 py-1 text-sm text-white md:bottom-4 md:px-4 md:py-2 md:text-base"
				>
					{currentIndex + 1} / {images.length}
				</div>
			{/if}
		</div>
	</div>

	<div
		class="fixed top-0 right-0 z-30 h-full transform bg-white shadow-xl transition-transform duration-300"
		class:w-full={showExifSidebar && windowWidth < 1024}
		class:lg:w-96={showExifSidebar && windowWidth >= 1024}
		class:translate-x-0={showExifSidebar}
		class:translate-x-full={!showExifSidebar}
	>
		{#if windowWidth < 1024}
			<div class="absolute top-4 right-4 z-40">
				<button
					type="button"
					class="bg-opacity-75 hover:bg-opacity-90 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white transition-all"
					onclick={(e) => {
						e.stopPropagation();
						showExifSidebar = false;
					}}
					aria-label="關閉資訊面板"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		{/if}
		<ExifInfo imageUrl={images[currentIndex]} imageName="圖片 {currentIndex + 1}" />
	</div>

	<div class="fixed top-2 left-2 z-20 flex space-x-2 md:top-4 md:left-4">
		<button
			type="button"
			class="bg-opacity-50 hover:bg-opacity-70 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-all md:h-10 md:w-10"
			onclick={(e) => {
				e.stopPropagation();
				onClose();
			}}
			aria-label="關閉圖片檢視器"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
		<button
			type="button"
			class="bg-opacity-50 hover:bg-opacity-70 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-all md:h-10 md:w-10"
			class:bg-blue-600={showExifSidebar}
			class:bg-opacity-80={showExifSidebar}
			onclick={(e) => {
				e.stopPropagation();
				showExifSidebar = !showExifSidebar;
			}}
			aria-label="切換 EXIF 資訊顯示"
			title="按 I 鍵切換資訊面板"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
		</button>
	</div>
	<div
		class="bg-opacity-50 fixed bottom-2 left-2 z-20 hidden rounded-lg bg-black p-2 text-xs text-white md:bottom-4 md:left-4 md:block md:p-3 md:text-sm"
	>
		<div class="space-y-1">
			<div>← → 切換圖片</div>
			<div>ESC 關閉</div>
			<div>I 切換資訊</div>
		</div>
	</div>
</div>
