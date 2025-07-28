<script lang="ts">
	interface Properties {
		title: string;
	}

	const { title }: Properties = $props();

	const APPNAME = 'FlagFlow';
</script>

<svelte:head>
	<title>{title ? `${title} • ${APPNAME}` : APPNAME}</title>
</svelte:head>
