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
	import Icon from '@iconify/svelte';
	import { Button, Modal } from 'flowbite-svelte';
	import { marked } from 'marked';
	import { createEventDispatcher } from 'svelte';

	import { Icons } from '$components/Icons';
	import { modalHandler } from '$lib/modals';

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

<Modal dismissable onclose={() => resolve(false)} open size="sm">
	{#snippet header()}
		<div class="flex justify-between">Error</div>
	{/snippet}
	<div class="flex flex-col items-center justify-center space-y-4 text-center">
		<Icon class="text-red-700" icon={Icons.error} width={32} />
		<div class="text-lg font-semibold">Something went wrong</div>
		<div class="text-md">
			{@html message}
		</div>
	</div>
	<div class="flex justify-center space-x-4">
		<Button class="w-20" color="alternative" onclick={() => resolve(false)}>Close</Button>
	</div>
</Modal>
