<script lang="ts" module>
	import ModalRenameGroup from './ModalRenameGroup.svelte';

	export const showModalRenameGroup = async (groupName: string) => {
		try {
			return modalHandler.show({ component: ModalRenameGroup, props: { groupName } });
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

<script lang="ts">
	import { Badge, Button, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import FormInput from '$components/form/FormInput.svelte';
	import FormLabel from '$components/form/FormLabel.svelte';
	import { showModalError } from '$components/modal/ModalError.svelte';
	import { FormLogic, StringValidator } from '$lib/form.svelte';
	import { rpcClient } from '$lib/rpc/client';
	import { modalHandler } from '$lib/svelteModal/modal';
	import { PersistentFlagKey, PersistentHierarchicalKeyInputRegExp } from '$types/persistent';

	import { GROUP_GENERAL_NAME } from './Const';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	interface Properties {
		groupName: string;
	}
	const { groupName }: Properties = $props();
	const oldName = groupName;

	const {
		formData,
		formExecute,
		formState: { stateInProgress, stateError, stateIsValid, stateAllValid }
	} = new FormLogic(
		{
			groupName
		},
		async () => {
			await rpcClient.flag.renameGroup.mutate({
				oldGroupName: oldName,
				recentGroupName: formData.groupName
			});
			dispatch('resolve', { isOk: true });
		},
		{
			validator: (source) => {
				const name = new StringValidator(source.groupName, 'trim')
					.maxLength(128)
					.notEqualsWith(oldName, oldName)
					.zod(PersistentFlagKey).error;

				return {
					name
				};
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
				Rename group
				{#if $stateInProgress}
					<Badge color="green">Saving...</Badge>
				{:else if $stateError}
					<Badge color="red">{$stateError?.message || ''}</Badge>
				{/if}
			</div>
		{/snippet}

		<div class="flex flex-col gap-4">
			<FormLabel mandatory text={oldName || GROUP_GENERAL_NAME} title="Current group name" />
			<FormInput
				id="groupName"
				mandatory
				maxLength={128}
				regexp={PersistentHierarchicalKeyInputRegExp}
				title="New group name"
				validity={$stateIsValid?.['name']}
				bind:value={formData.groupName}
			/>
		</div>

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
