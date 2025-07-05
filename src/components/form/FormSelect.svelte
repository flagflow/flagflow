<script lang="ts">
	import { Select, type SelectOptionType } from 'flowbite-svelte';

	import type { ValidityItem } from '$lib/form.svelte';

	import FormContainer from './FormContainer.svelte';

	interface Properties {
		class?: string;
		id?: string;
		title: string;
		mandatory?: boolean;
		inProgress?: boolean;
		items: SelectOptionType<unknown>[];
		value: number | string | null;
		validity?: ValidityItem | undefined;
	}

	let {
		class: aClass = '',
		id = '',
		title,
		mandatory = false,
		inProgress = false,
		items,
		value = $bindable(),
		validity = { isError: false }
	}: Properties = $props();
</script>

<FormContainer class={aClass} {mandatory} {title} {validity}>
	<Select
		id={id || title}
		class={validity?.isError ? 'bg-red-100' : ''}
		disabled={inProgress}
		{items}
		placeholder=""
		bind:value
	/>
</FormContainer>
