<script lang="ts">
	import type { LayoutData } from './$types';
	import Header from '$lib/components/navbar.svelte';
	export let data: LayoutData;

	$: ({ share, error } = data);
</script>

<Header />
{#if error}
	<div class="error">
		{error}
	</div>
{:else if share}
	<slot />
{:else}
	<div class="loading">加載中...</div>
{/if}
