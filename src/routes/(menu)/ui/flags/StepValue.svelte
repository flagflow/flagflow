<script lang="ts">
	import { Helper, RadioButton } from 'flowbite-svelte';

	import FormInput from '$components/form/FormInput.svelte';
	import FormLabel from '$components/form/FormLabel.svelte';
	import FormToggle from '$components/form/FormToggle.svelte';
	import { flagSchemaToString } from '$lib/flag/flagToString';
	import { focusInputById, type Validator, type ValidityItem } from '$lib/form.svelte';
	import type { EtcdFlag } from '$types/etcd';

	interface Properties {
		name: string;
		flag: EtcdFlag;
		headers?: boolean;
		initial?: boolean;

		validity?:
			| {
					schema: Validator | ValidityItem;
					value: Validator | ValidityItem;
			  }
			| undefined;
	}
	let { name, flag, headers = false, initial = false, validity }: Properties = $props();

	focusInputById('default');
</script>

<div class="flex flex-col gap-4 px-4">
	{#if headers}
		<FormLabel class="trimmed-content" mandatory text={name} title="Name" tooltip />
		<FormLabel mandatory text={flag.type} title="Type" />
		<hr />
	{/if}
	<div class="flex gap-4">
		<RadioButton
			class="w-1/2 text-sm"
			checkedClass="bg-primary-700 text-white"
			outline
			size="xs"
			value={false}
			bind:group={flag.valueExists}
		>
			Use default value
			<br />
			{flag.defaultValue}
		</RadioButton>
		<RadioButton
			class="w-1/2 text-sm"
			checkedClass="bg-primary-700 text-white"
			outline
			size="xs"
			value={true}
			bind:group={flag.valueExists}
		>
			Set {initial ? 'initial' : ''} value
			<br />
			{flagSchemaToString(flag)}
		</RadioButton>
	</div>

	{#if flag.valueExists}
		{#if flag.type === 'BOOLEAN'}
			<div class="flex flex-col">
				<FormToggle title="Value" bind:checked={flag.value} />
			</div>
		{:else if flag.type === 'INTEGER'}
			<div class="flex flex-col">
				<FormInput title="Value" type="number" bind:value={flag.value} />
			</div>
		{:else if flag.type === 'STRING'}
			<div class="flex flex-col">
				<FormInput title="Value" type="text" bind:value={flag.value} />
			</div>
		{/if}
		{#if !validity?.schema.message && validity?.value.message}
			<Helper class="text-red-700">{validity.value.message}</Helper>
		{/if}
	{/if}
</div>
