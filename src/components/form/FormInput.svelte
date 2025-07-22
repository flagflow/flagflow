<script lang="ts">
	import { Button, ButtonGroup, Input, InputAddon, type InputValue } from 'flowbite-svelte';
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
		preIcon?: IconId;
		postIcon?: IconId;
		preText?: string;
		postText?: string;
		postButton?: {
			text: string;
			onclick: () => void;
			color?:
				| 'primary'
				| 'secondary'
				| 'alternative'
				| 'gray'
				| 'dark'
				| 'light'
				| 'red'
				| 'green'
				| 'yellow'
				| undefined;
		};
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
		preIcon,
		postIcon,
		preText,
		postText,
		postButton,
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
		{/if}
		{#if preIcon}
			<InputAddon>
				<Icon id={preIcon} />
			</InputAddon>
		{/if}
		{#if preText}
			<InputAddon>{preText}</InputAddon>
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
		{#if postText}
			<InputAddon>{postText}</InputAddon>
		{/if}
		{#if postIcon}
			<InputAddon>
				<Icon id={postIcon} />
			</InputAddon>
		{/if}
		{#if postButton}
			<Button color={postButton.color} onclick={postButton.onclick}>
				{postButton.text}
			</Button>
		{/if}
	</ButtonGroup>
</FormContainer>
