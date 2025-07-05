<script lang="ts">
	import type { Snippet } from 'svelte';

	import HtmlTitle from './HtmlTitle.svelte';

	interface Properties {
		title: string;
		status?: string;
		titleLineThrough?: boolean;

		toolbarPos?: 'left' | 'right';
		children?: Snippet;
	}

	const { title, status, titleLineThrough, toolbarPos = 'right', children }: Properties = $props();
</script>

<HtmlTitle {title} />

<div class="mb-4 flex flex-row items-center gap-4">
	<span class="text-xl font-medium" class:line-through={titleLineThrough}>
		{title}
	</span>

	{#if status}
		<div class="text-sm font-light">{status}</div>
	{/if}

	{#if children}
		<div class="flex gap-4" class:ml-auto={toolbarPos === 'right'}>{@render children()}</div>
	{/if}
</div>
