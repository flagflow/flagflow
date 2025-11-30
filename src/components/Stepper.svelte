<script lang="ts">
	import { Button, DetailedStepper } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';

	import Icon from './Icon.svelte';

	type Properties = {
		steps: string[];
		finishOperation?: string;
		disabled?: boolean;
		canBackward?: boolean[];
		canForward?: boolean[];
		currentStepIndex?: number;
		onclose?: () => void;
		onfinish?: () => void;
	} & {
		[key: `content${number}${string}`]: Snippet;
	};
	let {
		steps,
		finishOperation,
		disabled = false,
		canBackward = [],
		canForward = [],
		currentStepIndex = $bindable(0),
		onclose,
		onfinish,
		...restProperties
	}: Properties = $props();
	const contents = Object.values(restProperties).filter((v) => typeof v === 'function');

	const previous = () => {
		if (currentStepIndex > 0 && (canBackward[currentStepIndex] ?? true)) currentStepIndex--;
		else onclose?.();
	};
	const next = () => {
		if (currentStepIndex < steps.length - 1 && (canForward[currentStepIndex] ?? true))
			currentStepIndex++;
		else onfinish?.();
	};
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-row gap-4">
		<Button
			color="alternative"
			disabled={disabled || !(canBackward[currentStepIndex] ?? true)}
			onclick={previous}
		>
			{#if currentStepIndex === 0}
				Close
			{:else}
				<Icon id="arrowLeft" align="left" />
				Prev
			{/if}
		</Button>
		<DetailedStepper
			steps={steps.map((step, index) => ({
				id: index + 1,
				label: currentStepIndex === index ? step.toUpperCase() : step,
				description: '',
				status: currentStepIndex >= index ? 'completed' : 'current'
			}))}
		/>
		<Button disabled={disabled || !(canForward[currentStepIndex] ?? true)} onclick={next}>
			{#if currentStepIndex === steps.length - 1}
				<span class="trimmed-content">
					{finishOperation || 'Create'}
				</span>
			{:else}
				Next
				<Icon id="arrowRight" align="right" />
			{/if}
		</Button>
	</div>
	{#each contents as child, index (index)}
		{#if index === currentStepIndex}
			{@render child()}
		{/if}
	{/each}
</div>
