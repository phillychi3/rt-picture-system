import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import nodeAdapter from '@sveltejs/adapter-node';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: nodeAdapter({
			out: 'build'
		})
	}
};

export default config;
