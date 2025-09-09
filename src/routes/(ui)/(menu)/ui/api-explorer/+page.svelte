<script lang="ts">
	import OpenApiExplorer from '$components/openapi/OpenApiExplorer.svelte';
	import PageContainer from '$components/PageContainer.svelte';
	import PageTitle from '$components/PageTitle.svelte';

	import type { PageProps as PageProperties } from './$types';

	let { data }: PageProperties = $props();
</script>

<PageTitle
	description="Interactive API documentation and testing interface for FlagFlow REST API"
	title="API Explorer"
/>

<PageContainer>
	<OpenApiExplorer sessionId={data.sessionId} />
</PageContainer>
