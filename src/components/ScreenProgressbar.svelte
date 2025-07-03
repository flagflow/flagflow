<script lang="ts">
	import { Progressbar } from 'flowbite-svelte';
	import { circOut } from 'svelte/easing';

	interface Properties {
		durationMs?: number;
		delayMs?: number;
		visible: boolean;
	}

	const { durationMs = 2500, delayMs = 350, visible }: Properties = $props();

	let localVisible = $state(true);
	let timeout = 0;

	$effect(() => {
		clearTimeout(timeout);

		if (!visible && localVisible) localVisible = visible;
		else if (visible && !localVisible)
			timeout = setTimeout(() => {
				localVisible = visible;
			}, delayMs) as unknown as number;
	});
</script>

{#if localVisible}
	<Progressbar
		class="absolute -z-50"
		animate
		color="yellow"
		easing={circOut}
		progress={100}
		size="h-4"
		tweenDuration={durationMs}
	/>
{/if}
