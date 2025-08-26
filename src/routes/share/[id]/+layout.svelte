<script lang="ts">
	import type { LayoutData } from './$types';
	import Header from '$lib/components/navbar.svelte';
	import { page } from '$app/state';
	export let data: LayoutData;

	$: ({ share } = data);

	$: firstImageUrl = share?.images?.[0]
		? typeof share.images[0] === 'string'
			? share.images[0]
			: share.images[0].url
		: null;
</script>

<svelte:head>
	<title>{share?.title || share?.name || '圖片分享'}</title>
	<meta
		name="description"
		content={share?.description || `查看 ${share?.title || share?.name || '圖片分享'}`}
	/>

	<meta property="og:title" content={share?.title || share?.name || '圖片分享'} />
	<meta
		property="og:description"
		content={share?.description || `查看 ${share?.title || share?.name || '圖片分享'}`}
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${page.url.origin}/share/${share?.id || ''}`} />
	{#if firstImageUrl}
		<meta property="og:image" content={firstImageUrl} />
		<meta property="og:image:alt" content={share?.title || share?.name || '分享圖片'} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={share?.title || share?.name || '圖片分享'} />
	<meta
		name="twitter:description"
		content={share?.description || `查看 ${share?.title || share?.name || '圖片分享'}`}
	/>
	{#if firstImageUrl}
		<meta name="twitter:image" content={firstImageUrl} />
	{/if}

	<meta name="robots" content="noindex, nofollow" />
</svelte:head><Header />
{#if share}
	<slot />
{:else}
	<div class="loading">加載中...</div>
{/if}
