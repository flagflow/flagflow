<script lang="ts">
	import TagInput from '$components/input/TagInput.svelte';
	import type { ValidityItem } from '$lib/form.svelte';

	import FormContainer from './FormContainer.svelte';

	interface Properties {
		class?: string;
		id?: string;
		inlineTitle?: string;
		title?: string;
		tags: string[];
		inProgress?: boolean;
		validity?: ValidityItem | undefined;
	}

	let {
		class: aClass = '',
		id = '',
		inlineTitle = '',
		title = '',
		tags = $bindable(),
		inProgress = false,
		validity = { isError: false }
	}: Properties = $props();
</script>

<FormContainer class={aClass} {title} {validity}>
	<TagInput id={id || title} disabled={inProgress} {inlineTitle} bind:tags />
</FormContainer>
