<script lang="ts">
	import Icon from './icon/Icon.svelte';
	import type { IconId } from './icon/Icons';

	interface Properties {
		icon: IconId;
		title: string;
		subTitle?: string;
	}

	const { icon, title, subTitle }: Properties = $props();
</script>

<h1 class="mt-20 justify-items-center text-center text-3xl text-gray-700">
	<Icon id={icon} size={70} />
	{title}
	{#if subTitle}
		<p class="text-lg text-gray-500">{subTitle}</p>
	{/if}
</h1>
