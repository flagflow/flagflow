<script lang="ts">
	import { Helper, RadioButton } from 'flowbite-svelte';

	import FormInput from '$components/form/FormInput.svelte';
	import FormLabel from '$components/form/FormLabel.svelte';
	import FormMultiSelect from '$components/form/FormMultiSelect.svelte';
	import FormSelect from '$components/form/FormSelect.svelte';
	import FormTextarea from '$components/form/FormTextarea.svelte';
	import FormToggle from '$components/form/FormToggle.svelte';
	import Icon from '$components/Icon.svelte';
	import { flagDefaultValueToString, flagSchemaToString } from '$lib/flagHandler/flagToString';
	import {
		convertStringsToSelectInput,
		focusInputById,
		type Validator,
		type ValidityItem
	} from '$lib/form.svelte';
	import type { PersistentFlag } from '$types/persistent';

	interface Properties {
		name: string;
		flag: PersistentFlag;
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
	{#if 'valueExists' in flag}
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
				{flagDefaultValueToString(flag)}
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
			{:else if flag.type === 'OBJECT'}
				<div class="flex flex-col">
					<FormTextarea rows={5} title="Value" bind:value={flag.value} />
				</div>
			{:else if flag.type === 'ENUM'}
				<FormSelect
					items={convertStringsToSelectInput(
						flag.enumValues,
						flag.allowEmpty ? { name: '[Not set]', value: '' } : undefined
					)}
					title="Value"
					bind:value={flag.value}
				/>
			{:else if flag.type === 'TAG'}
				<FormMultiSelect
					items={convertStringsToSelectInput(flag.tagValues)}
					title="Value"
					bind:value={flag.value}
				/>
			{/if}
			{#if !validity?.schema.message && validity?.value.message}
				<Helper class="text-red-700">{validity.value.message}</Helper>
			{/if}
		{/if}
	{:else}
		<div class="mt-4 flex flex-col items-center gap-8">
			<Icon id="changingValue" size={64} />
			<div class="text-center text-lg">
				Dynamic flag value cannot be set, this will be calculated at runtime.
			</div>
		</div>
	{/if}
</div>
