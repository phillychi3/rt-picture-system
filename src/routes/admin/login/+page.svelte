<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Header from '$lib/components/navbar.svelte';
	export let form;
	export let data;

	let username = '';
	let password = '';
	let isSubmitting = false;

	onMount(() => {
		if (data.user) {
			window.location.href = '/admin';
		}
	});
	$: if (form?.success) {
		console.log('登入成功，即將跳轉...');
		if (browser) {
			goto('/admin');
			invalidateAll();
		}
	}

	function handleSubmit() {
		isSubmitting = true;
	}
</script>

<svelte:head>
	<title>管理員登入</title>
</svelte:head>

<Header />
<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">管理員登入</h2>
		</div>

		{#if form?.success}
			<div class="rounded-md border-l-4 border-green-500 bg-green-50 p-4">
				<p class="text-green-700">登入成功！正在跳轉...</p>
			</div>
		{/if}

		{#if form?.error || data?.error}
			<div class="rounded-md border-l-4 border-red-500 bg-red-50 p-4">
				<p class="text-red-700">{form?.error || data?.error}</p>
			</div>
		{/if}

		<form method="POST" action="?/login" on:submit={handleSubmit} class="mt-8 space-y-6">
			<div class="space-y-4 md:space-y-6">
				<div>
					<label for="email" class="mb-2 block text-sm font-medium text-gray-900"
						>Account</label
					>
					<input
						type="text"
						name="username"
						id="username"
						required
						bind:value={username}
						class="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900"
						placeholder="用戶名"
						autocomplete="username"
					/>
				</div>
				<div>
					<label for="password" class="mb-2 block text-sm font-medium text-gray-900">Password</label
					>
					<input
						id="password"
						name="password"
						type="password"
						required
						bind:value={password}
						placeholder="••••••••"
						autocomplete="current-password"
						class="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900"
					/>
				</div>
			</div>
			<div>
				<button
					type="submit"
					disabled={isSubmitting}
					class="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isSubmitting}
						<span class="absolute inset-y-0 left-0 flex items-center pl-3">
							<svg
								class="h-5 w-5 animate-spin text-white"
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
						</span>
						登入中...
					{:else}
						登入
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
