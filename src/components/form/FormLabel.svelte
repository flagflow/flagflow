<script lang="ts">
	import FormContainer from './FormContainer.svelte';

	interface Properties {
		class?: string;
		title: string;
		text: string;
		mandatory?: boolean;
	}

	let { class: aClass = '', title, text, mandatory = false }: Properties = $props();
</script>

<FormContainer class={aClass} {mandatory} {title}>
	<div class="ml-2 text-base">{text}</div>
</FormContainer>
