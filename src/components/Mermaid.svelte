<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */

	interface Properties {
		mermaidData: string;
		zoomPercent: number;
	}

	const { mermaidData, zoomPercent }: Properties = $props();

	const getSvg = async () => {
		const { default: mermaid } = await import('mermaid');
		const renderedData = await mermaid.render('_', mermaidData);
		return renderedData.svg;
	};
</script>

<svelte:boundary>
	<div
		id="mermaid"
		style={`transform-origin: top left; transform: scale(${zoomPercent / 100});`}
		class="w-full"
	>
		{@html await getSvg()}
	</div>

	{#snippet pending()}
		<div class="text-center">Generation in progress...</div>
	{/snippet}
	{#snippet failed(error)}
		<div class="text-center text-red-700">
			{error instanceof Error ? error.message : 'Unknown error'}
		</div>
	{/snippet}
</svelte:boundary>
