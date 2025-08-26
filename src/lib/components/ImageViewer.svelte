<script lang="ts">
	import ExifInfo from './ExifInfo.svelte';

	interface ImageObject {
		url: string;
		previewUrl?: string;
		filename?: string;
		contentType?: string;
	}

	type ImageInput = string | ImageObject;

	let {
		images,
		currentIndex = $bindable(0),
		title = '',
		onClose
	}: {
		images: ImageInput[];
		currentIndex: number;
		title?: string;
		onClose: () => void;
		onNext?: () => void;
		onPrev?: () => void;
	} = $props();

	function getImageUrl(imageInput: ImageInput): string {
		return typeof imageInput === 'string' ? imageInput : imageInput.url;
	}

	function getPreviewUrl(imageInput: ImageInput): string {
		if (typeof imageInput === 'string') {
			return imageInput;
		}
		return imageInput.previewUrl || imageInput.url;
	}

	let showExifSidebar = $state(false);
	let imageLoading = $state(false);
	let fullImageLoaded = $state(false);
	let loadingProgress = $state(0);
	let imageElement: HTMLImageElement;
	let previewElement: HTMLImageElement;
	let windowWidth = $state(1024);
	let isDragging = $state(false);
	let dragStartTime = $state(0);
	let lastKeyTime = $state(0);

	let imageCache = $state(new Map<string, string>());

	let loadingStateCache = $state(new Map<string, boolean>());

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
			const currentImage = images[currentIndex];
			const fullImageUrl = getImageUrl(currentImage);

			if (loadingStateCache.get(fullImageUrl)) {
				fullImageLoaded = true;
				imageLoading = false;
				loadingProgress = 100;
			} else {
				imageLoading = true;
				fullImageLoaded = false;
				loadingProgress = 0;
				loadFullImage();
			}

			preloadAdjacentImages();
		}
	});

	function preloadAdjacentImages() {
		if (!images || images.length <= 1) return;

		const nextIndex = (currentIndex + 1) % images.length;
		const nextImageUrl = getImageUrl(images[nextIndex]);
		if (!loadingStateCache.get(nextImageUrl)) {
			preloadImage(nextImageUrl);
		}

		const prevIndex = (currentIndex - 1 + images.length) % images.length;
		const prevImageUrl = getImageUrl(images[prevIndex]);
		if (!loadingStateCache.get(prevImageUrl)) {
			preloadImage(prevImageUrl);
		}
	}

	async function preloadImage(imageUrl: string) {
		if (imageCache.has(imageUrl) || loadingStateCache.get(imageUrl)) {
			return;
		}

		try {
			const response = await fetch(imageUrl);
			if (response.ok) {
				const blob = await response.blob();
				const objectUrl = URL.createObjectURL(blob);

				const img = new Image();
				img.onload = () => {
					imageCache.set(imageUrl, objectUrl);
					loadingStateCache.set(imageUrl, true);
				};
				img.onerror = () => {
					URL.revokeObjectURL(objectUrl);
				};
				img.src = objectUrl;
			}
		} catch (error) {
			console.error('預載入圖片失敗:', error);
		}
	}

	async function loadFullImage() {
		const currentImage = images[currentIndex];
		const fullImageUrl = getImageUrl(currentImage);
		const previewUrl = getPreviewUrl(currentImage);

		if (imageCache.has(fullImageUrl)) {
			fullImageLoaded = true;
			imageLoading = false;
			loadingProgress = 100;
			return;
		}

		// 如果完整圖片 URL 與預覽 URL 相同，直接標記為已載入並緩存
		if (fullImageUrl === previewUrl) {
			fullImageLoaded = true;
			imageLoading = false;
			loadingProgress = 100;

			imageCache.set(fullImageUrl, fullImageUrl);
			loadingStateCache.set(fullImageUrl, true);
			return;
		}

		imageLoading = true;
		loadingProgress = 5;

		try {
			const xhr = new XMLHttpRequest();

			xhr.open('GET', fullImageUrl, true);
			xhr.responseType = 'blob';

			xhr.onprogress = (event) => {
				if (event.lengthComputable) {
					loadingProgress = Math.round((event.loaded / event.total) * 100);
				} else {
					// 如果無法計算進度，使用間接進度指示
					loadingProgress = Math.min(loadingProgress + 5, 90);
				}
			};

			xhr.onload = () => {
				if (xhr.status === 200) {
					const blob = xhr.response;
					const objectUrl = URL.createObjectURL(blob);

					const img = new Image();
					img.onload = () => {
						fullImageLoaded = true;
						imageLoading = false;
						loadingProgress = 100;

						imageCache.set(fullImageUrl, objectUrl);
						loadingStateCache.set(fullImageUrl, true);
					};
					img.onerror = () => {
						imageLoading = false;
						loadingProgress = 0;
						URL.revokeObjectURL(objectUrl);
					};
					img.src = objectUrl;
				} else {
					imageLoading = false;
					loadingProgress = 0;
				}
			};

			xhr.onerror = () => {
				imageLoading = false;
				loadingProgress = 0;
			};

			xhr.send();
		} catch (error) {
			console.error('載入完整圖片失敗:', error);
			imageLoading = false;
			loadingProgress = 0;
		}
	}

	function handleImageError() {
		imageLoading = false;
		loadingProgress = 0;
	}

	function handleMouseDown(event: MouseEvent) {
		isDragging = false;
		dragStartTime = Date.now();
	}

	function handleMouseMove(event: MouseEvent) {
		if (Date.now() - dragStartTime > 100) {
			isDragging = true;
		}
	}

	function handleMouseUp(event: MouseEvent) {
		setTimeout(() => {
			isDragging = false;
		}, 100);
	}

	function handleDragStart(event: DragEvent) {
		isDragging = true;
		event.preventDefault();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (isDragging || Date.now() - dragStartTime < 200) {
			return;
		}

		const now = Date.now();
		if (now - lastKeyTime < 100) {
			return;
		}
		lastKeyTime = now;

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
				handleClose();
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
		if (images && images.length > 0 && !isDragging) {
			const newIndex = (currentIndex + 1) % images.length;
			currentIndex = newIndex;
		}
	}

	function prevImage() {
		if (images && images.length > 0 && !isDragging) {
			const newIndex = (currentIndex - 1 + images.length) % images.length;
			currentIndex = newIndex;
		}
	}

	function handleClose() {
		onClose();
	}

	function handleOverlayClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function cleanup() {
		imageCache.forEach((objectUrl, imageUrl) => {
			if (objectUrl.startsWith('blob:')) {
				URL.revokeObjectURL(objectUrl);
			}
		});
		imageCache.clear();
		loadingStateCache.clear();
	}

	$effect(() => {
		return () => {
			cleanup();
		};
	});
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
			<img
				bind:this={previewElement}
				src={getPreviewUrl(images[currentIndex])}
				alt="{title} - 圖片 {currentIndex + 1} (預覽)"
				class="max-h-full max-w-full object-contain transition-opacity duration-300"
				class:opacity-100={!fullImageLoaded}
				class:opacity-0={fullImageLoaded}
				onerror={handleImageError}
				onmousedown={handleMouseDown}
				onmousemove={handleMouseMove}
				onmouseup={handleMouseUp}
				ondragstart={handleDragStart}
				style="position: absolute;"
				draggable="false"
			/>

			<img
				bind:this={imageElement}
				src={imageCache.get(getImageUrl(images[currentIndex])) || getImageUrl(images[currentIndex])}
				alt="{title} - 圖片 {currentIndex + 1}"
				class="max-h-full max-w-full object-contain transition-opacity duration-500"
				class:opacity-0={!fullImageLoaded}
				class:opacity-100={fullImageLoaded}
				onmousedown={handleMouseDown}
				onmousemove={handleMouseMove}
				onmouseup={handleMouseUp}
				ondragstart={handleDragStart}
				style="position: relative;"
				draggable="false"
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

			{#if imageLoading}
				<div
					class="bg-opacity-75 absolute right-2 bottom-2 z-20 rounded-lg bg-black px-3 py-2 text-white md:right-4 md:bottom-4"
				>
					<div class="flex items-center space-x-2">
						<svg
							class="h-4 w-4 animate-spin text-white"
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
						<span class="text-sm">{loadingProgress > 0 ? loadingProgress : 0}%</span>
					</div>
					<div class="mt-1 h-1 w-16 rounded-full bg-gray-600">
						<div
							class="h-full rounded-full bg-white transition-all duration-300"
							style="width: {loadingProgress > 0 ? loadingProgress : 5}%"
						></div>
					</div>
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
		<ExifInfo imageUrl={getImageUrl(images[currentIndex])} imageName="圖片 {currentIndex + 1}" />
	</div>

	<div class="fixed top-2 left-2 z-20 flex space-x-2 md:top-4 md:left-4">
		<button
			type="button"
			class="bg-opacity-50 hover:bg-opacity-70 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-all md:h-10 md:w-10"
			onclick={(e) => {
				e.stopPropagation();
				handleClose();
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
