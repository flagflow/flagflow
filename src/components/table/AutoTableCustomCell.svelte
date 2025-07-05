<script lang="ts">
	interface Properties {
		source: { row: unknown; property: string };
	}

	const { source }: Properties = $props();
</script>

{#if source}_{/if}
