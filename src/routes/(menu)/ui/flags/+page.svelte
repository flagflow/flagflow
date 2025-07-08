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
			data: data.sessions,
			columns: [
				{
					title: 'User',
					property: 'userName'
				},
				{
					title: 'Created at',
					property: 'createdAt',
					dateFormat: 'YYYY-MM-DD HH:mm:ss',
					subProperty: 'createdAtElapsed'
				},
				{
					title: 'Session',
					property: 'key'
				},
				{
					align: 'right',
					commands: [
						{
							icon: 'delete',
							color: 'red',
							tooltip: 'Delete session',
							onCommand: async (row) => await removeSession(row.key, row.userName)
						}
					]
				}
			],
			primary: 'userName',
			sortables: ['userName', 'key', 'createdAt']
		}) as AutoTableDescriptor;

	const addFlag = async () => {
		try {
			const result = await showModalNewFlag();
			if (result.isOk) await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const removeSession = async (sessionId: string, name: string) => {
		try {
			const result = await showModalConfirmationDelete(`session of ${name}`);
			if (!result.isOk) return;

			await rpcClient.session.delete.mutate({ sessionId });
			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

<PageTitle
	count={data.sessions.length}
	description="Here's where you can see the active sessions for your built-in users, along with their login times. You also have the power to terminate a session, which will log that user out."
	title="Sessions"
	toolbarPos="left"
>
	<ButtonGroup size="md">
		<AsyncButton action={addFlag} size="lg">New flag</AsyncButton>
	</ButtonGroup>
</PageTitle>

{#if data.sessions.length > 0}
	{#key data}
		<AutoTable descriptor={createDescriptor()} />
	{/key}
{:else}
	<EmptyListBanner icon="session" title="There are no sessions yet" />
{/if}
<ScrollToTop />
