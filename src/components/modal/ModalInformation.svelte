<script lang="ts" module>
	import ModalInformation from './ModalInformation.svelte';

	type ModalInformationOptions = {
		size?: 'sm' | 'md' | 'lg';
		align?: 'left' | 'center' | 'right';
	};
	export const showModalInformation = async (
		title: string,
		message: string,
		options?: ModalInformationOptions
	) =>
		modalHandler.show({
			component: ModalInformation,
			props: { title, message, options: options ?? { size: 'sm', align: 'center' } }
		});
</script>

<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import clsx from 'clsx';
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
		title: string;
		message: string;
		options: ModalInformationOptions;
	}

	let { title, message, options }: Properties = $props();
	message = marked.parse(message, { async: false });
</script>

<Modal oncancel={() => resolve(false)} open size={options.size ?? 'sm'}>
	{#snippet header()}
		<div class="flex justify-between gap-4">Information</div>
	{/snippet}
	<div class="flex flex-col items-center justify-center space-y-4 text-center">
		<Icon id="information" color="green" size={32} />
		<div class="text-lg font-semibold">{title}</div>
		<div
			class={clsx('text-md', {
				'text-left': options.align === 'left',
				'text-center': options.align === 'center' || !options.align,
				'text-right': options.align === 'right'
			})}
		>
			{@html message}
		</div>
	</div>
	<div class="flex justify-center space-x-4">
		<Button class="w-20" color="alternative" onclick={() => resolve(false)}>Close</Button>
	</div>
</Modal>
