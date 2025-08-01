<script lang="ts">
	import { DropdownItem } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';

	import Icon, { type IconId } from './Icon.svelte';

	interface Properties {
		href?: string;
		onclick?: () => void;
		icon?: IconId;
		children: Snippet;
	}

	const { href, onclick, icon, children }: Properties = $props();
</script>

<DropdownItem href={href ?? ''} onclick={() => onclick?.()}>
	{#if icon}
		<Icon id={icon} class="mr-1 -ml-1 inline-flex text-purple-500" />
	{/if}
	{@render children()}</DropdownItem
>
