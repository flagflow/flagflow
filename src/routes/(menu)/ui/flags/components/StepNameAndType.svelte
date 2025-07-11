<script lang="ts">
	import { Helper, Radio } from 'flowbite-svelte';

	import FormContainer from '$components/form/FormContainer.svelte';
	import FormInput from '$components/form/FormInput.svelte';
	import FormTextarea from '$components/form/FormTextarea.svelte';
	import { focusInputById, type ValidityItem } from '$lib/form.svelte';
	import { type EtcdFlagType, EtcdHierarchicalKeyInputRegExp } from '$types/etcd';

	interface Properties {
		name: string;
		description: string;
		type: EtcdFlagType;
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
		<div class="ml-2 flex flex-col">
			<Radio value="BOOLEAN" bind:group={type}>Boolean</Radio>
			<Helper class="ps-6">On/off functionality or kill switch</Helper>
		</div>

		<div class="ml-2 flex flex-col">
			<Radio value="INTEGER" bind:group={type}>Integer</Radio>
			<Helper class="ps-6">Integer value, can be bounded</Helper>
		</div>

		<div class="ml-2 flex flex-col">
			<Radio value="STRING" bind:group={type}>String</Radio>
			<Helper class="ps-6">Text value</Helper>
		</div>

		<div class="ml-2 flex flex-col">
			<Radio value="ENUM" bind:group={type}>Enum</Radio>
			<Helper class="ps-6">Select from a valueset</Helper>
		</div>
	</FormContainer>
</div>
