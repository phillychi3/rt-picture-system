<script lang="ts">
	import Header from '$lib/components/navbar.svelte';
	import JoinCircle from '$lib/icon/LineMdPlusCircleFilled.svelte';
	import Discord from '$lib/icon/Discord.svelte';
	import Email from '$lib/icon/Email.svelte';

	console.log(
		'%c 你怎麼可以偷看我 %c 偷看就要發出pr喔 ',
		'color: white; background: #e9546b; padding:5px 0;',
		'padding:4px;border:1px solid #e9546b;'
	);
</script>

<svelte:head>
	<title>返圖系統</title>
	<meta name="description" content="就是一個返圖系統" />
</svelte:head>

<Header />

<main class="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-white to-gray-100">
	<div class="container mx-auto px-4 py-16">
		<div class="flex flex-col items-center gap-12 md:flex-row">
			<div class="w-full space-y-6 md:w-1/2">
				<h1 class="text-4xl font-bold text-gray-800 md:text-5xl">
					<span class="text-blue-600">白雲的</span> 返圖系統
				</h1>
				<p class="text-xl text-gray-600">你以為這裡會顯示什麼有用的資訊嗎？</p>
				<div class="prose prose-lg text-gray-700">
					<p>其實首頁什麼都沒有啦哈哈，如果你也想要使用這東東的話，可以使用右邊的連結聯絡我</p>
				</div>
				<div class="flex flex-wrap gap-4 pt-4">
					<a
						href="/share/67c867510ec0e08fcb4e484b"
						class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-blue-700 hover:shadow-lg"
					>
						使用範例
					</a>
					<a
						href="https://github.com/phillychi3/rt-picture-system"
						class="rounded-lg border border-blue-200 bg-white px-6 py-3 font-semibold text-blue-600 shadow-sm transition-colors hover:bg-gray-50 hover:shadow-md"
					>
						開源連結
					</a>
				</div>
			</div>

			<div class="w-full md:w-1/2">
				<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-xl">
					<h2 class="mb-4 text-2xl font-bold text-gray-800">聯絡方式</h2>
					<div class="space-y-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
								<Discord />
							</div>
							<div>
								<p class="text-gray-600">Discord</p>
								<p class="font-semibold text-gray-800">
									<span class="font-bold text-red-600">whitecloud_</span>
								</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
								<JoinCircle />
							</div>
							<div>
								<p class="text-gray-600">Discord 伺服器</p>
								<a
									href="https://discord.gg/F63mmtSgW3"
									class="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
								>
									加入支援(我的)伺服器
								</a>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
								<Email />
							</div>
							<div>
								<p class="text-gray-600">電子郵件</p>
								<p class="font-semibold text-gray-800">
									<a href="mailto:wh173cl0ud@啥.tw">wh173cl0ud@啥.tw</a>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
