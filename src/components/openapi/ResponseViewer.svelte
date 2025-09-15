<script lang="ts">
	import { Badge, Card, Heading } from 'flowbite-svelte';

	import CopyButton from '$components/CopyButton.svelte';
	import Icon from '$components/Icon.svelte';
	import type { ApiResponse } from '$types/OpenApi';

	interface Properties {
		response: ApiResponse;
		class?: string;
	}

	const { response, class: aClass = '' }: Properties = $props();

	const getStatusColor = (status: number) => {
		if (status >= 200 && status < 300) return 'green';
		if (status >= 300 && status < 400) return 'blue';
		if (status >= 400 && status < 500) return 'red';
		if (status >= 500) return 'red';
		return 'gray';
	};

	const getStatusIcon = (status: number) => {
		if (status >= 200 && status < 300) return 'check';
		if (status >= 300 && status < 400) return 'arrowRight';
		if (status >= 400 && status < 500) return 'warning';
		if (status >= 500) return 'error';
		return 'information';
	};

	const formatJson = (object: unknown): string => {
		try {
			return JSON.stringify(object, undefined, 2);
		} catch {
			return String(object);
		}
	};

	const formatHeaders = (headers: Record<string, string>): string => {
		return Object.entries(headers)
			.map(([key, value]) => `${key}: ${value}`)
			.join('\n');
	};

	const isJsonResponse =
		response.headers['content-type']?.includes('application/json') || response.json !== undefined;
</script>

<Card class={`response-viewer ${aClass}`} size="xl">
	<div class="space-y-6 p-6">
		<div class="flex items-center justify-between">
			<Heading class="flex items-center gap-2 text-base font-semibold" tag="h4">
				<Icon id={getStatusIcon(response.status)} />
				Response
			</Heading>

			<!-- Status and Timing -->
			<div class="flex items-center gap-3">
				<Badge class="flex items-center gap-1" color={getStatusColor(response.status)}>
					<Icon id={getStatusIcon(response.status)} size={14} />
					{response.status}
					{response.statusText}
				</Badge>

				{#if response.timing}
					<Badge class="flex items-center gap-1" color="blue">
						<Icon id="online" size={14} />
						{response.timing}ms
					</Badge>
				{/if}
			</div>
		</div>

		<!-- Response Body (Primary) -->
		<div>
			<div class="mb-3 flex items-center justify-between">
				<span class="flex items-center gap-2 text-lg font-medium text-gray-800">
					<Icon id={isJsonResponse ? 'object' : 'string'} size={18} />
					Response Body
					{#if response.json}
						<Badge color="blue" size="small">JSON</Badge>
					{:else}
						<Badge color="gray" size="small">TEXT</Badge>
					{/if}
				</span>
				<CopyButton data={response.body} />
			</div>

			{#if response.body}
				<div class="max-h-96 overflow-auto rounded-lg border bg-gray-50 p-5 font-mono text-sm">
					{#if response.json}
						<pre class="whitespace-pre-wrap text-gray-800">{formatJson(response.json)}</pre>
					{:else}
						<div class="whitespace-pre-wrap text-gray-800">{response.body}</div>
					{/if}
				</div>
			{:else}
				<div class="rounded-lg border bg-gray-50 p-5 text-center text-gray-500 italic">
					No response body
				</div>
			{/if}
		</div>

		<!-- Response Headers (Secondary) -->
		{#if Object.keys(response.headers).length > 0}
			<details class="group">
				<summary
					class="flex cursor-pointer items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
				>
					<span class="flex items-center gap-2">
						<Icon id="formatListCompact" size={16} />
						Response Headers ({Object.keys(response.headers).length})
					</span>
					<div class="flex items-center gap-2">
						<CopyButton data={formatHeaders(response.headers)} />
						<Icon id="arrowDown" class="transition-transform group-open:rotate-180" size={16} />
					</div>
				</summary>
				<div
					class="mt-3 max-h-32 overflow-y-auto rounded-lg border bg-gray-50 p-4 font-mono text-sm"
				>
					{#each Object.entries(response.headers) as [key, value]}
						<div class="py-1 text-gray-700">
							<span class="font-semibold text-blue-600">{key}:</span>
							<span class="ml-2">{value}</span>
						</div>
					{/each}
				</div>
			</details>
		{/if}

		<!-- Response Summary -->
		<div class="border-t pt-4 text-xs text-gray-500">
			<span>Content Length: {response.body.length} bytes</span>
		</div>
	</div>
</Card>
