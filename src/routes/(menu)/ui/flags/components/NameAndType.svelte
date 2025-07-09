<script lang="ts">
	import { Helper, Radio } from 'flowbite-svelte';

	import FormContainer from '$components/form/FormContainer.svelte';
	import FormInput from '$components/form/FormInput.svelte';
	import { focusInputById, type ValidityItem } from '$lib/form.svelte';
	import { EtcdHierarchicalKeyInputRegExp } from '$types/etcd';

	interface Properties {
		name: string;
		description: string;
		validity?:
			| {
					name: ValidityItem;
					description: ValidityItem;
			  }
			| undefined;
	}
	let { name = $bindable(), description = $bindable(), validity }: Properties = $props();

	let selectedValue = $state('1');

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
		<FormInput
			id="description"
			maxLength={128}
			title="Description"
			validity={validity?.description}
			bind:value={description}
		/>
	</div>
	<FormContainer class="flex flex-col gap-3 px-4" mandatory title="Type">
		<div class="ml-2 flex flex-col">
			<Radio name="example1" value="1" bind:group={selectedValue}>Boolean</Radio>
			<Helper id="helper-checkbox-text" class="ps-6">On/off functionality or kill switch</Helper>
		</div>

		<div class="ml-2 flex flex-col">
			<Radio name="example1" value="1" bind:group={selectedValue}>Integer</Radio>
			<Helper id="helper-checkbox-text" class="ps-6">Integer value, can be bounded</Helper>
		</div>

		<div class="ml-2 flex flex-col">
			<Radio name="example1" value="1" bind:group={selectedValue}>String</Radio>
			<Helper id="helper-checkbox-text" class="ps-6">Text value</Helper>
		</div>

		<div class="ml-2 flex flex-col">
			<Radio name="example1" value="1" bind:group={selectedValue}>Enum</Radio>
			<Helper id="helper-checkbox-text" class="ps-6">Select from a valueset</Helper>
		</div>
	</FormContainer>
</div>
