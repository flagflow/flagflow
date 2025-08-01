<script lang="ts">
	import { Range } from 'flowbite-svelte';

	import type { ValidityItem } from '$lib/form.svelte';

	import FormContainer from './FormContainer.svelte';

	interface Properties {
		class?: string;
		id?: string;
		title: string;
		mandatory?: boolean;
		inProgress?: boolean;
		value: number;
		minValue?: number;
		maxValue?: number;
		step?: number;
		validity?: ValidityItem | undefined;
	}

	let {
		class: aClass = '',
		id = '',
		title,
		mandatory = false,
		inProgress = false,
		value = $bindable(),
		minValue = 0,
		maxValue = 100,
		step = 1,
		validity = { isError: false }
	}: Properties = $props();
</script>

<FormContainer class={aClass} {mandatory} {title} {validity}>
	<Range
		id={id || title}
		class={validity?.isError ? 'bg-red-100' : ''}
		disabled={inProgress}
		max={maxValue}
		min={minValue}
		{step}
		bind:value
	/>
</FormContainer>
