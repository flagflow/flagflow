<script lang="ts">
	import { ButtonGroup } from 'flowbite-svelte';

	import AsyncButton from '$components/AsyncButton.svelte';
	import EmptyListBanner from '$components/EmptyListBanner.svelte';
	import { showModalConfirmationDelete } from '$components/modal/ModalConfirmation.svelte';
	import { showModalError } from '$components/modal/ModalError.svelte';
	import PageTitle from '$components/PageTitle.svelte';
	import ScrollToTop from '$components/ScrollToTop.svelte';
	import AutoTable, {
		type AutoTableDescriptor,
		configAutoTable
	} from '$components/table/AutoTable.svelte';
	import { invalidatePage } from '$lib/navigationEx';
	import { rpcClient } from '$lib/rpc/client';

	import type { PageProps as PageProperties } from './$types';
	import { showModalNewUser } from './ModalNewUser.svelte';
	import { showModalUserModify } from './ModalUserModify.svelte';

	let { data }: PageProperties = $props();

	const createDescriptor = () =>
		configAutoTable({
			data: data.users,
			columns: [
				{
					title: 'Username',
					property: 'key'
				},
				{
					title: 'Name',
					property: 'name'
				},
				{
					title: 'Roles',
					property: 'rolesToDisplay',
					isTagLarge: false
				},
				{
					align: 'right',
					commands: [
						{
							icon: 'edit',
							color: 'black',
							tooltip: 'Modify user',
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
			ondblclick: (row) => modifyUser(row.key)
		}) as AutoTableDescriptor;

	const addUser = async () => {
		try {
			const result = await showModalNewUser();
			if (result.isOk) await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const modifyUser = async (userName: string) => {
		try {
			const result = await showModalUserModify(userName);
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
</script>

<PageTitle
	count={data.users.length}
	description="This is where you'll manage your built-in users - you can create new ones, modify their settings (double click), or even delete them. (Just a heads-up: if you're using Keycloak, you won't be doing your user management here)"
	title="Users"
	toolbarPos="left"
>
	<ButtonGroup size="md">
		<AsyncButton action={addUser} size="lg">New user</AsyncButton>
	</ButtonGroup>
</PageTitle>

{#if data.users.length > 0}
	{#key data}
		<AutoTable descriptor={createDescriptor()} />
	{/key}
{:else}
	<EmptyListBanner icon="user" title="There are no users yet" />
{/if}
<ScrollToTop />
