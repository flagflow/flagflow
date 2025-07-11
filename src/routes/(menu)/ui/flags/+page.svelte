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
	<div class="grid grid-cols-3 gap-4">
		{#key data}
			{#each data.flags as flag (flag.key)}
				<Card class="p-4 py-2">
					<div class="flex flex-row items-center justify-between">
						<h5 class="trimmed-content mb-2 font-semibold text-gray-700">
							<Badge class="mr-1 w-0" size="small">{flag.typeToDisplay.slice(0, 1)}</Badge>
							<Tooltip placement="bottom-end" type="light">{flag.typeToDisplay}</Tooltip>
							{flag.key}
						</h5>
						<div class="-mt-1 -mr-2">
							<Icon id="dotsVertical" class="dots-menu  inline-flex cursor-pointer" size={24} />
							<Dropdown simple triggeredBy=".dots-menu">
								<DropdownItem onclick={() => removeFlag(flag.key, flag.type)}>Remove</DropdownItem>
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
		{/key}
	</div>
{:else}
	<EmptyListBanner icon="flag" title="There are no flags yet" />
{/if}
<ScrollToTop />
