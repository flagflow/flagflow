<script lang="ts">
	import Icon from '@iconify/svelte';
	import { DropdownItem } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';

	interface Properties {
		href?: string;
		onclick?: () => void;
		icon?: string;
		children: Snippet;
	}

	const { href, onclick, icon, children }: Properties = $props();
</script>

<DropdownItem href={href ?? ''} onclick={() => onclick?.()}>
	{#if icon}
		<Icon class="mr-1 -ml-1 inline-flex text-purple-500" {icon} width={20} />
	{/if}
	{@render children()}</DropdownItem
>
