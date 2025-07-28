<script lang="ts" module>
	import mermaid from 'mermaid';

	import ModalDisplayMermaid from './ModalDisplayMermaid.svelte';

	export const showModalMermaid = async (
		title: string | { title: string; subtitle: string },
		mermaidData: string | (() => Promise<string>)
	) => {
		try {
			const data = typeof mermaidData === 'function' ? await mermaidData() : mermaidData;
			const { svg } = await mermaid.render('_', data);
			return modalHandler.show({
				component: ModalDisplayMermaid,
				props: {
					title: typeof title === 'string' ? title : title.title,
					subtitle: typeof title === 'string' ? undefined : title.subtitle,
					svg
				}
			});
		} catch (error) {
			showModalError(error);
		}
	};
</script>

<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import { Modal, Range } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import { modalHandler } from '$lib/modals';

	import { showModalError } from './ModalError.svelte';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();
	const resolve = (isOk: boolean) => dispatch('resolve', { isOk });

	interface Properties {
		title: string;
		subtitle?: string | undefined;
		svg: string;
	}

	let { title, subtitle, svg }: Properties = $props();

	let zoomPercent = $state(100);
</script>

<Modal color="gray" dismissable onclose={() => resolve(false)} permanent size="xl">
	{#snippet header()}
		<div class="grid w-full grid-cols-3 gap-4">
			<div class="flex flex-col">
				{title}
				<span class="ml-1 text-xs font-light">
					{subtitle}
				</span>
			</div>
			<div class="flex gap-4">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<span class="mt-1 cursor-pointer text-xs" onclick={() => (zoomPercent = 100)}
					>{zoomPercent}%</span
				>
				<Range class="mt-2" max="200" min="10" step="10" bind:value={zoomPercent} />
			</div>
		</div>
	{/snippet}

	<div
		id="mermaid"
		style={`transform-origin: top left; transform: scale(${zoomPercent / 100});`}
		class="h-[75vh] w-full"
	>
		{@html svg}
	</div>
</Modal>
