<script lang="ts">
	import clsx from 'clsx';
	import { Button } from 'flowbite-svelte';

	import Icon from './Icon.svelte';

	interface Properties {
		data: string;
		class?: string;
		pill?: boolean;
		outline?: boolean;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		color?:
			| 'red'
			| 'yellow'
			| 'green'
			| 'purple'
			| 'blue'
			| 'light'
			| 'dark'
			| 'primary'
			| 'alternative'
			| 'none';
	}

	const {
		data,
		class: aClass = '',
		pill = false,
		outline = false,
		size = 'md',
		color = 'primary'
	}: Properties = $props();

	let isSuccess = $state(false);
</script>

<Button
	class={clsx(aClass, { 'border-0 py-0 hover:bg-inherit': color === 'none' })}
	color={color === 'none' ? 'alternative' : color}
	onclick={() => {
		navigator.clipboard.writeText(data);
		isSuccess = true;
		setTimeout(() => {
			isSuccess = false;
		}, 1500);
	}}
	{outline}
	{pill}
	{size}
>
	<Icon id={isSuccess ? 'copyOk' : 'copy'} size={16} />
</Button>
