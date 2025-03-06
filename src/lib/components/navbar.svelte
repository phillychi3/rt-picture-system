<script>
	import { redirect } from '@sveltejs/kit';

	const toadmin = () => {
		redirect(302, '/admin');
	};
</script>

<header class="sticky top-0 z-30 w-full">
	<nav class="bg-white shadow-sm">
		<div class="container mx-auto px-6 py-3">
			<div class="flex items-center justify-between">
				<div>
					<a class="text-xl font-bold text-gray-800 hover:text-gray-700 md:text-2xl" href="/"
						>RT PIC</a
					>
				</div>
				<div class="flex items-center">
					<a class="mx-2 text-gray-800 hover:text-gray-600" href="/admin/login">Admin</a>
					<a
						class="mx-2 text-gray-800 hover:text-gray-600"
						href="https://github.com/phillychi3/rt-picture-system"
						target="_blank">Github</a
					>
				</div>
			</div>
		</div>
	</nav>
</header>
