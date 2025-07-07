<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Badge, Button, Input } from 'flowbite-svelte';

	import { trimEnd } from '$lib/stringEx';

	interface Properties {
		inlineTitle?: string;
		tags: string[];
		disabled?: boolean;
	}

	let { inlineTitle = '', tags = $bindable(), disabled = false }: Properties = $props();

	let inputVisible = $state(false);
	let inputValue: string = $state('');
	const REGEXP_FORMATTER = /(,)/g;
	const onKeypress = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			const inputTags = inputValue
				?.replace(REGEXP_FORMATTER, ' ')
				.split(' ')
				.map((w) => w.trim().toLocaleLowerCase())
				.filter(Boolean);
			tags.push(...inputTags);
			tags = [...new Set(tags)];
			inputValue = '';
			inputVisible = false;
		}
	};
	const onDelete = (tag: string) => {
		tags = tags.filter((t) => t !== tag);
	};
</script>

{#if inputVisible}
	<Input
		id="newTag"
		autofocus
		{disabled}
		onblur={() => {
			inputValue = '';
			inputVisible = false;
		}}
		onkeypress={onKeypress}
		placeholder="Type tags and press Enter or click outside to cancel"
		size="sm"
		type="text"
		bind:value={inputValue}
	/>
{:else}
	{#if inlineTitle}
		<span class="text-sm">{inlineTitle}:</span>
	{/if}
	{#each tags.sort() as tag}
		<Badge
			class="mr-2"
			border
			color={disabled
				? 'secondary'
				: tag.endsWith('!!')
					? 'red'
					: tag.endsWith('!')
						? 'yellow'
						: 'green'}
			>{trimEnd(tag, '!')}
			{#if !disabled}
				<button onclick={() => onDelete(tag)}>
					<Icon class="ml-1 inline-flex cursor-pointer" icon="mdi:close" />
				</button>
			{/if}
		</Badge>
	{/each}
	<Button
		class="px-2 py-1"
		color="light"
		{disabled}
		onclick={() => {
			inputVisible = true;
		}}
		size="xs">+</Button
	>
{/if}
