<script lang="ts">
	import Icon from '@iconify/svelte';

	interface Properties {
		icon: string;
		title: string;
		subTitle?: string;
	}

	const { icon, title, subTitle }: Properties = $props();
</script>

<h1 class="mt-20 justify-items-center text-center text-3xl text-gray-700">
	<Icon {icon} width={70} />
	{title}
	{#if subTitle}
		<p class="text-lg text-gray-500">{subTitle}</p>
	{/if}
</h1>
