<script lang="ts" module>
	import ModalInformation from './ModalInformation.svelte';

	export const showModalInformation = async (title: string, message: string) =>
		modalHandler.show({
			component: ModalInformation,
			props: { title, message }
		});
</script>

<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import { Button, Modal } from 'flowbite-svelte';
	import { marked } from 'marked';
	import { createEventDispatcher } from 'svelte';

	import Icon from '$components/icon/Icon.svelte';
	import { modalHandler } from '$lib/modals';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();
	const resolve = (isOk: boolean) => dispatch('resolve', { isOk });

	interface Properties {
		title: string;
		message: string;
	}

	let { title, message }: Properties = $props();
	message = marked.parse(message, { async: false });
</script>

<Modal oncancel={() => resolve(false)} open size="sm">
	{#snippet header()}
		<div class="flex justify-between">Information</div>
	{/snippet}
	<div class="flex flex-col items-center justify-center space-y-4 text-center">
		<Icon id="information" color="green" size={32} />
		<div class="text-lg font-semibold">{title}</div>
		<div class="text-md">{@html message}</div>
	</div>
	<div class="flex justify-center space-x-4">
		<Button class="w-20" color="alternative" onclick={() => resolve(false)}>Close</Button>
	</div>
</Modal>
