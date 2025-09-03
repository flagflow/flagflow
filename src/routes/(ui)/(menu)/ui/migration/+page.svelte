<script lang="ts">
	import { Badge, Button, Card } from 'flowbite-svelte';

	import { resolve } from '$app/paths';
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
		fileInput.selectFile(async (filename: string, fileContent: string | undefined) => {
			try {
				if (!fileContent) return;

				let jsonData;
				try {
					jsonData = JSON.parse(fileContent);
				} catch {
					await showModalError('Invalid JSON format');
					return;
				}

				const migration = MigrationFile.parse(jsonData);
				const summary: MigrationSummary = await rpcClient.migration.prepareFromFile.query({
					mode,
					migration
				});
				await showModalMigrationExecutor(mode, data.environmentContext.name, summary);
			} catch (error) {
				await showModalError(error);
			}
		});

	const fetchMigrationFromUrl = async () => {
		try {
			const summary: MigrationSummary = await rpcClient.migration.prepareFromRemoteUrl.query();
			await showModalMigrationExecutor('migration', data.environmentContext.name, summary);
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
			<div class="mb-4 flex flex-col items-center text-center">
				<a href={resolve('/migration/export', {})}>
					<Icon
						id="download"
						class="text-primary-600 hover:text-primary-700 mb-4 cursor-pointer"
						size={64}
					/>
				</a>
				<h5 class="mb-2 text-xl font-bold">Export to file</h5>
			</div>
			<p class="mb-3 font-normal text-gray-700">
				Download the complete flag schema of this environment, which can be imported into this
				instance (for restore) or another instance (for migration) of FlagFlow.
			</p>
			<Button class="w-full" color="primary" href="/migration/export">
				Export
				<Icon id="download" align="right" />
			</Button>
		</Card>
	</div>

	<hr class="my-8 text-gray-200" />

	<div class="grid gap-8 md:grid-cols-2">
		<Card class="p-6" size="lg">
			<div class="mb-4 flex flex-col items-center text-center">
				<Icon
					id="restore"
					class="text-primary-600 hover:text-primary-700 mb-4 cursor-pointer"
					onclick={() => uploadFile('restore')}
					size={64}
				/>
				<h5 class="mb-2 text-xl font-bold">Restore from file</h5>
			</div>
			<p class="mb-3 font-normal text-gray-700">
				Upload a previously exported <span class="font-semibold">backup</span> file to restore the
				flag schema and values. The file must contain exported data
				<span class="font-semibold">from this environment</span>.
			</p>
			<Button class="w-full" color="alternative" onclick={() => uploadFile('restore')}>
				Import
				<Icon id="upload" align="right" />
			</Button>
		</Card>
		<Card class="p-6" size="lg">
			<div class="mb-4 flex flex-col items-center text-center">
				<Icon
					id="migration"
					class="text-primary-600 hover:text-primary-700 mb-4 cursor-pointer"
					onclick={() => uploadFile('migration')}
					size={64}
				/>
				<h5 class="mb-2 text-xl font-bold">Migration from file</h5>
			</div>
			<p class="mb-3 font-normal text-gray-700">
				Upload a previously exported <span class="font-semibold">migration</span> file to migrate
				the flag schema and optionally flag values. The file must contain exported data
				<span class="font-semibold">from another environment</span>.
			</p>
			<Button class="w-full" color="alternative" onclick={() => uploadFile('migration')}>
				Import
				<Icon id="upload" align="right" />
			</Button>
		</Card>
		{#if data.migration.sourceUrl}
			<Card class="p-6" size="lg">
				<div class="mb-4 flex flex-col items-center text-center">
					<Icon
						id="uploadNetwork"
						class="text-primary-600 hover:text-primary-700 mb-4 cursor-pointer"
						onclick={() => fetchMigrationFromUrl()}
						size={64}
					/>
					<h5 class="mb-2 text-xl font-bold">
						Migration from remote
						<Badge class="ml-2" color="secondary">{data.migration.sourceEnvironment}</Badge>
					</h5>
				</div>
				<p class="mb-3 font-normal text-gray-700">
					Migrate the flag schema and optionally flag values from a remote FlagFlow instance using a
					predefined URL. The remote instance must export data <span class="font-semibold"
						>for another environment</span
					>.
				</p>
				<Button class="w-full" color="alternative" onclick={() => fetchMigrationFromUrl()}>
					Execute
					<Icon id="uploadNetwork" align="right" />
				</Button>
			</Card>
		{/if}
	</div>
</PageContainer>
