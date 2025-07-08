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

	import type { PageProps as PageProperties } from './$types';

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

	const removeSession = async (sessionId: string, name: string) => {
		try {
			const result = await showModalConfirmationDelete(`session of ${name}`);
			if (!result.isOk) return;

			await apiClient.session.delete.mutate({ sessionId });
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
/>

{#if data.sessions.length > 0}
	{#key data}
		<AutoTable descriptor={createDescriptor()} />
	{/key}
{:else}
	<EmptyListBanner icon="session" title="There are no sessions yet" />
{/if}
<ScrollToTop />
