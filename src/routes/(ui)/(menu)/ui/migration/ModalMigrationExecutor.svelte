<script lang="ts" module>
	import ModalMigrationExecutor from './ModalMigrationExecutor.svelte';

	export const showModalMigrationExecutor = async (
		mode: 'restore' | 'migration',
		currentEnvironment: string,
		summary: MigrationSummary
	) => {
		try {
			return modalHandler.show({
				component: ModalMigrationExecutor,
				props: { mode, currentEnvironment, summary }
			});
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

<script lang="ts">
	import { formatDate } from 'date-fns';
	import { A, Button, Kbd, Modal, Toggle } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	import Icon from '$components/Icon.svelte';
	import { showModalError } from '$components/modal/ModalError.svelte';
	import { modalHandler } from '$lib/modals';
	import { rpcClient } from '$lib/rpc/client';
	import type { MigrationStep, MigrationStepMode, MigrationSummary } from '$types/Migration';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	interface Properties {
		mode: 'restore' | 'migration';
		currentEnvironment: string;
		summary: MigrationSummary;
	}
	const { mode, currentEnvironment, summary }: Properties = $props();

	const INDENT_PX = 20;

	const stepModeNames: Record<MigrationStepMode, string> = {
		CREATE_DEFAULTVALUE: 'Create with default value',
		UPDATE_SCHEMA_DEFAULTVALUE: 'Update schema with default value',
		SET_VALUE: 'Set value',
		DELETE: 'Delete'
	};

	const selectedIds: SvelteSet<number> = new SvelteSet(
		summary.steps
			.filter((step) => step.mode !== 'SET_VALUE' || mode === 'restore')
			.map((step) => step.id)
	);

	const addId = (id: number) => {
		if (selectedIds.has(id)) return;
		selectedIds.add(id);
		for (const step of summary.steps.filter((step) => step.id === id)) {
			if (step.dependentId) addId(step.dependentId);
		}
	};
	const removeId = (id: number) => {
		if (!selectedIds.has(id)) return;
		selectedIds.delete(id);
		for (const step of summary.steps.filter((step) => step.dependentId === id)) removeId(step.id);
	};
	const toggleId = (id: number) => {
		if (selectedIds.has(id)) removeId(id);
		else addId(id);
	};

	const appendAllSetValueSteps = () => {
		for (const step of summary.steps) if (step.mode === 'SET_VALUE') addId(step.id);
	};

	const executeSteps = async () => {
		try {
			const selectedSteps = summary.steps.filter((step) => selectedIds.has(step.id));
			if (selectedSteps.length === 0) throw new Error('No steps selected for execution');
			await rpcClient.migration.execute.mutate({ steps: selectedSteps });
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

{#snippet divStep(step: MigrationStep)}
	<div
		style={`padding-left: ${step.indent ? step.indent * INDENT_PX + 'px' : '0px'}`}
		class="flex flex-row gap-4"
	>
		<Toggle class="mt-1" checked={selectedIds.has(step.id)} onchange={() => toggleId(step.id)} />
		<Kbd class="inline">{step.flagKey}</Kbd>
		<span>{stepModeNames[step.mode]}</span>
	</div>
{/snippet}

<Modal
	closedby="none"
	dismissable={false}
	oncancel={() => dispatch('resolve', { isOk: false })}
	open
	outsideclose={false}
	size="md"
>
	{#snippet header()}
		<div class="flex justify-between gap-4">
			Execute {selectedIds.size} of {summary.steps.length}
			{mode === 'migration' ? 'migrations' : 'restore'} steps
		</div>
		<div class="text-right text-sm">
			{summary.environment || 'UNNAMED'}
			<Icon id="arrowRight" class="inline" />
			{currentEnvironment || 'THIS'}
			<br />
			<span class="font-light">
				{formatDate(summary.createdAt.toISOString(), 'yyyy-MM-dd HH:mm')}
			</span>
		</div>
	{/snippet}

	<div class="mb-4 text-sm">
		The steps will be executed in the order they are listed. You can select or deselect steps to
		control which ones will be executed.
		{#if mode === 'migration'}
			<span class="font-semibold">Note:</span> This is a migration task, so the selected steps do
			not contain set value steps, because the values will be set in the target environment. You can
			add set value steps: <A onclick={appendAllSetValueSteps}>click here</A>.
		{/if}
	</div>

	{#each summary.steps as step}
		{@render divStep(step)}
	{/each}

	<div class="mt-4 flex justify-center space-x-4">
		<Button class="w-20" disabled={selectedIds.size === 0} onclick={executeSteps}>Execute</Button>
		<Button class="w-20" color="alternative" onclick={() => dispatch('resolve', { isOk: false })}
			>Cancel</Button
		>
	</div>
</Modal>
