<script lang="ts">
	import { Badge, Button, Card } from 'flowbite-svelte';

	import Icon from '$components/Icon.svelte';
	import FileInput from '$components/input/FileInput.svelte';
	import { showModalError } from '$components/modal/ModalError.svelte';
	import PageContainer from '$components/PageContainer.svelte';
	import PageTitle from '$components/PageTitle.svelte';
	import { rpcClient } from '$lib/rpc/client';
	import type { MigrationSummary } from '$types/Migration';
	import { MigrationFile } from '$types/Migration';

	import type { PageProps as PageProperties } from './$types';
	import { showModalMigrationExecutor } from './ModalMigrationExecutor.svelte';

	let { data }: PageProperties = $props();
	let fileInput: FileInput;

	const uploadFile = async (mode: 'restore' | 'migration') =>
		fileInput.selectFile(async (filename: string, data: string | undefined) => {
			try {
				if (!data) return;

				let jsonData;
				try {
					jsonData = JSON.parse(data);
				} catch {
					await showModalError('Invalid JSON format');
					return;
				}

				const migration = MigrationFile.parse(jsonData);
				const summary: MigrationSummary = await rpcClient.migration.prepareFromFile.query({
					mode,
					migration
				});
				await showModalMigrationExecutor(summary);
			} catch (error) {
				await showModalError(error);
			}
		});

	const fetchMigrationFromUrl = async () => {
		try {
			const summary: MigrationSummary = await rpcClient.migration.prepareFromRemoteUrl.query();
			await showModalMigrationExecutor(summary);
		} catch (error) {
			await showModalError(error);
		}
	};
</script>

<FileInput bind:this={fileInput} accept="application/json" />

<PageTitle
	description="You can execute backup/restore or migration task between FlagFlow instances"
	title="Migration"
/>

<PageContainer>
	<div class="grid gap-8 md:grid-cols-2">
		<Card class="p-6" size="lg">
			<h5 class="mb-2 text-xl font-bold">Export to file</h5>
			<p class="mb-3 font-normal text-gray-700">
				Download the complete flag schema of this environment, which can be imported into another
				(or this) instance of FlagFlow.
			</p>
			<Button class="w-full" color="primary" href="/migration/export">
				Export
				<Icon id="download" align="right" />
			</Button>
		</Card>
		<Card class="p-6" size="lg">
			<h5 class="mb-2 text-xl font-bold">Restore backup from file</h5>
			<p class="mb-3 font-normal text-gray-700">
				Upload a previously exported file to restore the flag schema and values. The file must
				contains exported data <span class="font-semibold">from this environment</span>.
			</p>
			<Button class="w-full" color="alternative" onclick={() => uploadFile('restore')}>
				Import
				<Icon id="upload" align="right" />
			</Button>
		</Card>
		<Card class="p-6" size="lg">
			<h5 class="mb-2 text-xl font-bold">Migration from file</h5>
			<p class="mb-3 font-normal text-gray-700">
				Upload a previously exported file to migrate the flag schema and optionally flag values. The
				file must contains exported data <span class="font-semibold">from another environment</span
				>.
			</p>
			<Button class="w-full" color="alternative" onclick={() => uploadFile('migration')}>
				Import
				<Icon id="upload" align="right" />
			</Button>
		</Card>
		<Card class="p-6" size="lg">
			<h5 class="mb-2 text-xl font-bold">
				Migration from remote
				<Badge class="ml-2" color="secondary">{data.migration.sourceEnvironment}</Badge>
			</h5>
			<p class="mb-3 font-normal text-gray-700">
				Migrate the flag schema and optionally flag values from a remote FlagFlow instance by
				predefined URL. The remote instance must provide data marked <span class="font-semibold"
					>as another environment</span
				>.
			</p>
			<Button class="w-full" color="alternative" onclick={() => fetchMigrationFromUrl()}>
				Execute
				<Icon id="uploadNetwork" align="right" />
			</Button>
		</Card>
	</div>
</PageContainer>
