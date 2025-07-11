<script lang="ts">
	import { ButtonGroup, Input, InputAddon, type InputValue } from 'flowbite-svelte';
	import type { HTMLInputTypeAttribute } from 'svelte/elements';

	import Icon from '$components/icon/Icon.svelte';
	import { type IconId } from '$components/icon/Icons';
	import type { ValidityItem } from '$lib/form.svelte';

	import FormContainer from './FormContainer.svelte';

	interface Properties {
		type?: HTMLInputTypeAttribute;
		class?: string;
		id?: string;
		title: string;
		icon?: IconId;
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
					id={showPassword ? 'passwordVisible' : 'password'}
					class="cursor-pointer"
					onclick={() => (showPassword = !showPassword)}
				/>
			</InputAddon>
		{:else if icon}
			<InputAddon>
				<Icon id={icon} />
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
