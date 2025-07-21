<script lang="ts">
	import { Helper } from 'flowbite-svelte';

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
			  }
			| undefined;
	}
	let { name, flag, headers = false, validity }: Properties = $props();

	focusInputById('default');
</script>

<div class="flex flex-col gap-4">
	{#if headers}
		<FormLabel class="trimmed-content" mandatory text={name} title="Name" tooltip />
		<FormLabel mandatory text={flag.type} title="Type" />
		<hr />
	{/if}
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
