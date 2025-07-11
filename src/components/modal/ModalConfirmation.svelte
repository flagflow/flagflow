<script lang="ts" module>
	import ModalConfirmation from './ModalConfirmation.svelte';

	export const showModalConfirmation = async (message: string, command = 'OK') =>
		modalHandler.show({
			component: ModalConfirmation,
			props: { message, command }
		});

	export const showModalConfirmationOperation = async (operation: string, name: string) =>
		showModalConfirmation(
			`Do you really want to ${operation.toLowerCase()} ${name.includes('**') ? name : '**' + name + '**'}?`,
			operation
		);

	export const showModalConfirmationDelete = async (name: string) =>
		showModalConfirmation(
			`Do you really want to delete ${name.includes('**') ? name : '**' + name + '**'}?`,
			'Delete'
		);
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
		message: string;
		command?: string;
	}

	let { message, command = 'OK' }: Properties = $props();
	message = marked.parse(message, { async: false });
</script>

<Modal dismissable onclose={() => resolve(false)} open size="xs">
	{#snippet header()}
		<div class="flex justify-between">Confirmation</div>
	{/snippet}
	<div class="flex justify-center space-y-4">
		<Icon id="warning" color="orange" size={32} />
	</div>
	<div class="flex justify-center space-y-4">
		<div class="text-md text-center">{@html message}</div>
	</div>
	<div class="flex justify-center space-x-4">
		<Button class="w-20" color="primary" onclick={() => resolve(true)}>{command}</Button>
		<Button class="w-20" color="alternative" onclick={() => resolve(false)}>Cancel</Button>
	</div>
</Modal>
