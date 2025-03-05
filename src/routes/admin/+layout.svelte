<script lang="ts">
	import { page } from '$app/state';

	export let data;

	$: user = data?.user;
	$: isLoginPage = page.route.id === '/admin/login';
</script>

{#if !isLoginPage && user}
	<div class="min-h-screen">
		<nav class="bg-white shadow-sm">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="flex h-16 justify-between">
					<div class="flex">
						<div class="flex flex-shrink-0 items-center">
							<span class="text-xl font-bold text-gray-800">管理系統</span>
						</div>
						<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
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
						<div class="relative ml-3">
							<div class="flex items-center space-x-4">
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
						</div>
					</div>
				</div>
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
