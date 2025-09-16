<script lang="ts">
	interface Properties {
		title: string;
	}

	const { title }: Properties = $props();

	const APPNAME = 'FlagFlow';
</script>

<svelte:head>
	<title>{title ? `${APPNAME} • ${title}` : APPNAME}</title>
</svelte:head>
