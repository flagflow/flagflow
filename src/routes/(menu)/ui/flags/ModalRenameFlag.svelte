<script lang="ts" module>
	import ModalRenameFlag from './ModalRenameFlag.svelte';

	export const showModalRenameFlag = async (key: string = '') => {
		try {
			const flag = await rpcClient.flag.get.query({ key });
			return modalHandler.show({ component: ModalRenameFlag, props: { flag } });
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

<script lang="ts">
	import { Badge, Button, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import { showModalError } from '$components/modal/ModalError.svelte';
	import { FormLogic, StringValidator } from '$lib/form.svelte';
	import { modalHandler } from '$lib/modals';
	import { rpcClient } from '$lib/rpc/client';
	import type { EtcdSchemaDataTypeWithKey } from '$types/etcd';
	import { EtcdFlagKey } from '$types/etcd';

	import StepName from './StepName.svelte';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	interface Properties {
		flag: EtcdSchemaDataTypeWithKey<'flag'>;
	}
	const { flag }: Properties = $props();
	const oldKey = flag.key;

	const {
		formData,
		formExecute,
		formState: { stateInProgress, stateError, stateIsValid, stateAllValid }
	} = new FormLogic(
		flag,
		async () => {
			await rpcClient.flag.rename.mutate({
				oldKey,
				recentKey: formData.key,
				description: formData.description
			});
			dispatch('resolve', { isOk: true });
		},
		{
			validator: (source) => {
				const name = new StringValidator(source.key, 'trim')
					.required()
					.maxLength(128)
					.zod(EtcdFlagKey).error;
				const description = new StringValidator(source.description, 'trim').maxLength(512).error;

				return {
					name,
					description
				};
			}
		}
	);
</script>

<form onsubmit={formExecute}>
	<Modal
		dismissable={false}
		onclose={() => dispatch('resolve', { isOk: false })}
		permanent
		size="sm"
	>
		{#snippet header()}
			<div class="flex justify-between">
				Rename flag
				{#if $stateInProgress}
					<Badge color="green">Saving...</Badge>
				{:else if $stateError}
					<Badge color="red">{$stateError?.message || ''}</Badge>
				{/if}
			</div>
		{/snippet}

		<StepName
			validity={$stateIsValid}
			bind:name={formData.key}
			bind:description={formData.description}
		/>

		<div class="mt-4 flex justify-center space-x-4">
			<Button
				class="w-20"
				disabled={!$stateAllValid || $stateInProgress}
				onclick={() => formExecute()}
			>
				Rename</Button
			>
			<Button class="w-20" color="alternative" onclick={() => dispatch('resolve', { isOk: false })}
				>Cancel</Button
			>
		</div>
	</Modal>
</form>
