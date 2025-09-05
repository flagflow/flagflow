<script lang="ts" module>
	import ModalError from './ModalError.svelte';

	export const showModalError = async (error: unknown) =>
		modalHandler.show({
			component: ModalError,
			props: { error }
		});
</script>

<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import { Button, Modal } from 'flowbite-svelte';
	import { marked } from 'marked';
	import { createEventDispatcher } from 'svelte';

	import Icon from '$components/Icon.svelte';
	import { modalHandler } from '$lib/svelteModal/modal';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();
	const resolve = (isOk: boolean) => dispatch('resolve', { isOk });

	interface Properties {
		error: unknown;
	}

	const { error }: Properties = $props();
	const message = marked.parse(error instanceof Error ? error.message : 'Unknown error', {
		async: false
	});
</script>

<Modal oncancel={() => resolve(false)} open size="sm">
	{#snippet header()}
		<div class="flex justify-between gap-4">Error</div>
	{/snippet}
	<div class="flex flex-col items-center justify-center space-y-4 text-center">
		<Icon id="error" color="red" size={32} />
		<div class="text-lg font-semibold">Something went wrong</div>
		<div class="text-md">
			{@html message}
		</div>
	</div>
	<div class="flex justify-center space-x-4">
		<Button class="w-20" color="alternative" onclick={() => resolve(false)}>Close</Button>
	</div>
</Modal>
