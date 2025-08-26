<script>
	import { redirect } from '@sveltejs/kit';

	const toadmin = () => {
		redirect(302, '/admin');
	};
</script>

<header
	class="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 w-full border-b backdrop-blur"
>
	<nav class="container mx-auto">
		<div class="flex h-16 items-center justify-between px-6">
			<div>
				<a
					class="text-foreground hover:text-muted-foreground text-xl font-bold transition-colors md:text-2xl"
					href="/">RT PIC</a
				>
			</div>
			<div class="flex items-center space-x-4">
				<a
					class="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
					href="/admin/login">Admin</a
				>
				<a
					class="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
					href="https://github.com/phillychi3/rt-picture-system"
					target="_blank">Github</a
				>
			</div>
		</div>
	</nav>
</header>
