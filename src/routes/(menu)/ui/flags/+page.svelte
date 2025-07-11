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
	import { showModalNewFlag } from './ModalNewFlag.svelte';

	let { data }: PageProperties = $props();

	const createDescriptor = () =>
		configAutoTable({
			data: data.flags,
			columns: [
				{
					title: 'User',
					property: 'key'
				},
				{
					title: 'Type',
					property: 'type'
				},
				{
					align: 'right',
					commands: [
						{
							icon: 'delete',
							color: 'red',
							tooltip: 'Delete flag',
							onCommand: async (row) => await removeFlag(row.key, row.type)
						}
					]
				}
			],
			primary: 'key',
			sortables: ['key', 'type']
		}) as AutoTableDescriptor;

	const addFlag = async () => {
		try {
			const result = await showModalNewFlag();
			if (result.isOk) await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const removeFlag = async (key: string, type: string) => {
		try {
			const result = await showModalConfirmationDelete(`${key} (${type})`);
			if (!result.isOk) return;

			await rpcClient.flag.delete.mutate({ key });
			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

<PageTitle
	count={data.flags.length}
	description="Here's where you can see the registered flags. You can create, edit, and delete flags."
	title="Flags"
	toolbarPos="left"
>
	<ButtonGroup size="md">
		<AsyncButton action={addFlag} size="lg">New flag</AsyncButton>
	</ButtonGroup>
</PageTitle>

{#if data.flags.length > 0}
	{#key data}
		<AutoTable descriptor={createDescriptor()} />
	{/key}
{:else}
	<EmptyListBanner icon="flag" title="There are no flags yet" />
{/if}
<ScrollToTop />
