<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	export let data;
	export let form;

	let username = '';
	let password = '';
	let role = 'user';

	let showCreateForm = false;

	let userToDelete: { id: string; username: string } | null = null;

	$: if (form?.success) {
		username = '';
		password = '';
		role = 'user';
		showCreateForm = false;
	}

	function formatDate(dateStr: string) {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString();
	}

	function confirmDelete(user: { id: string; username: string }) {
		userToDelete = user;
	}

	function cancelDelete() {
		userToDelete = null;
	}
</script>

<svelte:head>
	<title>用戶管理</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
	<header class="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
		<h1 class="text-3xl font-semibold text-gray-800">用戶管理</h1>
		<button
			class="flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-green-700"
			on:click={() => (showCreateForm = !showCreateForm)}
		>
			{showCreateForm ? '取消' : '+ 新增用戶'}
		</button>
	</header>

	{#if showCreateForm}
		<div class="mb-8 rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-4 text-lg font-medium text-gray-900">新增用戶</h2>

			{#if form?.createError}
				<div class="mb-4 rounded-md border-l-4 border-red-500 bg-red-50 p-4">
					<p class="text-red-700">{form.createError}</p>
				</div>
			{/if}

			<form method="POST" action="?/createUser" use:enhance class="space-y-4">
				<div>
					<label for="username" class="mb-1 block text-sm font-medium text-gray-700">用戶名</label>
					<input
						id="username"
						name="username"
						type="text"
						bind:value={username}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="password" class="mb-1 block text-sm font-medium text-gray-700">密碼</label>
					<input
						id="password"
						name="password"
						type="password"
						bind:value={password}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="role" class="mb-1 block text-sm font-medium text-gray-700">角色</label>
					<select
						id="role"
						name="role"
						bind:value={role}
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						<option value="user">普通用戶</option>
						<option value="admin">管理員</option>
					</select>
				</div>

				<div class="pt-4">
					<button
						type="submit"
						class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700"
					>
						創建用戶
					</button>
				</div>
			</form>
		</div>
	{/if}

	{#if form?.deleteSuccess}
		<div class="mb-4 rounded-md border-l-4 border-green-500 bg-green-50 p-4">
			<p class="text-green-700">用戶已成功刪除</p>
		</div>
	{/if}

	{#if form?.deleteError}
		<div class="mb-4 rounded-md border-l-4 border-red-500 bg-red-50 p-4">
			<p class="text-red-700">{form.deleteError}</p>
		</div>
	{/if}

	<div class="overflow-hidden rounded-lg bg-white shadow-md">
		<table class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>用戶名</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>角色</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>創建日期</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>操作</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 bg-white">
				{#if data.users && data.users.length > 0}
					{#each data.users as user}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-gray-900">{user.username}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									class="inline-flex rounded-full px-2 py-1 text-xs leading-5 font-semibold
                  {user.role === 'admin'
										? 'bg-purple-100 text-purple-800'
										: 'bg-green-100 text-green-800'}"
								>
									{user.role === 'admin' ? '管理員' : '普通用戶'}
								</span>
							</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
								{formatDate(user.createdAt)}
							</td>
							<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
								<button
									class="text-red-600 hover:text-red-900 {user.id === page.data.user?.id
										? 'cursor-not-allowed'
										: ''}"
									on:click={() => confirmDelete({ id: user.id, username: user.username })}
									disabled={user.id === page.data.user?.id}
								>
									{user.id === page.data.user?.id ? '當前用戶' : '刪除'}
								</button>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500"> 沒有用戶數據 </td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	{#if userToDelete}
		<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
			<div class="w-full max-w-md rounded-lg bg-white p-6">
				<h2 class="mb-4 text-xl font-semibold text-gray-900">確認刪除</h2>
				<p class="mb-6 text-gray-600">
					您確定要刪除用戶「{userToDelete.username}」嗎？此操作無法撤銷。
				</p>
				<div class="flex justify-end space-x-3">
					<button
						class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50"
						on:click={cancelDelete}
					>
						取消
					</button>
					<form method="POST" action="?/deleteUser" use:enhance>
						<input type="hidden" name="userId" value={userToDelete.id} />
						<button
							type="submit"
							class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-700"
						>
							確認刪除
						</button>
					</form>
				</div>
			</div>
		</div>
	{/if}
</div>
