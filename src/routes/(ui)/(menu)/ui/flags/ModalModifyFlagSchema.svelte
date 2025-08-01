<script lang="ts" module>
	import ModalModifyFlagSchema from './ModalModifyFlagSchema.svelte';

	export const showModalModifyFlagSchema = async (key: string, allowValueChange = false) => {
		try {
			const flag = await rpcClient.flag.get.query({ key });
			return modalHandler.show({
				component: ModalModifyFlagSchema,
				props: { flag, allowValueChange }
			});
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

<script lang="ts">
	import { Badge, Button, Helper, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import FormLabel from '$components/form/FormLabel.svelte';
	import FormToggle from '$components/form/FormToggle.svelte';
	import { showModalError } from '$components/modal/ModalError.svelte';
	import { flagSchemaValidator, flagValueValidator } from '$lib/flag/flagValidator';
	import { ExternalValidator, FormLogic } from '$lib/form.svelte';
	import { modalHandler } from '$lib/modals';
	import { rpcClient } from '$lib/rpc/client';
	import type { EtcdSchemaDataTypeWithKey } from '$types/etcd';

	import StepSchema from './StepSchema.svelte';
	import StepValue from './StepValue.svelte';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	interface Properties {
		flag: EtcdSchemaDataTypeWithKey<'flag'>;
		allowValueChange: boolean;
	}
	const { flag, allowValueChange }: Properties = $props();

	const {
		formData,
		formExecute,
		formState: { stateInProgress, stateError, stateIsValid, stateAllValid }
	} = new FormLogic(
		{
			flag,
			resetValue: false
		},
		async () => {
			await rpcClient.flag.updateSchema.mutate({
				key: formData.flag.key,
				flag: formData.flag,
				resetValue: formData.resetValue
			});
			dispatch('resolve', { isOk: true });
		},
		{
			validator: (source) => {
				const schema = new ExternalValidator(flagSchemaValidator(source.flag)).error;
				const value = new ExternalValidator(
					source.resetValue ? undefined : flagValueValidator(source.flag)
				).error;

				return { schema, value };
			}
		}
	);
</script>

<form onsubmit={formExecute}>
	<Modal
		closedby="none"
		dismissable={false}
		oncancel={() => dispatch('resolve', { isOk: false })}
		open
		outsideclose={false}
		size={allowValueChange ? 'lg' : 'sm'}
	>
		{#snippet header()}
			<div class="flex justify-between gap-4">
				Modify flag schema
				{#if $stateInProgress}
					<Badge color="green">Saving...</Badge>
				{:else if $stateError}
					<Badge color="red">{$stateError?.message || ''}</Badge>
				{/if}
			</div>
		{/snippet}

		<div class="min-h-96">
			{#if allowValueChange}
				<div class="grid grid-cols-2 gap-4">
					<FormLabel
						class="trimmed-content"
						mandatory
						text={formData.flag.key}
						title="Name"
						tooltip
					/>
					<FormLabel mandatory text={formData.flag.type} title="Type" />
				</div>
				<hr class="my-4" />
				<div class="grid min-h-80 grid-cols-2 gap-4">
					<StepSchema name={flag.key} flag={formData.flag} validity={$stateIsValid} />
					<div class="border-l-1 border-dashed">
						<StepValue name={flag.key} flag={formData.flag} validity={$stateIsValid} />
					</div>
				</div>
			{:else}
				<StepSchema name={flag.key} flag={formData.flag} headers validity={$stateIsValid} />
				<hr class="mt-4" />
				{#if !$stateIsValid?.schema.message && $stateIsValid?.value.message}
					<Helper class="mt-4 text-red-700"
						>Use reset toggle, because value error "{$stateIsValid?.value.message}"</Helper
					>
				{/if}
				{#if 'valueExists' in flag}
					<div class="mt-2 flex justify-end space-x-4">
						<FormToggle
							class="mt-4"
							inline
							title="Reset value to default"
							bind:checked={formData.resetValue}
						/>
					</div>
				{/if}
			{/if}
		</div>

		<div class="mt-4 flex justify-center space-x-4">
			<Button
				class="w-20"
				disabled={!$stateAllValid || $stateInProgress}
				onclick={() => formExecute()}
			>
				Modify</Button
			>
			<Button class="w-20" color="alternative" onclick={() => dispatch('resolve', { isOk: false })}
				>Cancel</Button
			>
		</div>
	</Modal>
</form>
