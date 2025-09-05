<script lang="ts" module>
	import ModalFlagUrl from './ModalFlagUrl.svelte';

	export const showModalFlagUrl = async (key: string = '') => {
		try {
			return modalHandler.show({ component: ModalFlagUrl, props: { key } });
		} catch (error) {
			await showModalError(error);
		}
	};
	export const showModalFlagGroupUrl = async (group: string = '') => {
		try {
			return modalHandler.show({ component: ModalFlagUrl, props: { group } });
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

<script lang="ts">
	import { Button, Kbd, Modal, RadioButton } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import CopyButton from '$components/CopyButton.svelte';
	import FormContainer from '$components/form/FormContainer.svelte';
	import FormLabel from '$components/form/FormLabel.svelte';
	import Icon from '$components/Icon.svelte';
	import { showModalError } from '$components/modal/ModalError.svelte';
	import { modalHandler } from '$lib/svelteModal/modal';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	interface Properties {
		key?: string;
		group?: string;
	}
	const { key, group }: Properties = $props();

	const formats = key
		? { 'JSON (default)': '', ENV: 'env', PLAIN: 'plain' }
		: { 'JSON (default)': '', ENV: 'env' };
	let format = $state('');
	let url = $derived(
		`${window.location.protocol}//${window.location.host}/${key ? 'flag' : 'flags'}${key || group ? '/' : ''}${key || group}${format ? `?format=${format}` : ''}`
	);
</script>

<Modal
	closedby="none"
	dismissable={false}
	oncancel={() => dispatch('resolve', { isOk: false })}
	open
	outsideclose={false}
	size="lg"
>
	{#snippet header()}
		<div class="flex justify-between gap-4">Flag {key ? '' : 'group '} URLs</div>
	{/snippet}

	<FormLabel text={key || group || '#root'} title={`Flag ${key ? '' : 'group '}`} />

	<FormContainer title="Value format">
		<div class="flex gap-2">
			{#each Object.entries(formats) as [label, value]}
				<RadioButton
					class="text-sm"
					checkedClass="bg-primary-700 text-white"
					outline
					size="xs"
					{value}
					bind:group={format}
				>
					{label}
				</RadioButton>
			{/each}
		</div>
	</FormContainer>

	<FormContainer title={`Flag ${key ? '' : 'group '} value${key ? '' : 's'}`}>
		<Kbd class="text-md">{url}</Kbd>
		<CopyButton class="ml-2" color="alternative" data={url} />
		<Button color="alternative" href={url} rel="noopener noreferrer" target="_blank"
			><Icon id="externalLink" size={16} /></Button
		>
	</FormContainer>

	<div class="mt-4 flex justify-center space-x-4">
		<Button class="w-20" color="alternative" onclick={() => dispatch('resolve', { isOk: false })}
			>Close</Button
		>
	</div>
</Modal>
