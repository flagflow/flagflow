<script lang="ts">
	import { Button, DetailedStepper } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';

	import Icon from './icon/Icon.svelte';

	type Properties = {
		steps: string[];
		finishOperation?: string;
		disabled?: boolean;
		onchange?: (current: number, first: boolean, last: boolean) => void;
		onclose?: () => void;
		onfinish?: () => void;
	} & {
		[key: `content${number}${string}`]: Snippet;
	};
	const {
		steps,
		finishOperation,
		onchange,
		onclose,
		onfinish,
		disabled,
		...restProperties
	}: Properties = $props();
	const contents = Object.values(restProperties).filter((v) => typeof v === 'function');

	let currentStepIndex = $state(0);
	const previous = () => {
		if (currentStepIndex > 0) {
			currentStepIndex--;
			onchange?.(currentStepIndex, currentStepIndex === 0, currentStepIndex === steps.length - 1);
		} else onclose?.();
	};
	const next = () => {
		if (currentStepIndex < steps.length - 1) {
			currentStepIndex++;
			onchange?.(currentStepIndex, currentStepIndex === 0, currentStepIndex === steps.length - 1);
		} else onfinish?.();
	};
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-row gap-4">
		<Button color="alternative" onclick={previous}>
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
		<Button disabled={!!disabled} onclick={next}>
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
