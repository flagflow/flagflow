<script lang="ts">
	import { Button, Kbd } from 'flowbite-svelte';

	import CopyButton from '$components/CopyButton.svelte';
	import Icon from '$components/icon/Icon.svelte';
	import PageContainer from '$components/PageContainer.svelte';
	import PageTitle from '$components/PageTitle.svelte';

	import type { PageProps as PageProperties } from './$types';

	let { data }: PageProperties = $props();

	const groupUrls: Record<string, string> = {
		...Object.fromEntries(
			data.flagGroups.map((flagGroup) => [
				`${flagGroup || 'ALL'}`,
				`/flags${flagGroup ? '/' + flagGroup : ''}`
			])
		)
	};

	const toolUrls: Record<string, string> = {
		'TS types and mapping': '/type/typescript?download'
	};

	const urls: Record<string, Record<string, string>> = {
		'Direct access of flag groups': groupUrls,
		'Tool URLs': toolUrls
	};
</script>

<PageTitle hr title="Flag URLs"></PageTitle>

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
