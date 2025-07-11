<script lang="ts">
	import type { Snippet } from 'svelte';

	import HtmlTitle from './HtmlTitle.svelte';

	interface Properties {
		title: string;
		count?: number;
		status?: string;
		description?: string;
		titleLineThrough?: boolean;
		hr?: boolean;

		children?: Snippet;
		rightToolbar?: Snippet;
	}

	const {
		title,
		count,
		status,
		description,
		titleLineThrough,
		hr,
		children,
		rightToolbar
	}: Properties = $props();
</script>

<HtmlTitle {title} />

<div class="mb-4 flex min-h-10 flex-row items-center gap-4">
	<span class:line-through={titleLineThrough}>
		<span class="text-xl font-medium">{title}</span>
		{#if count}
			<span class="text-sm font-light"> ({count})</span>
		{/if}
	</span>

	{#if status}
		<div class="text-sm font-light">{status}</div>
	{/if}

	{#if children}
		<div class="flex gap-4">{@render children()}</div>
	{/if}
	{#if rightToolbar}
		<div class="ml-auto flex gap-4">{@render rightToolbar()}</div>
	{/if}
</div>

{#if description}
	<div class="m-0 my-6 -mt-2 text-xs font-light">{description}</div>
{/if}

{#if hr}<hr class="text-gray-200" />{/if}
