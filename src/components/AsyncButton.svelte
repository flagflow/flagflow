<script lang="ts">
	import clsx from 'clsx';
	import { Button } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';

	interface Properties {
		action: () => Promise<unknown>;
		class?: string;
		pill?: boolean;
		outline?: boolean;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		color?:
			| 'red'
			| 'yellow'
			| 'green'
			| 'purple'
			| 'blue'
			| 'light'
			| 'dark'
			| 'primary'
			| 'alternative'
			| 'none';
		children: Snippet;
	}

	const {
		action,
		class: aClass = '',
		pill = false,
		outline = false,
		size = 'md',
		color = 'primary',
		children
	}: Properties = $props();

	let isWorking = $state(false);
	const handleClick = async (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		isWorking = true;
		try {
			if (action) await action();
		} finally {
			isWorking = false;
		}
	};
</script>

{#if children}
	<Button
		class={clsx(aClass, color === 'none' ? 'border-0 py-0 hover:bg-inherit' : '')}
		color={color === 'none' ? 'alternative' : color}
		disabled={isWorking}
		onclick={handleClick}
		{outline}
		{pill}
		{size}
	>
		{@render children()}
	</Button>
{/if}
