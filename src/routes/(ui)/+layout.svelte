<script lang="ts">
	import '../../app.css';

	import type { Snippet } from 'svelte';

	import { navigating } from '$app/stores';
	import ScreenProgressbar from '$components/ScreenProgressbar.svelte';
	import { isDebouncedTrpcCommunication, isInvalidating } from '$lib/navigationEx';
	import { modalHandler } from '$lib/svelteModal/modal';
	import ModalPortal from '$lib/svelteModal/ModalPortal.svelte';

	interface Properties {
		children: Snippet;
	}

	const { children }: Properties = $props();
</script>

<ScreenProgressbar visible={!!$navigating || $isInvalidating || $isDebouncedTrpcCommunication} />

{@render children()}

<ModalPortal store={modalHandler} />
