<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/navbar.svelte';
	let { children } = $props();
</script>

{@render children()}
