<script lang="ts">
	import { Helper, Radio } from 'flowbite-svelte';

	import FormContainer from '$components/form/FormContainer.svelte';
	import { focusInputById } from '$lib/form.svelte';
	import { type EtcdFlagType, EtcdFlagTypeDescription } from '$types/etcd';

	interface Properties {
		type: EtcdFlagType;
	}
	let { type = $bindable() }: Properties = $props();

	focusInputById('name');
</script>

<FormContainer class="flex flex-col gap-3 px-4" mandatory title="Type">
	{#each Object.entries(EtcdFlagTypeDescription) as [flagType, description]}
		<div class="ml-2 flex flex-col">
			<Radio value={flagType} bind:group={type}>{flagType}</Radio>
			<Helper class="ps-6">{description}</Helper>
		</div>
	{/each}
</FormContainer>
