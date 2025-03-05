<script lang="ts">
	import { goto } from '$app/navigation';

	export let data;

	function createNewShare() {
		goto('/admin/add');
	}

	function editShare(id: string) {
		goto(`/admin/edit/${id}`);
	}

	$: isAdmin = data.isAdmin;

	function formatDate(dateStr: string) {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString();
	}
</script>

<svelte:head>
	<title>管理分享內容</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
	<header class="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
		<h1 class="text-3xl font-semibold text-gray-800">管理分享內容</h1>
		<button
			class="flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-green-700"
			on:click={createNewShare}
		>
			<span class="mr-1">+</span> 新增分享
		</button>
	</header>

	{#if isAdmin}
		<div class="mb-6 rounded border-l-4 border-purple-500 bg-purple-50 p-4">
			<p class="text-purple-700">Your Admin</p>
		</div>
	{/if}

	{#if !data.shares || data.shares.length === 0}
		<div class="rounded-lg bg-gray-50 p-12 text-center">
			<p class="text-gray-600">目前沒有分享內容。點擊「新增分享」按鈕創建第一個分享。</p>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-lg bg-white shadow-md">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>標題</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>創建者</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>創建日期</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>圖片數量</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>狀態</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>操作</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each data.shares as share}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-gray-900">{share.title}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{share.name}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{formatDate(share.createdAt)}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{share.images ? share.images.length : 0}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if share.isOwner}
									<span
										class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs leading-5 font-semibold text-green-800"
									>
										我的分享
									</span>
								{:else}
									<span
										class="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs leading-5 font-semibold text-gray-800"
									>
										其他用戶
									</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
								<div class="flex space-x-2">
									{#if share.isOwner || isAdmin}
										<button
											class="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors duration-150 hover:bg-blue-700"
											on:click={() => editShare(share.id)}
										>
											編輯
										</button>
									{/if}
									<a
										href={`/share/${share.id}`}
										target="_blank"
										class="rounded bg-gray-100 px-3 py-1 text-sm text-gray-800 transition-colors duration-150 hover:bg-gray-200"
									>
										預覽
									</a>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
