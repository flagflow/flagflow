<script lang="ts">
	import type { Snippet } from 'svelte';

	import ScrollToTop from './ScrollToTop.svelte';

	interface Properties {
		children: Snippet;
	}

	const { children }: Properties = $props();
</script>

<div class="px-4">
	{@render children()}
</div>
<ScrollToTop />
