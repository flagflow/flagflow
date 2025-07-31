<script lang="ts">
	import { Button, Kbd, RadioButton } from 'flowbite-svelte';

	import CopyButton from '$components/CopyButton.svelte';
	import Icon from '$components/icon/Icon.svelte';
	import PageContainer from '$components/PageContainer.svelte';
	import PageTitle from '$components/PageTitle.svelte';

	import type { PageProps as PageProperties } from './$types';

	let { data }: PageProperties = $props();

	const formats = { 'JSON format (default)': '', 'ENV format': 'env' };
	let format = $state('');

	const groupUrls: Record<string, string> = $derived({
		...Object.fromEntries(
			data.flagGroups.map((flagGroup) => [
				`${flagGroup || 'ALL'}`,
				`/flags${flagGroup ? '/' + flagGroup : ''}${format ? '?format=' + format : ''}`
			])
		)
	});

	const hashlUrls: Record<string, string> = $derived({
		Hash: `/type/hash${format ? '?format=' + format : ''}`
	});

	const toolUrls: Record<string, string> = $derived({
		'TS types and mapping': '/type/typescript',
		'TS types and mapping (download)': '/type/typescript?download',
		'ZOD types': '/type/zod',
		'ZOD types (download)': '/type/zod?download'
	});

	const urls: Record<string, Record<string, string>> = $derived({
		'Direct access of flag groups': groupUrls,
		Hash: hashlUrls,
		Types: format ? {} : toolUrls
	});
</script>

<PageTitle hr title="Flag URLs">
	{#snippet rightToolbar()}
		<div class="flex flex-row gap-2">
			{#each Object.entries(formats) as [label, value]}
				<RadioButton
					class="text-sm"
					checkedClass="bg-primary-700 text-white"
					outline
					size="xs"
					{value}
					bind:group={format}
				>
					{label}
				</RadioButton>
			{/each}
		</div>
	{/snippet}
</PageTitle>

<PageContainer>
	<div class="grid grid-cols-3 gap-4">
		{#each Object.entries(urls) as [title, urlMap]}
			<div class="text-md col-span-3 mt-4 font-semibold">{title}</div>
			{#each Object.entries(urlMap) as [key, url]}
				<div class="ml-4 inline-flex">{key}</div>
				<Kbd class="text-md">{url}</Kbd>
				<div>
					<CopyButton class="ml-2" color="alternative" data={url} />
					<Button color="alternative" href={url} rel="noopener noreferrer" target="_blank"
						><Icon id="externalLink" size={16} /></Button
					>
				</div>
			{/each}
		{/each}
	</div>
</PageContainer>
