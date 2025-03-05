<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	// export let data;
	export let form;

	let title = '';
	let name = '';
	let description = '';
	let imageUrls: any[] = [];
	let newImageUrl = '';

	function addImage() {
		for (let url of newImageUrl.split('\n')) {
			if (url.trim()) {
				imageUrls = [...imageUrls, url.trim()];
			}
		}
		newImageUrl = '';
	}

	function removeImage(index: number) {
		imageUrls = imageUrls.filter((_, i) => i !== index);
	}

	function goBack() {
		goto('/admin');
	}
</script>

<svelte:head>
	<title>新增分享</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
	<header class="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
		<h1 class="text-2xl font-semibold text-gray-800">編輯分享</h1>
		<div class="flex space-x-3">
			<button
				class="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-300"
				on:click={goBack}
			>
				返回
			</button>
		</div>
	</header>

	{#if form?.error}
		<div class="mb-6 rounded border-l-4 border-red-500 bg-red-50 p-4">
			<p class="text-red-700">{form.error}</p>
		</div>
	{/if}

	<form method="POST" action="?/save" use:enhance class="space-y-6">
		<div>
			<label for="title" class="mb-1 block text-sm font-medium text-gray-700">標題</label>
			<input
				type="text"
				id="title"
				name="title"
				bind:value={title}
				required
				class="ease w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:shadow focus:outline-none"
			/>
		</div>

		<div>
			<label for="name" class="mb-1 block text-sm font-medium text-gray-700">創建者名稱</label>
			<input
				type="text"
				id="name"
				name="name"
				bind:value={name}
				required
				class="ease w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:shadow focus:outline-none"
			/>
		</div>

		<div>
			<label for="description" class="mb-1 block text-sm font-medium text-gray-700">描述</label>
			<textarea
				id="description"
				name="description"
				bind:value={description}
				rows="4"
				class="ease w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:shadow focus:outline-none"
			></textarea>
		</div>

		<div>
			<label for="image-url" class="mb-2 block text-sm font-medium text-gray-700">圖片</label>

			{#if imageUrls.length > 0}
				<div class="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
					{#each imageUrls as url, i}
						<div class="group relative overflow-hidden rounded-md border border-gray-200">
							<img src={url} alt="Preview" class="h-24 w-full object-cover" />
							<button
								type="button"
								class="bg-opacity-50 hover:bg-opacity-70 absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white opacity-80 transition-opacity duration-150 group-hover:opacity-100"
								on:click={() => removeImage(i)}
							>
								✕
							</button>
						</div>
					{/each}
				</div>
			{/if}

			<div class="mt-2 mb-4 flex gap-2">
				<textarea
					id="image-url"
					placeholder="輸入圖片URL"
					bind:value={newImageUrl}
					rows="4"
					class="ease w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:shadow focus:outline-none"
				></textarea>
				<button
					type="button"
					on:click={addImage}
					class="rounded-r-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-green-700"
				>
					添加圖片
				</button>
			</div>

			<input type="hidden" name="images" value={imageUrls.join(',')} />
		</div>

		<div class="border-t border-gray-200 pt-5">
			<div class="flex justify-end">
				<button
					type="submit"
					class="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700"
				>
					保存
				</button>
			</div>
		</div>
	</form>
</div>
