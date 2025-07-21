<script lang="ts">
	import { Helper, Radio } from 'flowbite-svelte';

	import FormInput from '$components/form/FormInput.svelte';
	import FormLabel from '$components/form/FormLabel.svelte';
	import FormToggle from '$components/form/FormToggle.svelte';
	import { focusInputById, type Validator, type ValidityItem } from '$lib/form.svelte';
	import type { EtcdFlag } from '$types/etcd';

	interface Properties {
		name: string;
		flag: EtcdFlag;
		headers?: boolean;

		validity?:
			| {
					schema: Validator | ValidityItem;
					value: Validator | ValidityItem;
			  }
			| undefined;
	}
	let { name, flag, headers = false, validity }: Properties = $props();

	focusInputById('default');
</script>

<div class="flex flex-col gap-4 px-4">
	{#if headers}
		<FormLabel class="trimmed-content" mandatory text={name} title="Name" tooltip />
		<FormLabel mandatory text={flag.type} title="Type" />
		<hr />
	{/if}
	<div class="flex gap-6">
		<Radio value={false} bind:group={flag.valueExists}>Use default value</Radio>
		<Radio value={true} bind:group={flag.valueExists}>Set initial value</Radio>
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
		{/if}
		{#if !validity?.schema.message && validity?.value.message}
			<Helper class="text-red-700">{validity.value.message}</Helper>
		{/if}
	{/if}
</div>
