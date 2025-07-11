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

		validity?:
			| {
					schema: Validator | ValidityItem;
					value: Validator | ValidityItem;
			  }
			| undefined;
	}
	let { name, flag, validity }: Properties = $props();

	focusInputById('default');
</script>

<div class="grid h-96 grid-cols-2 gap-4">
	<div class="flex flex-col gap-4">
		<FormLabel class="trimmed-content" mandatory text={name} title="Name" tooltip />
		<FormLabel mandatory text={flag.type} title="Type" />
		{#if flag.type === 'BOOLEAN'}
			<FormToggle id="default" mandatory title="Default value" bind:checked={flag.defaultValue} />
			<FormToggle title="Kill switch" bind:checked={flag.isKillSwitch} />
		{:else if flag.type === 'INTEGER'}
			<FormInput id="default" title="Default value" type="number" bind:value={flag.defaultValue} />
			<div class="grid grid-cols-2 gap-4">
				<FormInput title="Minimum value" type="number" bind:value={flag.minValue} />
				<FormInput title="Maximum value" type="number" bind:value={flag.maxValue} />
			</div>
		{/if}
		{#if validity?.schema.message}
			<Helper class="text-red-700">{validity.schema.message}</Helper>
		{/if}
	</div>
	<div class="flex flex-col gap-4 border-l-1 border-dashed px-4">
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
</div>
