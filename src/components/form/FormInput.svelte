<script lang="ts">
	import Icon from '@iconify/svelte';
	import { ButtonGroup, Input, InputAddon, type InputValue } from 'flowbite-svelte';
	import type { HTMLInputTypeAttribute } from 'svelte/elements';

	import { Icons } from '$components/Icons';
	import type { ValidityItem } from '$lib/form.svelte';

	import FormContainer from './FormContainer.svelte';

	interface Properties {
		type?: HTMLInputTypeAttribute;
		class?: string;
		id?: string;
		title: string;
		icon?: string;
		maxLength?: number;
		regexp?: RegExp;
		mandatory?: boolean;
		inProgress?: boolean;
		value: InputValue;
		validity?: ValidityItem | undefined;
	}

	let {
		type = 'text',
		class: aClass = '',
		id = '',
		title,
		icon,
		maxLength = 0,
		regexp = /.*/,
		mandatory = false,
		inProgress = false,
		value = $bindable(),
		validity = { isError: false }
	}: Properties = $props();

	let showPassword = $state(false);
	const onKeypress = (event: KeyboardEvent) => {
		if (value && maxLength > 0 && typeof value === 'string' && value.length >= maxLength)
			event.preventDefault();
		if (!regexp.test(event.key)) event.preventDefault();
	};
</script>

<FormContainer class={aClass} {mandatory} {title} {validity}>
	<ButtonGroup class="w-full">
		{#if type === 'password'}
			<InputAddon>
				<Icon
					class="cursor-pointer"
					icon={showPassword ? Icons.passwordVisible : Icons.password}
					onclick={() => (showPassword = !showPassword)}
					width={20}
				/>
			</InputAddon>
		{:else if icon}
			<InputAddon>
				<Icon {icon} width={20} />
			</InputAddon>
		{/if}
		<Input
			id={id || title}
			class={aClass}
			color={validity?.isError ? 'red' : 'default'}
			disabled={inProgress}
			onkeypress={onKeypress}
			type={type === 'password' && showPassword ? 'text' : type}
			bind:value
		/>
	</ButtonGroup>
</FormContainer>
