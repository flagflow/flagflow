<script lang="ts">
	import { Input, Tooltip } from 'flowbite-svelte';
	import type { KeyboardEventHandler } from 'svelte/elements';

	import { roundTo } from '$lib/mathEx';

	interface Properties {
		id: string;
		/* eslint-disable @typescript-eslint/no-explicit-any */
		value: any;
		min: number | undefined;
		max: number | undefined;
		digits?: number;
		allowNull?: boolean;
		disabled?: boolean;
		onkeydown: (event: KeyboardEvent) => void;
		onkeypress?: KeyboardEventHandler<EventTarget> | undefined | null;
	}

	let {
		id,
		value = $bindable(),
		min,
		max,
		digits = 0,
		allowNull = false,
		disabled = false,
		onkeydown,
		onkeypress
	}: Properties = $props();

	let isError = $derived(
		(value !== null && min !== undefined && value < min) ||
			(value !== null && max !== undefined && value > max) ||
			false
	);
</script>

<Input
	{id}
	color={isError ? 'red' : 'default'}
	{disabled}
	onblur={() => {
		if (!allowNull && value === null) value = min === undefined ? 0 : min;
		if (value !== null && min !== undefined && value < min) value = min;
		if (value !== null && max !== undefined && value > max) value = max;
		if (value !== null) value = roundTo(value, digits);
	}}
	{onkeydown}
	{onkeypress}
	type="number"
	bind:value
/>
<Tooltip placement="bottom-end" type="light">{min} - {max}</Tooltip>
