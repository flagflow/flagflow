<script lang="ts">
	import '../../app.css';

	import type { Snippet } from 'svelte';

	import { navigating } from '$app/stores';
	import ScreenProgressbar from '$components/ScreenProgressbar.svelte';
	import { isDebouncedTrpcCommunication, isInvalidating } from '$lib/navigationEx';

	interface Properties {
		children: Snippet;
	}

	const { children }: Properties = $props();
</script>

<ScreenProgressbar visible={!!$navigating || $isInvalidating || $isDebouncedTrpcCommunication} />

{@render children()}
