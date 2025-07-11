<script lang="ts">
	import {
		Badge,
		ButtonGroup,
		Card,
		Dropdown,
		DropdownItem,
		Hr,
		Kbd,
		Tooltip
	} from 'flowbite-svelte';

	import AsyncButton from '$components/AsyncButton.svelte';
	import EmptyListBanner from '$components/EmptyListBanner.svelte';
	import Icon from '$components/icon/Icon.svelte';
	import { showModalConfirmationDelete } from '$components/modal/ModalConfirmation.svelte';
	import { showModalError } from '$components/modal/ModalError.svelte';
	import PageTitle from '$components/PageTitle.svelte';
	import ScrollToTop from '$components/ScrollToTop.svelte';
	import { invalidatePage } from '$lib/navigationEx';
	import { rpcClient } from '$lib/rpc/client';

	import type { PageProps as PageProperties } from './$types';
	import { showModalNewFlag } from './ModalNewFlag.svelte';

	let { data }: PageProperties = $props();

	const addFlag = async (groupName = '') => {
		try {
			const result = await showModalNewFlag(groupName);
			if (result.isOk) await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const deleteFlag = async (key: string, type: string) => {
		try {
			const result = await showModalConfirmationDelete(`${key} ${type.toLocaleLowerCase()} flag`);
			if (!result.isOk) return;

			await rpcClient.flag.delete.mutate({ key });
			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

<PageTitle
	count={data.flagCount}
	description="Here's where you can see the registered flags. You can create, edit, and delete flags."
	title="Flags"
	toolbarPos="left"
>
	<ButtonGroup size="md">
		<AsyncButton action={addFlag} size="lg">New flag</AsyncButton>
	</ButtonGroup>
</PageTitle>

{#key data}
	{#if data.flagCount > 0}
		{#each Object.entries(data.flagGroups) as [group, flags]}
			<h5 class="col-span-3 py-4 pt-8 text-xl font-semibold text-gray-700">
				{(group || '#root').replaceAll('/', ' › ')}
				{#if flags.length > 0}
					<Badge color="secondary" size="small">{flags.length}</Badge>
				{/if}
				{#if group}
					<AsyncButton class="ml-2" action={() => addFlag(group)} size="xs">
						<Icon id="add" size={12} />
					</AsyncButton>
				{/if}
			</h5>
			<div class="ml-4 grid grid-cols-3 gap-4">
				{#each flags as flag (flag.key)}
					<Card class="p-4 py-2">
						<div class="flex flex-row items-center justify-between">
							<h5 class="trimmed-content mb-2 font-semibold text-gray-700">
								<Badge class="mr-1 w-0" color="indigo" size="small"
									>{flag.typeToDisplay.slice(0, 1)}</Badge
								>
								<Tooltip placement="bottom-end" type="light">{flag.typeToDisplay}</Tooltip>
								{flag.flagName}
							</h5>
							<div class="-mt-1 -mr-2">
								<Icon
									id="dotsVertical"
									class="dots-menu inline-flex cursor-pointer"
									color="gray"
									size={24}
								/>
								<Dropdown simple>
									<DropdownItem onclick={() => deleteFlag(flag.key, flag.typeToDisplay)}
										>Delete</DropdownItem
									>
								</Dropdown>
							</div>
						</div>
						<Hr class="-mx-4 my-1" />
						<div class="mt-2 flex flex-row items-center justify-between">
							<Kbd class={flag.valueExists ? '' : 'italic'}>
								{#if !flag.valueExists}default:{/if}
								{flag.valueToDisplay}</Kbd
							>
						</div>
						<p class="mt-2 text-justify text-xs font-light text-gray-500">{flag.description}</p>
					</Card>
				{/each}
			</div>
		{/each}
	{:else}
		<EmptyListBanner icon="flag" title="There are no flags yet" />
	{/if}
{/key}

<ScrollToTop />
