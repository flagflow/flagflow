<script lang="ts">
	import { Tags } from 'flowbite-svelte';

	import type { ValidityItem } from '$lib/form.svelte';

	import FormContainer from './FormContainer.svelte';

	interface Properties {
		class?: string;
		id?: string;
		title?: string;
		tags: string[];
		unique?: boolean;
		inProgress?: boolean;
		validity?: ValidityItem | undefined;
	}

	let {
		class: aClass = '',
		id = '',
		title = '',
		tags = $bindable(),
		unique = true,
		validity = { isError: false }
	}: Properties = $props();
</script>

<FormContainer class={aClass} {title} {validity}>
	<Tags id={id || title} {unique} bind:value={tags} />
</FormContainer>
