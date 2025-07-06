<script lang="ts">
	import { Toggle } from 'flowbite-svelte';

	import type { ValidityItem } from '$lib/form.svelte';

	import FormContainer from './FormContainer.svelte';

	interface Properties {
		class?: string;
		title: string;
		checked: boolean;
		inline?: boolean;
		inProgress?: boolean;
		validity?: ValidityItem | undefined;
	}

	let {
		class: aClass = '',
		title,
		checked = $bindable(),
		inline = false,
		inProgress = true,
		validity = { isError: false }
	}: Properties = $props();
</script>

{#if inline}
	<Toggle class={aClass} disabled={inProgress} bind:checked>{title}</Toggle>
{:else}
	<FormContainer class={aClass} {title} {validity}>
		<Toggle class="mt-3" disabled={inProgress} bind:checked />
	</FormContainer>
{/if}
