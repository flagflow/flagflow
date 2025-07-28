<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import mermaid from 'mermaid';

	interface Properties {
		mermaidData: string;
		zoomPercent: number;
	}

	const { mermaidData, zoomPercent }: Properties = $props();
</script>

{#await mermaid.render('_', mermaidData) then { svg }}
	<div
		id="mermaid"
		style={`transform-origin: top left; transform: scale(${zoomPercent / 100});`}
		class="w-full"
	>
		{@html svg}
	</div>
{/await}
