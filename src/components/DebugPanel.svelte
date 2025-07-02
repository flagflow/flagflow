<script lang="ts">
	interface Properties {
		object?: object;
	}

	const { object }: Properties = $props();
</script>

<pre class="absolute top-4 left-4 z-30 h-1/2 w-1/3 bg-slate-200 font-mono">
    {#if object}
		{JSON.stringify(object, undefined, 1)}
	{/if}
</pre>
