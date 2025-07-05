<script lang="ts">
	import EmptyListBanner from '$components/EmptyListBanner.svelte';
	import { showModalConfirmationDelete } from '$components/modal/ModalConfirmation.svelte';
	import { showModalError } from '$components/modal/ModalError.svelte';
	import PageTitle from '$components/PageTitle.svelte';
	import ScrollToTop from '$components/ScrollToTop.svelte';
	import AutoTable, {
		type AutoTableDescriptor,
		configAutoTable
	} from '$components/table/AutoTable.svelte';
	import { apiClient } from '$lib/api/client';
	import { invalidatePage } from '$lib/navigationEx';
	import { Button, ButtonGroup } from 'flowbite-svelte';

	import type { PageProps as PageProperties } from './$types';
	import AsyncButton from '$components/AsyncButton.svelte';

	let { data }: PageProperties = $props();

	const createDescriptor = () =>
		configAutoTable({
			data: data.users,
			columns: [
				{
					title: 'User',
					property: 'name',
					tagsProperty: 'roles'
				},
				{
					align: 'right',
					commands: [
						{
							icon: 'mdi:delete',
							color: 'red',
							tooltip: 'Delete session',
							onCommand: async (row) => await removeUser(row.key)
						}
					]
				}
			],
			primary: 'name',
			sortables: ['name'],
			sortOrderDefaultDesc: true
		}) as AutoTableDescriptor;

	const addUser = async () => {
		try {
			const result = await showModalConfirmationDelete(name);
			if (!result.isOk) return;

			//await apiClient.session.delete.mutate({ name });
			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const removeUser = async (name: string) => {
		try {
			const result = await showModalConfirmationDelete(name);
			if (!result.isOk) return;

			//await apiClient.session.delete.mutate({ name });
			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

<PageTitle status="Built-in users" title="Users" toolbarPos="left">
	<ButtonGroup>
		<AsyncButton action={addUser}>AAA</AsyncButton>
	</ButtonGroup>
</PageTitle>

{#if data.users.length > 0}
	{#key data}
		<AutoTable descriptor={createDescriptor()} />
	{/key}
{:else}
	<EmptyListBanner icon="mdi:user" title="There are no users yet" />
{/if}
<ScrollToTop />
