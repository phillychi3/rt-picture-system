<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	export let form;
	export let data;

	let username = '';
	let password = '';
	let isSubmitting = false;
	onMount(() => {
		if (data.user) {
			goto('/admin');
		}
	});
	$: if (form?.success) {
		if (browser) {
			window.location.href = '/admin';
		}
	}

	function handleSubmit() {
		isSubmitting = true;
	}
</script>

<svelte:head>
	<title>管理員登入</title>
</svelte:head>

<div class="bg-background flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h2 class="text-foreground text-3xl font-bold tracking-tight">管理員登入</h2>
		</div>

		{#if form?.success}
			<div class="rounded-md border border-green-200 bg-green-50 p-4">
				<p class="text-green-800">登入成功！正在跳轉...</p>
			</div>
		{/if}

		{#if form?.error || data?.error}
			<div class="border-destructive/20 bg-destructive/10 rounded-md border p-4">
				<p class="text-destructive">{form?.error || data?.error}</p>
			</div>
		{/if}

		<div class="border-border rounded-lg border p-6 shadow-sm">
			<form method="POST" action="?/login" on:submit={handleSubmit} class="space-y-6">
				<div class="space-y-4">
					<div class="space-y-2">
						<label for="username" class="text-foreground text-sm font-medium">帳號</label>
						<input
							type="text"
							name="username"
							id="username"
							required
							bind:value={username}
							class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="請輸入用戶名"
							autocomplete="username"
						/>
					</div>
					<div class="space-y-2">
						<label for="password" class="text-foreground text-sm font-medium">密碼</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							bind:value={password}
							placeholder="請輸入密碼"
							autocomplete="current-password"
							class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>
				</div>
				<button
					type="submit"
					disabled={isSubmitting}
					class="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
				>
					{#if isSubmitting}
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
						登入中...
					{:else}
						登入
					{/if}
				</button>
			</form>
		</div>
	</div>
</div>
