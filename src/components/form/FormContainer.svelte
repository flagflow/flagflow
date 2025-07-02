<script lang="ts">
	import { clsx } from 'clsx';
	import { Helper, Label } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';

	import type { ValidityItem } from '$lib/form.svelte';

	interface Properties {
		children: Snippet;
		class?: string;
		title: string;
		mandatory?: boolean;
		validity?: ValidityItem | undefined;
	}

	const {
		children,
		class: aClass = '',
		title = '',
		mandatory = false,
		validity = { isError: false }
	}: Properties = $props();
</script>

<div class={aClass}>
	{#if title}
		<Label class={clsx('mb-0.5 ml-1', mandatory ? 'font-semibold' : 'font-light')} for={title}
			>{title}</Label
		>
	{/if}

	{@render children()}

	<Helper class="mt-0.5 ml-1" color={validity?.isError ? 'red' : 'green'}
		>{validity?.message || ''}</Helper
	>
</div>
