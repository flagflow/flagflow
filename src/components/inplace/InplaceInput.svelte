<script lang="ts" module>
	type F = string | number;
	type V = string | number | boolean | Date | null;
	type E = number | object | undefined;
</script>

<script
	generics="F extends string | number, V extends string | number | boolean | Date | null, E extends number | object | undefined"
	lang="ts"
>
	import Icon from '@iconify/svelte';
	import dayjs from 'dayjs';
	import {
		Button,
		ButtonGroup,
		Datepicker,
		Helper,
		Input,
		Select,
		type SelectOptionType
	} from 'flowbite-svelte';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	import NumberInputBound from '$components/input/NumberInputBound.svelte';
	import { focusInputById } from '$lib/form.svelte';
	import { generateHtmlElementId } from '$lib/genId';
	import { numberFormatter } from '$lib/windowEx';

	import InplaceText from './InplaceText.svelte';

	const inplaceCurrentlyOpened = getContext<Writable<string>>('InplaceCurrentlyOpened');
	inplaceCurrentlyOpened.subscribe((id) => {
		if (id && id !== inputId) setMode('cancel');
	});

	interface Properties {
		class?: string;
		key: F;
		value: V;
		extraData?: E;
		modifyAction: (key: F, value: V, extraData?: E) => Promise<void>;
		mandatory?: boolean | undefined;
		enabled?: boolean | undefined;
		slimButtons?: boolean | undefined;

		maxLength?: number | undefined;
		regexp?: RegExp | undefined;

		minValue?: number | undefined;
		maxValue?: number | undefined;
		digits?: number | undefined;
		allowNumberNull?: boolean | undefined;

		postfix?: string | undefined;
		nullDisplay?: string | undefined;
		emptyDisplay?: string | undefined;

		selectItems?: SelectOptionType<unknown>[] | undefined;
	}

	const {
		class: aClass = '',
		key,
		value,
		extraData,
		modifyAction,
		mandatory = false,
		enabled = true,
		slimButtons = false,
		maxLength = 0,
		minValue,
		maxValue,
		digits = 0,
		allowNumberNull: allowNull = false,
		regexp = /.*/,
		postfix = '',
		nullDisplay,
		emptyDisplay,
		selectItems
	}: Properties = $props();

	let localValue = $state(value);
	const inputId = generateHtmlElementId();
	let inProgress = $state(false);
	let errorMessage = $state('');
	let mode: 'text' | 'input' = $state('text');
	const setMode = async (toMode: 'input' | 'done' | 'cancel') => {
		switch (toMode) {
			case 'input':
				if (!enabled) return;
				mode = 'input';
				errorMessage = '';
				inplaceCurrentlyOpened.set(inputId);
				await focusInputById(inputId);
				break;
			case 'done':
				inProgress = true;
				errorMessage = '';
				try {
					if (localValue !== value) await modifyAction(key, localValue, extraData);
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
				localValue = value;
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
		if (typeof localValue === 'string') {
			if (localValue && maxLength > 0 && localValue.length >= maxLength) event.preventDefault();
			if (!regexp.test(event.key)) event.preventDefault();
		}
		if (event.key === 'Enter' && (!mandatory || localValue)) setMode('done');
	};
</script>

<div class={aClass}>
	{#if mode === 'text'}
		{@const displayValue = selectItems
			? selectItems.find((s) => s.value == localValue)?.name || 'Unknown'
			: typeof localValue === 'boolean'
				? localValue
					? 'Yes'
					: 'No'
				: typeof localValue === 'number'
					? numberFormatter.format(localValue)
					: localValue instanceof Date
						? dayjs(localValue).format('YYYY-MM-DD')
						: localValue}
		<InplaceText class={aClass} {enabled} oneditclick={async () => setMode('input')}>
			<span class:font-light={!displayValue} class:italic={!displayValue}
				>{(displayValue ?? nullDisplay) || emptyDisplay}</span
			>
			{#if displayValue}
				<span class="font-light">{postfix}</span>
			{/if}
		</InplaceText>
	{:else}
		<ButtonGroup class="-mt-2 w-full">
			{#if selectItems}
				<Select
					id={inputId}
					class="rounded-r-none"
					disabled={inProgress}
					items={selectItems}
					onkeydown={onInputKeydown}
					onkeypress={onInputKeypress}
					placeholder=""
					bind:value={localValue}
				/>
			{:else if typeof localValue === 'string'}
				<Input
					id={inputId}
					class="bg-inherit font-normal"
					disabled={inProgress}
					onkeydown={onInputKeydown}
					onkeypress={onInputKeypress}
					bind:value={localValue}
				/>
			{:else if typeof localValue === 'number' || localValue === null}
				<NumberInputBound
					id={inputId}
					{allowNull}
					{digits}
					disabled={inProgress}
					max={maxValue}
					min={minValue}
					onkeypress={onInputKeypress}
					bind:value={localValue}
				/>
			{:else if localValue instanceof Date}
				<Datepicker disabled={inProgress} bind:value={localValue} />
			{:else if typeof localValue === 'boolean'}
				<Select
					id={inputId}
					class="rounded-r-none"
					disabled={inProgress}
					items={[
						{ name: 'Yes', value: true },
						{ name: 'No', value: false }
					]}
					onkeydown={onInputKeydown}
					onkeypress={onInputKeypress}
					placeholder=""
					bind:value={localValue}
				/>
			{/if}
			<Button
				class={slimButtons ? 'px-2' : ''}
				color="primary"
				disabled={mandatory &&
					((typeof localValue === 'string' && !localValue) ||
						(typeof localValue === 'number' && localValue === undefined))}
				onclick={() => setMode('done')}
				size="xs"><Icon icon="mdi:check-bold" /></Button
			>
			<Button
				class={slimButtons ? 'px-2' : ''}
				color="alternative"
				onclick={() => setMode('cancel')}
				size="xs"><Icon icon="mdi:clear-bold" /></Button
			>
		</ButtonGroup>
		{#if errorMessage}
			<Helper class="mt-0.5 ml-1" color="red">{errorMessage}</Helper>
		{/if}
	{/if}
</div>
