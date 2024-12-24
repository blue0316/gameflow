import { defineConfig } from 'vite'
// import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	server: {
		open: './public/theatresupport.html',
		port: 5173,
		host: true
	},
	plugins: [
		// svelte({emitCss: false,}), 
		// wasm(),
		// topLevelAwait()
	]
})