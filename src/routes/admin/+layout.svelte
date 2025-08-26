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
	<div class="bg-background min-h-screen">
		<nav
			class="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur"
		>
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="flex h-16 justify-between">
					<div class="flex">
						<div class="flex flex-shrink-0 items-center">
							<span class="text-foreground text-xl font-bold">管理系統</span>
						</div>
						<div class="hidden md:ml-6 md:flex md:space-x-8">
							<a
								href="/admin"
								class="{page.url.pathname === '/admin'
									? 'border-primary text-foreground'
									: 'text-muted-foreground hover:border-border hover:text-foreground border-transparent'} inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors"
							>
								分享內容
							</a>
							{#if user?.role === 'admin'}
								<a
									href="/admin/users"
									class="{page.url.pathname === '/admin/users'
										? 'border-primary text-foreground'
										: 'text-muted-foreground hover:border-border hover:text-foreground border-transparent'} inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors"
								>
									用戶管理
								</a>
							{/if}
						</div>
					</div>

					<div class="flex items-center">
						{#if user}
							<div class="hidden items-center space-x-4 md:flex">

								<span class="text-foreground text-sm font-medium">
									{user.username}
									<span
										class="bg-secondary text-secondary-foreground ml-1 rounded-full px-2 py-1 text-xs"
									>
										{user.role === 'admin' ? '管理員' : '用戶'}
									</span>
								</span>
								<a
									href="/admin/logout"
									class="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
								>
									登出
								</a>
							</div>
						{:else}
							<div class="hidden items-center space-x-4 md:flex">
								<ThemeToggle />
								<div class="bg-muted h-8 w-20 animate-pulse rounded"></div>
							</div>
						{/if}

						<div class="md:hidden">
							<button
								type="button"
								class="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md p-2"
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
									? 'border-primary bg-accent text-accent-foreground'
									: 'text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground border-transparent'} block border-l-4 py-2 pr-4 pl-3 text-base font-medium transition-colors"
							>
								分享內容
							</a>
							{#if user?.role === 'admin'}
								<a
									href="/admin/users"
									class="{page.url.pathname === '/admin/users'
										? 'border-primary bg-accent text-accent-foreground'
										: 'text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground border-transparent'} block border-l-4 py-2 pr-4 pl-3 text-base font-medium transition-colors"
								>
									用戶管理
								</a>
							{/if}
						</div>
						{#if user}
							<div class="border-border border-t pt-4 pb-3">
								<div class="flex items-center px-4">
									<div class="flex-shrink-0">
										<span class="text-foreground text-sm font-medium">
											{user.username}
											<span
												class="bg-secondary text-secondary-foreground ml-1 rounded-full px-2 py-1 text-xs"
											>
												{user.role === 'admin' ? '管理員' : '用戶'}
											</span>
										</span>
									</div>
								</div>
								<div class="mt-3 space-y-1">
									<a
										href="/admin/logout"
										class="text-muted-foreground hover:bg-accent hover:text-accent-foreground block px-4 py-2 text-base font-medium transition-colors"
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

		<main class="bg-background">
			<div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
				<slot />
			</div>
		</main>
	</div>
{:else}
	<slot />
{/if}
