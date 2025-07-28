<script lang="ts">
	import { Range } from 'flowbite-svelte';

	import Mermaid from '$components/Mermaid.svelte';
	import PageContainer from '$components/PageContainer.svelte';
	import PageTitle from '$components/PageTitle.svelte';

	import type { PageProps as PageProperties } from './$types';

	let { data }: PageProperties = $props();

	let zoomPercent = $state(100);
</script>

<PageTitle hr title="Flag graph">
	{#snippet rightToolbar()}
		<div class="flex gap-4">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span class="mt-1 cursor-pointer text-xs" onclick={() => (zoomPercent = 100)}
				>{zoomPercent}%</span
			>
			<Range class="mt-2" max="200" min="10" step="10" bind:value={zoomPercent} />
		</div>
	{/snippet}
</PageTitle>

<PageContainer>
	<Mermaid mermaidData={data.mermaidData} {zoomPercent} />
</PageContainer>
