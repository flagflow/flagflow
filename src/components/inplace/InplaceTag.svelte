<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Badge, Button, ButtonGroup, Helper, Input } from 'flowbite-svelte';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	import { focusInputById } from '$lib/form.svelte';
	import { generateHtmlElementId } from '$lib/genId';
	import { trimEnd } from '$lib/stringEx';

	import InplaceText from './InplaceText.svelte';

	const inplaceCurrentlyOpened = getContext<Writable<string>>('InplaceCurrentlyOpened');
	inplaceCurrentlyOpened.subscribe((id) => {
		if (id && id !== inputId) setMode('cancel');
	});

	interface Properties {
		class?: string;
		tags: string[];
		modifyAction: (tags: string[]) => Promise<void>;
	}

	let { class: aClass = '', tags, modifyAction }: Properties = $props();

	let localValue = $state(tags.sort().join(', '));
	const inputId = generateHtmlElementId();
	let inProgress = $state(false);
	let errorMessage = $state('');
	let mode: 'text' | 'input' = $state('text');
	const setMode = async (toMode: 'input' | 'done' | 'cancel') => {
		switch (toMode) {
			case 'input':
				mode = 'input';
				errorMessage = '';
				inplaceCurrentlyOpened.set(inputId);
				await focusInputById(inputId);
				break;
			case 'done':
				inProgress = true;
				errorMessage = '';
				try {
					await modifyAction(
						localValue
							.split(',')
							.map((t) => t.trim())
							.sort()
							.filter(Boolean)
					);
					mode = 'text';
					inplaceCurrentlyOpened.set('');
					inProgress = false;
				} catch (error) {
					errorMessage = error instanceof Error ? error.message : 'Error';
					inProgress = false;
					await focusInputById(inputId);
				}
				break;
			case 'cancel':
				localValue = tags.join(', ');
				errorMessage = '';
				inplaceCurrentlyOpened.set('');
				mode = 'text';
				break;
		}
	};
	const onInputKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') setMode('cancel');
	};
	const onInputKeypress = (event: KeyboardEvent) => {
		if (event.key === 'Enter') setMode('done');
	};
</script>

<div class={aClass}>
	{#if mode === 'text'}
		<InplaceText class={aClass} oneditclick={async () => setMode('input')}>
			{#each localValue
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean)
				.sort() as tag}
				<Badge
					class="m-1"
					border
					color={tag.endsWith('!!') ? 'red' : tag.endsWith('!') ? 'yellow' : 'green'}
					>{trimEnd(tag, '!')}</Badge
				>
			{:else}
				<Badge class="mt-1" border color="primary">No tags</Badge>
			{/each}
		</InplaceText>
	{:else}
		<ButtonGroup class="w-fits -mt-2">
			<Input
				id={inputId}
				class="bg-inherit font-normal"
				disabled={inProgress}
				onkeydown={onInputKeydown}
				onkeypress={onInputKeypress}
				bind:value={localValue}
			/>
			<Button color="primary" onclick={() => setMode('done')}><Icon icon="mdi:check-bold" /></Button
			>
			<Button color="alternative" onclick={() => setMode('cancel')}
				><Icon icon="mdi:clear-bold" /></Button
			>
		</ButtonGroup>
		{#if errorMessage}
			<Helper class="mt-0.5 ml-1" color="red">{errorMessage}</Helper>
		{/if}
	{/if}
</div>
