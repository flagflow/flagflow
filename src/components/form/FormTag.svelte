<script lang="ts">
	import { ButtonGroup, InputAddon, Tags, Tooltip } from 'flowbite-svelte';

	import Icon from '$components/Icon.svelte';
	import type { ValidityItem } from '$lib/form.svelte';

	import FormContainer from './FormContainer.svelte';

	interface Properties {
		class?: string;
		id?: string;
		title?: string;
		tags: string[];
		unique?: boolean;
		allowSort?: boolean;
		inProgress?: boolean;
		validity?: ValidityItem | undefined;
	}

	let {
		class: aClass = '',
		id = '',
		title = '',
		tags = $bindable(),
		unique = true,
		allowSort = false,
		validity = { isError: false }
	}: Properties = $props();
</script>

<FormContainer class={aClass} {title} {validity}>
	{#if allowSort}
		<ButtonGroup class="w-full gap-2">
			<Tags id={id || title} {unique} bind:value={tags} />
			<InputAddon
				class="cursor-pointer"
				onclick={() => (tags = tags.toSorted((a, b) => a.localeCompare(b)))}
			>
				<Icon id="sortAlphabeticalAscending" color="gray" size={20} />
			</InputAddon>
			<Tooltip placement="bottom" type="light">Sort items alphabetically</Tooltip>
		</ButtonGroup>
	{:else}
		<Tags id={id || title} {unique} bind:value={tags} />
	{/if}
</FormContainer>
