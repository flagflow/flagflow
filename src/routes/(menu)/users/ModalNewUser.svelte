<script lang="ts" module>
	import ModalNewUser from './ModalNewUser.svelte';

	export const showModalNewUser = async () => {
		const user = {
			userName: 'user@company.com',
			name: 'John Doe',
			password: '',
			roles: [USER_ROLE_VIEWER],
			mustChangePassword: true
		};

		return modalHandler.show({
			component: ModalNewUser,
			props: {
				user
			}
		});
	};
</script>

<script lang="ts">
	import { Badge, Button, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import FormInput from '$components/form/FormInput.svelte';
	import FormSelect from '$components/form/FormSelect.svelte';
	import FormToggle from '$components/form/FormToggle.svelte';
	import { apiClient } from '$lib/api/client';
	import {
		ArrayValidator,
		convertToSelect,
		focusInputById,
		FormLogic,
		StringValidator
	} from '$lib/form.svelte';
	import { modalHandler } from '$lib/modals';
	import { EtcdUserKey } from '$types/Etcd';
	import { USER_ROLE_VIEWER } from '$types/UserRoles';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	interface Properties {
		user: {
			userName: string;
			name: string;
			password: string;
			roles: string[];
			mustChangePassword: boolean;
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
			await apiClient.user.create.mutate({
				key: formData.userName,
				...formData
			});
			dispatch('resolve', { isOk: true });
		},
		{
			validator: (source) => {
				return {
					user: {
						userName: new StringValidator(source.userName, 'trim')
							.required()
							.noSpace()
							.maxLength(64)
							.zod(EtcdUserKey).error,
						name: new StringValidator(source.name, 'trim').required().maxLength(100).error,
						roles: new ArrayValidator(source.roles).required().error
					}
				};
			}
		}
	);
	focusInputById('userName');
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
				New user
				{#if $stateInProgress}
					<Badge color="green">Saving...</Badge>
				{:else if $stateError}
					<Badge color="red">{$stateError?.message || ''}</Badge>
				{/if}
			</div>
		{/snippet}
		<div class="grid grid-cols-6 gap-4">
			<FormInput
				id="userName"
				class="col-span-5"
				inProgress={$stateInProgress}
				mandatory
				title="Username"
				validity={$stateIsValid?.user.userName}
				bind:value={formData.userName}
			/>
			<FormInput
				id="password"
				class="col-span-5"
				inProgress={$stateInProgress}
				mandatory
				title="Password"
				validity={$stateIsValid?.user.password}
				bind:value={formData.password}
			/>
			<FormInput
				id="name"
				class="col-span-5"
				inProgress={$stateInProgress}
				mandatory
				title="Name"
				validity={$stateIsValid?.user.name}
				bind:value={formData.name}
			/>
			<FormToggle
				inProgress={$stateInProgress}
				title="Service"
				bind:checked={formData.mustChangePassword}
			/>
			<FormSelect
				class="col-span-3"
				inProgress={$stateInProgress}
				items={convertToSelect(quantityUnits, 'code', 'code')}
				mandatory
				title="Quantity unit"
				bind:value={formData.roles}
			/>
		</div>

		<div class="mt-4 flex justify-center space-x-4">
			<Button
				class="w-20"
				disabled={!$stateAllValid || $stateInProgress}
				onclick={() => formExecute({})}
			>
				Create</Button
			>
			<Button class="w-20" color="alternative" onclick={() => dispatch('resolve', { isOk: false })}
				>Cancel</Button
			>
		</div>
	</Modal>
</form>
