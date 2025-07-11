<script lang="ts">
	import { Textarea } from 'flowbite-svelte';

	import type { ValidityItem } from '$lib/form.svelte';

	import FormContainer from './FormContainer.svelte';

	interface Properties {
		class?: string;
		id?: string;
		title?: string;
		mandatory?: boolean;
		placeholder?: string;
		rows?: number;
		inProgress?: boolean;
		value: string;
		validity?: ValidityItem | undefined;
	}

	let {
		class: aClass = '',
		id = '',
		title = '',
		mandatory = false,
		placeholder = '',
		rows = 5,
		inProgress = false,
		value = $bindable(),
		validity = { isError: false }
	}: Properties = $props();
</script>

<FormContainer class={aClass} {mandatory} {title} {validity}>
	<Textarea
		id={id || title}
		class={validity?.isError ? 'bg-red-100' : ''}
		disabled={inProgress}
		{placeholder}
		{rows}
		bind:value
	/>
</FormContainer>
