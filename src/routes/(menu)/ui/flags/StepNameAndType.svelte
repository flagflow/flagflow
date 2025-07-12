<script lang="ts">
	import { Helper, Radio } from 'flowbite-svelte';

	import FormContainer from '$components/form/FormContainer.svelte';
	import FormInput from '$components/form/FormInput.svelte';
	import FormTextarea from '$components/form/FormTextarea.svelte';
	import { focusInputById, type ValidityItem } from '$lib/form.svelte';
	import {
		type EtcdFlagType,
		EtcdFlagTypeDescription,
		EtcdHierarchicalKeyInputRegExp
	} from '$types/etcd';

	interface Properties {
		name: string;
		description: string;
		type: EtcdFlagType;
		typeEnabled?: boolean;
		validity?:
			| {
					name: ValidityItem;
					description: ValidityItem;
			  }
			| undefined;
	}
	let {
		name = $bindable(),
		description = $bindable(),
		type = $bindable(),
		typeEnabled = true,
		validity
	}: Properties = $props();

	focusInputById('name');
</script>

<div class="grid grid-cols-2 gap-4">
	<div class="flex flex-col gap-4">
		<FormInput
			id="name"
			mandatory
			maxLength={128}
			regexp={EtcdHierarchicalKeyInputRegExp}
			title="Name"
			validity={validity?.name}
			bind:value={name}
		/>
		<FormTextarea
			id="description"
			rows={8}
			title="Description"
			validity={validity?.description}
			bind:value={description}
		/>
	</div>
	<FormContainer class="flex flex-col gap-3 px-4" mandatory title="Type">
		{#each Object.entries(EtcdFlagTypeDescription) as [flagType, description]}
			{#if typeEnabled || flagType === type}
				<div class="ml-2 flex flex-col">
					<Radio value={flagType} bind:group={type}>{flagType}</Radio>
					<Helper class="ps-6">{description}</Helper>
				</div>
			{/if}
		{/each}
	</FormContainer>
</div>
