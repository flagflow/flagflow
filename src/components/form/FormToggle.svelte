<script lang="ts">
	import { Toggle } from 'flowbite-svelte';

	import type { ValidityItem } from '$lib/form.svelte';

	import FormContainer from './FormContainer.svelte';

	interface Properties {
		class?: string;
		id?: string;
		title: string;
		mandatory?: boolean;
		checked: boolean;
		inline?: boolean;
		inProgress?: boolean;
		validity?: ValidityItem | undefined;
	}

	let {
		class: aClass = '',
		id = '',
		title,
		mandatory = false,
		checked = $bindable(),
		inline = false,
		inProgress = false,
		validity = { isError: false }
	}: Properties = $props();
</script>

{#if inline}
	<Toggle class={aClass} disabled={inProgress} bind:checked>{title}</Toggle>
{:else}
	<FormContainer class={aClass} {mandatory} {title} {validity}>
		<Toggle id={id || title} class="mt-3 ml-2" disabled={inProgress} bind:checked />
	</FormContainer>
{/if}
