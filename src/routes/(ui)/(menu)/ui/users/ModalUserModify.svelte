<script lang="ts" module>
	import ModalUserModify from './ModalUserModify.svelte';

	export const showModalUserModify = async (userName: string) => {
		const user = await rpcClient.user.get.query({ key: userName });

		return modalHandler.show({
			component: ModalUserModify,
			props: {
				user: {
					userName: userName,
					...user
				}
			}
		});
	};
</script>

<script lang="ts">
	import { Badge, Button, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import FormInput from '$components/form/FormInput.svelte';
	import FormLabel from '$components/form/FormLabel.svelte';
	import FormUserPermissionEditor from '$components/form/FormUserPermissionEditor.svelte';
	import { ArrayValidator, focusInputById, FormLogic, StringValidator } from '$lib/form.svelte';
	import { modalHandler } from '$lib/modals';
	import { rpcClient } from '$lib/rpc/client';
	import { type UserPermission } from '$types/UserPermissions';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	interface Properties {
		user: {
			userName: string;
			name: string;
			permissions: UserPermission[];
		};
	}
	const { user }: Properties = $props();

	const {
		formData,
		formExecute,
		formState: { stateInProgress, stateError, stateAllValid, stateIsValid }
	} = new FormLogic(
		user,
		async () => {
			await rpcClient.user.update.mutate({
				key: formData.userName,
				...formData
			});
			dispatch('resolve', { isOk: true });
		},
		{
			validator: (source) => {
				return {
					user: {
						name: new StringValidator(source.name, 'trim').required().maxLength(100).error,
						permissions: new ArrayValidator(source.permissions).required().error
					}
				};
			}
		}
	);

	focusInputById('name');
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
				Modify user
				{#if $stateInProgress}
					<Badge color="green">Saving...</Badge>
				{:else if $stateError}
					<Badge color="red">{$stateError?.message || ''}</Badge>
				{/if}
			</div>
		{/snippet}
		<div class="flex flex-col gap-4">
			<FormLabel mandatory text={user.userName} title="Username" />
			<FormInput
				id="name"
				inProgress={$stateInProgress}
				mandatory
				title="Name"
				validity={$stateIsValid?.user.name}
				bind:value={formData.name}
			/>
			<FormUserPermissionEditor
				inProgress={$stateInProgress}
				mandatory
				title="Assigned permissions"
				validity={$stateIsValid?.user.permissions}
				bind:permissions={formData.permissions}
			/>
		</div>

		<div class="mt-4 flex justify-center space-x-4">
			<Button
				class="w-20"
				disabled={!$stateAllValid || $stateInProgress}
				onclick={() => formExecute()}
			>
				Update</Button
			>
			<Button class="w-20" color="alternative" onclick={() => dispatch('resolve', { isOk: false })}
				>Cancel</Button
			>
		</div>
	</Modal>
</form>
