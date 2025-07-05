<script lang="ts">
	interface Properties {
		row: unknown;
		callback: (() => void) | undefined;
	}

	const { row, callback }: Properties = $props();
</script>

{#if row || callback}_{/if}
