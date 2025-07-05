<script lang="ts">
	import Icon, { type IconifyIcon } from '@iconify/svelte';
	import clsx from 'clsx';
	import { Card, Hr } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';

	interface Properties {
		class?: string;
		icon?: IconifyIcon | string;
		title?: string;
		subtitle?: string;
		subtitleIcon?: IconifyIcon | string;
		subtitleTooltip?: string;
		children: Snippet;
	}

	const {
		class: aClass = '',
		icon,
		title = '',
		subtitle,
		subtitleIcon,
		subtitleTooltip,
		children
	}: Properties = $props();
</script>

<Card class={clsx('p-4', aClass)} size="lg">
	<div class="mb-6 flex text-xl font-semibold text-purple-700">
		{#if icon}
			<Icon class="mr-1 inline-flex" {icon} width="24" />
		{/if}
		{title}
		{#if subtitle}
			<div class="mt-1 ml-auto text-sm font-normal text-gray-500" title={subtitleTooltip}>
				{#if subtitleIcon}
					<Icon class="inline-flex" icon={subtitleIcon} width="14" />
				{/if}
				{subtitle}
			</div>
		{/if}
	</div>

	<Hr class="-mx-4" />

	{@render children()}
</Card>
