<script lang="ts">
	import '../app.css';

	import type { Snippet } from 'svelte';

	import { navigating } from '$app/stores';
	import { isDebouncedTrpcCommunication, isInvalidating } from '$lib/navigationEx';

	interface Properties {
		children: Snippet;
	}

	const { children }: Properties = $props();
</script>

{@render children()}

<style>
	:global(button) {
		cursor: pointer;
		box-shadow: none;
		--tw-ring-shadow: 0 0 #000 !important;
	}
</style>
