<script lang="ts">
	import clsx from 'clsx';
	import { Badge, ButtonGroup, Card, Input, InputAddon, Toggle } from 'flowbite-svelte';

	import { goto } from '$app/navigation';
	import HtmlTitle from '$components/HtmlTitle.svelte';
	import Icon from '$components/Icon.svelte';
	import { showModalConfirmation } from '$components/modal/ModalConfirmation.svelte';
	import { showModalError } from '$components/modal/ModalError.svelte';
	import PageContainer from '$components/PageContainer.svelte';
	import { invalidatePage } from '$lib/navigationEx';
	import { rpcClient } from '$lib/rpc/client';

	import type { PageProps as PageProperties } from './$types';

	let { data }: PageProperties = $props();
	let searchValue = $state('');

	const toggleKillSwitch = async (flagKey: string, recentValue: boolean, flagName: string) => {
		try {
			// If turning OFF, require confirmation
			if (!recentValue) {
				const result = await showModalConfirmation(
					`Turn OFF kill switch **${flagName}**? This will disable the kill switch functionality. Are you sure you want to proceed?`,
					'Disable'
				);
				if (!result.isOk) return;
			}

			await rpcClient.flag.updateKillSwitch.mutate({
				key: flagKey,
				value: recentValue
			});

			await invalidatePage();
		} catch (error) {
			await showModalError(error);
		}
	};

	const handleSearchKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && searchValue.trim()) {
			goto(`/ui/flags?search=${encodeURIComponent(searchValue.trim())}`);
		}
	};
</script>

<HtmlTitle title="Dashboard" />

<PageContainer>
	<!-- Quick Search -->
	<div class="mb-8">
		<h2 class="mb-4 text-xl font-semibold text-gray-900">
			Quick Search
			<span class="ml-2 text-sm font-normal text-gray-600"
				>Find flags by name or group with Enter</span
			>
		</h2>
		<ButtonGroup class="flex w-full">
			<InputAddon><Icon id="search" /></InputAddon>
			<Input
				id="search-input"
				onkeydown={handleSearchKeydown}
				placeholder="Search flags..."
				size="md"
				type="search"
				bind:value={searchValue}
			/>
		</ButtonGroup>
	</div>

	<!-- KillSwitch Panel -->
	<div class="mb-8">
		<div class="mb-4 flex items-center gap-2">
			<Icon id="killswitch" class="text-red-600" size={24} />
			<h2 class="text-xl font-semibold text-gray-900">Kill Switches</h2>
			<Badge color="red" large>{data.killSwitchCount}</Badge>
		</div>

		{#if data.killSwitchFlags.length > 0}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each data.killSwitchFlags as flag (flag.key)}
					{#if flag.type === 'BOOLEAN'}
						{@const flagValue = flag.valueExists ? flag.value : flag.defaultValue}
						<Card class="p-6" size="lg">
							<div class="flex flex-col">
								<div class="items-top mb-3 flex justify-between">
									<div class="flex-1">
										<h3 class="mb-1 text-lg font-semibold text-gray-900">
											{flag.flagName}
										</h3>
										<p class="text-md mb-2 text-gray-600">{flag.flagGroup}</p>
									</div>
									<div class="flex flex-col gap-1">
										<div class="ml-4">
											<Toggle
												checked={flagValue}
												color="green"
												onchange={() => toggleKillSwitch(flag.key, !flagValue, flag.flagName)}
												size="large"
											/>
										</div>
										<div class="text-center">
											<span
												class={clsx('text-xl font-semibold', {
													'text-green-700': flagValue,
													'text-red-700': !flagValue
												})}
											>
												{flagValue ? 'ON' : 'OFF'}
											</span>
										</div>
									</div>
								</div>
								{#if flag.description}
									<p class="mb-2 text-xs text-gray-600">{flag.description}</p>
								{/if}
							</div>
						</Card>
					{/if}
				{/each}
			</div>
		{:else}
			<Card class="p-8 text-center">
				<Icon id="killswitch" class="mx-auto mb-4 text-gray-400" size={48} />
				<h3 class="mb-2 text-lg font-medium text-gray-900">No Kill Switches</h3>
				<p class="text-gray-600">No boolean flags are configured as kill switches yet.</p>
			</Card>
		{/if}
	</div>

	<!-- System Overview -->
	<div>
		<h2 class="mb-4 text-xl font-semibold text-gray-900">System Overview</h2>
		<div class="grid gap-4 md:grid-cols-3">
			<Card class="p-6" size="lg">
				<a href="/ui/flags">
					<div class="flex items-center gap-3">
						<Icon id="flag" class="text-blue-600" size={32} />
						<div>
							<p class="text-2xl font-bold text-gray-900">{data.totalFlagsCount}</p>
							<p class="text-sm text-gray-600">Total Flags</p>
						</div>
					</div>
				</a>
			</Card>
			<Card class="p-6" size="lg">
				<div class="flex items-center gap-3">
					<Icon id="killswitch" class="text-red-600" size={32} />
					<div>
						<p class="text-2xl font-bold text-gray-900">{data.killSwitchCount}</p>
						<p class="text-sm text-gray-600">Kill Switches</p>
					</div>
				</div>
			</Card>
			<Card class="p-6" size="lg">
				<a href="/ui/flags/graph">
					<div class="flex items-center gap-3">
						<Icon id="formatListExpanded" class="text-green-600" size={32} />
						<div>
							<p class="text-2xl font-bold text-gray-900">{data.totalGroupsCount}</p>
							<p class="text-sm text-gray-600">Total Groups</p>
						</div>
					</div>
				</a>
			</Card>
		</div>
	</div>
</PageContainer>
