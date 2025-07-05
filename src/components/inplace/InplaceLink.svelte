<script lang="ts">
	import { Tooltip } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';

	interface Properties {
		class?: string;
		enabled?: boolean | undefined;
		href: string;
		tooltip?: string;
		children: Snippet;
	}

	const { class: aClass = '', href, tooltip, children }: Properties = $props();
</script>

<a class={'px-3 py-0 ' + aClass} {href}>
	{@render children()}
</a>
{#if tooltip}
	<Tooltip color="secondary">{tooltip}</Tooltip>
{/if}
