<script lang="ts">
	import { ButtonGroup } from 'flowbite-svelte';

	import AsyncButton from '$components/AsyncButton.svelte';
	import DefaultUserWarning from '$components/DefaultUserWarning.svelte';
	import EmptyListBanner from '$components/EmptyListBanner.svelte';
	import {
		showModalConfirmationDelete,
		showModalConfirmationOperation
	} from '$components/modal/ModalConfirmation.svelte';
	import { showModalError } from '$components/modal/ModalError.svelte';
	import PageContainer from '$components/PageContainer.svelte';
	import PageTitle from '$components/PageTitle.svelte';
	import AutoTable, {
		type AutoTableDescriptor,
		configAutoTable
	} from '$components/table/AutoTable.svelte';
	import { invalidatePage } from '$lib/navigationEx';
	import { rpcClient } from '$lib/rpc/client';

	import type { PageProps as PageProperties } from './$types';
	import { showModalUserOperation } from './ModalUserOperation.svelte';

	let { data }: PageProperties = $props();

	const createDescriptor = () =>
		configAutoTable({
			data: data.users,
			columns: [
				{
					title: 'Username',
					property: 'key',
					subProperty: 'name'
				},
				{
					title: 'Permissions',
					property: 'permissions',
					isTagLarge: false
				},
				{
					title: 'Password Expiration',
					property: 'passwordExpireAtDate',
					dateFormat: 'yyyy-MM-dd HH:mm:ss',

					indicatorColor: (row) =>
						row.passwordExpireAtDate
							? row.passwordExpireAtDate < new Date()
								? 'red'
								: 'green'
							: 'none'
				},
				{
					align: 'right',
					commands: [
						{
							icon: 'ban',
							color: 'red',
							tooltip: 'Disable user',
							visible: (row) => row.enabled,
							onCommand: async (row) => await setEnableUser(row.key, false)
						},
						{
							icon: 'enable',
							color: 'green',
							tooltip: 'Enable user',
							visible: (row) => !row.enabled,
							onCommand: async (row) => await setEnableUser(row.key, true)
						},

						{
							icon: 'password',
							color: 'blue',
							tooltip: 'Set password',
							visible: (row) => row.enabled,
							onCommand: async (row) => await setPassword(row.key)
						},
						{
							icon: 'edit',
							color: 'black',
							tooltip: 'Modify user',
							visible: (row) => row.enabled,
							onCommand: async (row) => await modifyUser(row.key)
						},
						{
							icon: 'delete',
							color: 'red',
							tooltip: 'Delete user',
							onCommand: async (row) => await removeUser(row.key, row.name)
						}
					]
				}
			],
			primary: 'key',
			sortables: ['key', 'name'],
			ondblclick: (row) => modifyUser(row.key),
			rowClass: (row) => (row.enabled ? '' : 'line-through text-gray-300')
		}) as AutoTableDescriptor;

	const addUser = async () => {
		try {
			const result = await showModalUserOperation('create');
			if (result.isOk) await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const modifyUser = async (userName: string) => {
		try {
			const result = await showModalUserOperation('modify', userName);
			if (result.isOk) await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const setPassword = async (userName: string) => {
		try {
			const result = await showModalUserOperation('setPassword', userName);
			if (result.isOk) await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const removeUser = async (userName: string, name: string) => {
		try {
			const result = await showModalConfirmationDelete(name);
			if (!result.isOk) return;

			await rpcClient.user.delete.mutate({ key: userName });
			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const setEnableUser = async (userName: string, enabled: boolean) => {
		try {
			const result = await showModalConfirmationOperation(
				`${enabled ? 'Enable' : 'Disable'}`,
				userName
			);
			if (!result.isOk) return;

			await rpcClient.user.setEnabled.mutate({ key: userName, enabled });
			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

<PageTitle
	count={data.users.length}
	description="This is where you'll manage your built-in users - you can create new ones, modify their settings (double click), or even delete them. (Just a heads-up: if you're using Keycloak, you won't be doing your user management here)"
	title="Users"
>
	<ButtonGroup size="md">
		<AsyncButton action={addUser} size="lg">New user</AsyncButton>
	</ButtonGroup>
</PageTitle>

{#if data.users.length > 0}
	<PageContainer>
		{#if data.isDefaultUserExists}
			<DefaultUserWarning class="my-4" />
		{/if}
		{#key data}
			<AutoTable descriptor={createDescriptor()} />
		{/key}
	</PageContainer>
{:else}
	<EmptyListBanner icon="user" title="There are no users yet" />
{/if}
