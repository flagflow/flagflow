<script lang="ts">
	import clsx from 'clsx';
	import {
		ButtonGroup,
		Card,
		Dropdown,
		DropdownDivider,
		DropdownItem,
		Input,
		InputAddon,
		Kbd,
		RadioButton,
		Select,
		Tooltip
	} from 'flowbite-svelte';
	import { persisted } from 'svelte-persisted-store';

	import AsyncButton from '$components/AsyncButton.svelte';
	import EmptyListBanner from '$components/EmptyListBanner.svelte';
	import Icon from '$components/Icon.svelte';
	import { showModalConfirmationDelete } from '$components/modal/ModalConfirmation.svelte';
	import { showModalError } from '$components/modal/ModalError.svelte';
	import PageContainer from '$components/PageContainer.svelte';
	import PageTitle from '$components/PageTitle.svelte';
	import { flagValueToString } from '$lib/flagHandler/flagToString';
	import { focusInputById } from '$lib/form.svelte';
	import { clamp } from '$lib/mathEx';
	import { invalidatePage } from '$lib/navigationEx';
	import { rpcClient } from '$lib/rpc/client';
	import { urlParameterStore } from '$lib/stores/urlParameterStore';
	import type { PersistentFlag } from '$types/persistent';
	import { type PersistentWithKey } from '$types/persistent';

	import type { PageProps as PageProperties } from './$types';
	import { GROUP_GENERAL_NAME, GROUP_NAME_SEPARATOR } from './Const';
	import { showModalFlagGroupUrl, showModalFlagUrl } from './ModalFlagUrl.svelte';
	import { showModalModifyFlagSchema } from './ModalModifyFlagSchema.svelte';
	import { showModalModifyFlagValue } from './ModalModifyFlagValue.svelte';
	import { showModalNewFlag } from './ModalNewFlag.svelte';
	import { showModalRenameFlag } from './ModalRenameFlag.svelte';
	import { showModalRenameGroup } from './ModalRenameGroup.svelte';

	let { data }: PageProperties = $props();

	const permissions = data.authenticationContext.permissions;
	const hasPermissionCreate = permissions['flag-create'];
	const hasPermissionSetValue = permissions['flag-value'];
	const hasPermissionEditSchema = permissions['flag-schema'];

	const GROUP_INDENT_PX = 40;
	const GROUP_TITLE_INDENT_PX = 20;
	const groupNameDecorator = (groupName: string) => groupName.replaceAll('/', GROUP_NAME_SEPARATOR);
	const groupNameLevel = (groupName: string) => (groupName ? groupName.split('/').length : 0);

	type ListSettings = {
		displayMode: 'grid' | 'list' | 'compactList';
	};
	const listSettings = persisted<ListSettings>('flag-list', {
		displayMode: 'grid'
	});
	const groupFilter = urlParameterStore({ key: 'group', defaultValue: '' });
	const searchFilter = urlParameterStore({ key: 'search', defaultValue: '', debounce: 350 });

	const filterItemGroup = $state(
		data.flagGroupKeys.map((k) => ({
			value: k || GROUP_GENERAL_NAME,
			name: groupNameDecorator(k || GROUP_GENERAL_NAME)
		}))
	);
	filterItemGroup.unshift({ value: '', name: 'All' });
	const longestFlagNameLength = $state(
		data.flagGroups.reduce((max, [, flags]) => {
			const maxFlagNameLength = Math.max(...flags.map((f) => f.flagName.length));
			return Math.max(max, maxFlagNameLength);
		}, 0)
	);

	const addFlag = async (groupName = '') => {
		try {
			const result = await showModalNewFlag(hasPermissionSetValue, groupName);
			if (result.isOk) await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const renameFlag = async (key: string) => {
		try {
			const result = await showModalRenameFlag(key);
			if (!result || !result.isOk) return;

			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const modifyFlagSchema = async (key: string) => {
		try {
			const result = await showModalModifyFlagSchema(key, hasPermissionSetValue);
			if (!result || !result.isOk) return;

			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const modifyFlagValue = async (key: string) => {
		try {
			const result = await showModalModifyFlagValue(key);
			if (!result || !result.isOk) return;

			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const deleteFlag = async (key: string, type: string) => {
		try {
			const result = await showModalConfirmationDelete(
				`${key} (${type.toLocaleLowerCase()} type) flag`
			);
			if (!result.isOk) return;

			await rpcClient.flag.delete.mutate({ key });
			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const renameGroup = async (groupName: string) => {
		try {
			const result = await showModalRenameGroup(groupName);
			if (!result || !result.isOk) return;

			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const deleteGroup = async (groupName: string) => {
		try {
			const result = await showModalConfirmationDelete(`${groupName || GROUP_GENERAL_NAME} group`);
			if (!result.isOk) return;

			await rpcClient.flag.deleteGroup.mutate({ groupName });
			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	focusInputById('search');
</script>

<PageTitle count={data.flagCount} hr title="Flags">
	{#if hasPermissionCreate}
		<ButtonGroup size="md">
			<AsyncButton action={addFlag} size="lg">New flag</AsyncButton>
		</ButtonGroup>
	{/if}
	<ButtonGroup class="w-72">
		<InputAddon><Icon id="search" /></InputAddon>
		<Input
			id="search"
			class="unfocused"
			placeholder="Search flags..."
			size="md"
			type="search"
			bind:value={$searchFilter}
		/>
	</ButtonGroup>

	{#snippet rightToolbar()}
		{#if filterItemGroup.length > 2}
			<Select
				class="unfocused ml-4 w-64"
				items={filterItemGroup}
				placeholder="Group filter"
				size="md"
				bind:value={$groupFilter}
			/>
		{/if}
		<div>
			<RadioButton
				checkedClass="border-2 border-gray-300"
				color="alternative"
				size="xs"
				value="grid"
				bind:group={$listSettings['displayMode']}
			>
				<Icon id="formatGrid" />
			</RadioButton>
			<RadioButton
				checkedClass="border-2 border-gray-300"
				color="alternative"
				size="xs"
				value="list"
				bind:group={$listSettings['displayMode']}
			>
				<Icon id="formatListExpanded" />
			</RadioButton>
			<RadioButton
				checkedClass="border-2 border-gray-300"
				color="alternative"
				size="xs"
				value="compactList"
				bind:group={$listSettings['displayMode']}
			>
				<Icon id="formatListCompact" />
			</RadioButton>
		</div>
	{/snippet}
</PageTitle>

{#snippet flagValueKbd(flag: PersistentWithKey<PersistentFlag>)}
	<Kbd
		class={clsx('bg-primary-50 inline-flex decoration-dashed underline-offset-4', {
			underline: 'valueExists' in flag && !flag.valueExists,
			'cursor-pointer': hasPermissionSetValue
		})}
		ondblclick={() => {
			if (hasPermissionSetValue) modifyFlagValue(flag.key);
		}}
	>
		{flagValueToString(flag).value}
	</Kbd>
{/snippet}

<PageContainer>
	{#key data}
		{#if data.flagCount > 0}
			{#each data.flagGroups as [groupName, flags]}
				{#if !$groupFilter || (groupName || GROUP_GENERAL_NAME).startsWith($groupFilter)}
					<h5
						style={$listSettings['displayMode'] === 'grid'
							? ''
							: `margin-left: ${groupNameLevel(groupName) * GROUP_INDENT_PX + GROUP_TITLE_INDENT_PX}px`}
						class="col-span-3 flex items-center gap-2 overflow-auto py-4 text-lg font-normal text-gray-700"
					>
						<div>
							{groupNameDecorator(groupName || GROUP_GENERAL_NAME)}
							{#if flags.length > 0}
								<span class="text-sm">({flags.length})</span>
							{/if}
						</div>
						{#if groupName}
							{#if hasPermissionCreate}
								<Icon
									id="add"
									class="dots-menu inline-flex cursor-pointer"
									color="gray"
									onclick={() => addFlag(groupName)}
									size={24}
								/>
								<Tooltip placement="bottom-start" type="light">Add flag to this group</Tooltip>
							{/if}
						{/if}
						<Icon id="dots" class="dots-menu inline-flex cursor-pointer" color="gray" size={24} />
						<Dropdown simple transitionParams={{ duration: 0 }}>
							{#if hasPermissionCreate}
								<DropdownItem class="font-semibold" href="#" onclick={() => addFlag(groupName)}
									>Add flag</DropdownItem
								>
							{/if}
							{#if hasPermissionCreate}
								<DropdownDivider />
								<DropdownItem href="#" onclick={() => renameGroup(groupName)}
									>Rename group</DropdownItem
								>
								<DropdownItem href="#" onclick={() => deleteGroup(groupName)}
									>Delete group</DropdownItem
								>
								<DropdownDivider />
							{/if}
							<DropdownItem href="#" onclick={() => showModalFlagGroupUrl(groupName)}
								>Show URLs</DropdownItem
							>
						</Dropdown>
					</h5>
					<div
						class={clsx(
							'mb-8 ml-4 grid gap-4',
							$listSettings['displayMode'] === 'grid' ? 'grid-cols-3' : 'grid-cols-1'
						)}
					>
						{#each flags as flag (flag.key)}
							{#if !$searchFilter || flag.flagName
									.toLowerCase()
									.includes($searchFilter.toLowerCase())}
								<Card
									style={$listSettings['displayMode'] === 'grid'
										? ''
										: `margin-left: ${groupNameLevel(groupName) * GROUP_INDENT_PX}px`}
									class={clsx(
										$listSettings['displayMode'] === 'grid'
											? ''
											: `!w-auto max-w-[calc(100%-${groupNameLevel(groupName) * GROUP_INDENT_PX}px)]`,
										'bg-gray-50 p-4 py-2 hover:bg-gray-100'
									)}
								>
									<div class="flex flex-row items-center justify-between">
										<div class="row flex items-center gap-2">
											<div
												style={`min-width: ${clamp(longestFlagNameLength, 5, 30) * 12}px`}
												class="flex items-center"
											>
												<!-- svelte-ignore a11y_no_static_element_interactions -->
												<div
													class={clsx(
														'trimmed-content inline-flex items-center gap-2 font-semibold text-gray-700',
														{
															'cursor-pointer': hasPermissionEditSchema
														}
													)}
													ondblclick={() => {
														if (hasPermissionEditSchema) modifyFlagSchema(flag.key);
													}}
												>
													<Icon id={flag.icon} class="mr-1 inline-flex" color="primary" />
													<Tooltip placement="bottom-start" type="light"
														>{flag.typeToDisplay}</Tooltip
													>
													{flag.flagName}
												</div>
											</div>
											{#if $listSettings['displayMode'] === 'compactList'}
												{@render flagValueKbd(flag)}
											{/if}
										</div>
										<Icon
											id="dotsVertical"
											class="dots-menu inline-flex cursor-pointer"
											color="gray"
											size={24}
										/>
										<Dropdown simple transitionParams={{ duration: 0 }}>
											{#if hasPermissionSetValue}
												<DropdownItem
													class="font-semibold"
													href="#"
													onclick={() => modifyFlagValue(flag.key)}>Set value</DropdownItem
												>
											{/if}
											{#if hasPermissionEditSchema}
												<DropdownItem href="#" onclick={() => modifyFlagSchema(flag.key)}
													>Modify schema</DropdownItem
												>
												<DropdownDivider />
											{/if}
											{#if hasPermissionCreate}
												<DropdownItem href="#" onclick={() => renameFlag(flag.key)}
													>Rename flag</DropdownItem
												>
												<DropdownItem
													href="#"
													onclick={() => deleteFlag(flag.key, flag.typeToDisplay)}
													>Delete flag</DropdownItem
												>
												<DropdownDivider />
											{/if}
											<DropdownItem href="#" onclick={() => showModalFlagUrl(flag.key)}
												>Show URLs</DropdownItem
											>
										</Dropdown>
									</div>
									{#if $listSettings['displayMode'] !== 'compactList'}
										<hr class="-mx-4 my-1 text-gray-200" />
										<div class="mt-2 flex flex-row items-center justify-between">
											{@render flagValueKbd(flag)}
										</div>
										<p class="mt-2 text-justify text-xs font-light text-gray-500">
											{flag.description}
										</p>
									{/if}
								</Card>
							{/if}
						{/each}
					</div>
				{/if}
			{/each}
		{:else}
			<EmptyListBanner icon="flag" title="There are no flags yet" />
		{/if}
	{/key}
</PageContainer>
