<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import { writable } from 'svelte/store';

	interface Properties {
		clickModeSingle: boolean;
		children: Snippet;
	}

	const { clickModeSingle, children }: Properties = $props();

	setContext('InplaceClickModeSingle', clickModeSingle);
	setContext('InplaceCurrentlyOpened', writable(''));
</script>

{@render children()}
