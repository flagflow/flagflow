<script lang="ts">
	import NumberInputBound from '$components/input/NumberInputBound.svelte';
	import type { ValidityItem } from '$lib/form.svelte';

	import FormContainer from './FormContainer.svelte';

	interface Properties {
		class?: string;
		id?: string;
		title: string;
		mandatory?: boolean;
		inProgress?: boolean;
		value: number | null;
		min: number | undefined;
		max: number | undefined;
		digits?: number;
		allowNull?: boolean;
		validity?: ValidityItem | undefined;
	}

	let {
		class: aClass = '',
		id = '',
		title,
		mandatory = false,
		inProgress = false,
		value = $bindable(),
		min,
		max,
		digits = 0,
		allowNull = false,
		validity = { isError: false }
	}: Properties = $props();
</script>

<FormContainer class={aClass} {mandatory} {title} {validity}>
	<NumberInputBound
		id={id || title}
		{allowNull}
		{digits}
		disabled={inProgress}
		{max}
		{min}
		bind:value
	/>
</FormContainer>
