<script lang="ts">
	import { page } from '$app/state';

	export let data;
	$: user = data?.user;
	$: isLoginPage = page.url.pathname === '/admin/login';

	let showMobileMenu = false;

	function toggleMobileMenu() {
		showMobileMenu = !showMobileMenu;
	}
</script>

{#if !isLoginPage}
	<div class="min-h-screen">
		<nav class="bg-white shadow-sm">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="flex h-16 justify-between">
					<div class="flex">
						<div class="flex flex-shrink-0 items-center">
							<span class="text-xl font-bold text-gray-800">管理系統</span>
						</div>
						<div class="hidden md:ml-6 md:flex md:space-x-8">
							<a
								href="/admin"
								class="{page.url.pathname === '/admin'
									? 'border-blue-500 text-gray-900'
									: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
							>
								分享內容
							</a>
							{#if user?.role === 'admin'}
								<a
									href="/admin/users"
									class="{page.url.pathname === '/admin/users'
										? 'border-blue-500 text-gray-900'
										: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
								>
									用戶管理
								</a>
							{/if}
						</div>
					</div>

					<div class="flex items-center">
						{#if user}
							<div class="hidden items-center space-x-4 md:flex">
								<span class="text-sm font-medium text-gray-700">
									{user.username}
									<span class="ml-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
										{user.role === 'admin' ? '管理員' : '用戶'}
									</span>
								</span>
								<a
									href="/admin/logout"
									class="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-gray-700"
								>
									登出
								</a>
							</div>
						{:else}
							<div class="hidden items-center md:flex">
								<div class="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
							</div>
						{/if}

						<div class="md:hidden">
							<button
								type="button"
								class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
								onclick={toggleMobileMenu}
								aria-expanded="false"
							>
								<span class="sr-only">開啟主選單</span>
								<svg
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>

				{#if showMobileMenu}
					<div class="md:hidden">
						<div class="space-y-1 pt-2 pb-3">
							<a
								href="/admin"
								class="{page.url.pathname === '/admin'
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'} block border-l-4 py-2 pr-4 pl-3 text-base font-medium"
							>
								分享內容
							</a>
							{#if user?.role === 'admin'}
								<a
									href="/admin/users"
									class="{page.url.pathname === '/admin/users'
										? 'border-blue-500 bg-blue-50 text-blue-700'
										: 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'} block border-l-4 py-2 pr-4 pl-3 text-base font-medium"
								>
									用戶管理
								</a>
							{/if}
						</div>
						{#if user}
							<div class="border-t border-gray-200 pt-4 pb-3">
								<div class="flex items-center px-4">
									<div class="flex-shrink-0">
										<span class="text-sm font-medium text-gray-700">
											{user.username}
											<span class="ml-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
												{user.role === 'admin' ? '管理員' : '用戶'}
											</span>
										</span>
									</div>
								</div>
								<div class="mt-3 space-y-1">
									<a
										href="/admin/logout"
										class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
									>
										登出
									</a>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</nav>

		<main>
			<div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
				<slot />
			</div>
		</main>
	</div>
{:else}
	<slot />
{/if}
