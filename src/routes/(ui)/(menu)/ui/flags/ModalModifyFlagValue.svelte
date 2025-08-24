<script lang="ts" module>
	import ModalModifyFlagValue from './ModalModifyFlagValue.svelte';

	export const showModalModifyFlagValue = async (key: string = '') => {
		try {
			const flag = await rpcClient.flag.get.query({ key });
			return modalHandler.show({ component: ModalModifyFlagValue, props: { flag } });
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

<script lang="ts">
	import { Badge, Button, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import { showModalError } from '$components/modal/ModalError.svelte';
	import { flagSchemaValidator, flagValueValidator } from '$lib/flagHandler/flagValidator';
	import { ExternalValidator, FormLogic } from '$lib/form.svelte';
	import { modalHandler } from '$lib/modals';
	import { rpcClient } from '$lib/rpc/client';
	import { type PersistentSchemaDataTypeWithKey } from '$types/persistent';

	import StepValue from './StepValue.svelte';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	interface Properties {
		flag: PersistentSchemaDataTypeWithKey<'flag'>;
	}
	const { flag }: Properties = $props();

	const {
		formData,
		formExecute,
		formState: { stateInProgress, stateError, stateIsValid, stateAllValid }
	} = new FormLogic(
		flag,
		async () => {
			await rpcClient.flag.updateValue.mutate({
				key: formData.key,
				flag: formData
			});
			dispatch('resolve', { isOk: true });
		},
		{
			validator: (source) => {
				const schema = new ExternalValidator(flagSchemaValidator(source)).error;
				const value = new ExternalValidator(flagValueValidator(source)).error;

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
		size="sm"
	>
		{#snippet header()}
			<div class="flex justify-between gap-4">
				Set flag value
				{#if $stateInProgress}
					<Badge color="green">Saving...</Badge>
				{:else if $stateError}
					<Badge color="red">{$stateError?.message || ''}</Badge>
				{/if}
			</div>
		{/snippet}

		<div class="min-h-96">
			<StepValue name={flag.key} flag={formData} headers validity={$stateIsValid} />
		</div>

		<div class="mt-4 flex justify-center space-x-4">
			{#if 'valueExists' in flag}
				<Button
					class="w-20"
					disabled={!$stateAllValid || $stateInProgress}
					onclick={() => formExecute()}
				>
					Set</Button
				>
			{/if}
			<Button class="w-20" color="alternative" onclick={() => dispatch('resolve', { isOk: false })}
				>Cancel</Button
			>
		</div>
	</Modal>
</form>
