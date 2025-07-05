<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import { Tooltip } from 'flowbite-svelte';

	interface Properties {
		label: string;
		bold?: boolean;
		tooltip?: string | undefined;
	}

	const { label, bold, tooltip }: Properties = $props();
</script>

<div
	class="mt-1 text-sm uppercase"
	class:decoration-dashed={tooltip}
	class:font-extralight={!bold}
	class:font-semibold={bold}
	class:underline={tooltip}
	class:underline-offset-2={tooltip}
>
	{label}
</div>
{#if tooltip}
	<Tooltip placement="top-start" type="light">{@html tooltip}</Tooltip>
{/if}
