<script lang="ts">
	import HtmlTitle from '$components/HtmlTitle.svelte';
	import OpenApiExplorer from '$components/openapi/OpenApiExplorer.svelte';
	import PageContainer from '$components/PageContainer.svelte';
	import PageTitle from '$components/PageTitle.svelte';
</script>

<HtmlTitle title="API Explorer" />

<PageTitle
	description="Interactive API documentation and testing interface for FlagFlow REST API"
	title="API Explorer"
/>

<PageContainer>
	<OpenApiExplorer />
</PageContainer>
