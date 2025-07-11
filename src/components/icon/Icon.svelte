<script lang="ts">
	import Icon from '@iconify/svelte';
	import clsx from 'clsx';

	import { type IconId, IconIds } from './Icons';

	interface Properties {
		id: IconId;
		class?: string;
		align?: 'left' | 'right';
		size?: number;
		color?: string;
		onclick?: () => void;
	}
	const { id, class: aClass = '', align, size = 20, color = '', onclick }: Properties = $props();

	const cls = clsx(aClass, align === 'left' ? 'mr-2' : align === 'right' ? 'ml-2' : '');
</script>

<Icon class={cls} {color} icon={IconIds[id]} {onclick} width={size} />
