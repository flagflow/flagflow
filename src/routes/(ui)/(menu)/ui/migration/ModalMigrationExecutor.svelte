<script lang="ts" module>
	import ModalMigrationExecutor from './ModalMigrationExecutor.svelte';

	export const showModalMigrationExecutor = async (summary: MigrationSummary) => {
		try {
			return modalHandler.show({ component: ModalMigrationExecutor, props: { summary } });
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

<script lang="ts">
	import { Button, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import { showModalError } from '$components/modal/ModalError.svelte';
	import { modalHandler } from '$lib/modals';
	import type { MigrationSummary } from '$types/Migration';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	interface Properties {
		summary: MigrationSummary;
	}
	const { summary }: Properties = $props();
</script>

<Modal
	closedby="none"
	dismissable={false}
	oncancel={() => dispatch('resolve', { isOk: false })}
	open
	outsideclose={false}
	size="lg"
>
	{#snippet header()}
		<div class="flex justify-between gap-4">Execute {summary.steps.length} migrations</div>
	{/snippet}

	<div class="mt-4 flex justify-center space-x-4">
		<Button class="w-20" onclick={() => {}}>Execute</Button>
		<Button class="w-20" color="alternative" onclick={() => dispatch('resolve', { isOk: false })}
			>Cancel</Button
		>
	</div>
</Modal>
