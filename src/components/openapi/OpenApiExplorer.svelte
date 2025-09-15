<script lang="ts">
	import { Badge, Card, Label, Spinner } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	import FormInput from '$components/form/FormInput.svelte';
	import Icon from '$components/Icon.svelte';
	import { showModalError } from '$components/modal/ModalError.svelte';
	import type {
		EndpointInfo,
		HttpMethod,
		OpenApiOperation,
		OpenApiParameter,
		OpenApiPathItem,
		OpenApiSpec
	} from '$types/OpenApi';

	import EndpointSection from './EndpointSection.svelte';

	interface Properties {
		class?: string;
		apiUrl?: string;
		sessionId?: string | undefined;
	}

	const { class: aClass = '', apiUrl = '/api', sessionId }: Properties = $props();

	let spec: OpenApiSpec | undefined = $state();
	let loading = $state(true);
	let authToken = $state('');
	let groupedEndpoints: Record<string, EndpointInfo[]> = $state({});

	const copySessionIdToInput = () => {
		if (sessionId) {
			authToken = sessionId;
		}
	};

	const loadSpec = async () => {
		try {
			loading = true;
			const response = await fetch(`${apiUrl}/`);
			if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

			spec = await response.json();
			if (spec) parseEndpoints();
		} catch (error) {
			await showModalError(error);
		} finally {
			loading = false;
		}
	};

	const parseEndpoints = () => {
		if (!spec) return;

		const endpoints: EndpointInfo[] = [];

		for (const [path, pathItem] of Object.entries(spec.paths)) {
			for (const [method, operation] of Object.entries(pathItem as OpenApiPathItem)) {
				if (operation && typeof operation === 'object') {
					const httpMethod = method.toUpperCase() as HttpMethod;
					const parameters = operation.parameters || [];

					endpoints.push({
						path,
						method: httpMethod,
						operation: operation as OpenApiOperation,
						pathParams: parameters.filter((p: OpenApiParameter) => p.in === 'path'),
						queryParams: parameters.filter((p: OpenApiParameter) => p.in === 'query'),
						headerParams: parameters.filter((p: OpenApiParameter) => p.in === 'header'),
						requestBody: operation.requestBody
					});
				}
			}
		}

		// Group endpoints by tags
		const grouped: Record<string, EndpointInfo[]> = {};

		for (const endpoint of endpoints) {
			const tags = endpoint.operation.tags || ['Default'];

			for (const tag of tags) {
				if (!grouped[tag]) grouped[tag] = [];
				grouped[tag].push(endpoint);
			}
		}

		groupedEndpoints = grouped;
	};

	onMount(() => {
		loadSpec();
	});
</script>

<div class={`openapi-explorer ${aClass}`}>
	{#if loading}
		<div class="flex items-center justify-center p-8">
			<Spinner class="mr-3" size="8" />
			Loading API specification...
		</div>
	{:else if spec}
		<!-- API Header -->
		<Card class="mb-12 w-full" size="xl">
			<div class="p-4">
				<div class="mb-4 flex items-center gap-4">
					<Icon id="api" size={32} />
					<div>
						<h1 class="text-2xl font-bold">{spec.info.title}</h1>
						<p class="text-gray-600">{spec.info.description}</p>
						<Badge class="mt-2">{spec.info.version}</Badge>
					</div>
				</div>

				<!-- Server Info -->
				{#if spec.servers.length > 0}
					<div class="mb-4">
						<Label class="text-sm font-medium text-gray-700">Base URLs:</Label>
						{#each spec.servers as server}
							<div class="mt-1 flex items-center gap-2">
								<Badge color="blue">{server.url}</Badge>
								<span class="text-sm text-gray-500">{server.description}</span>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Authentication -->
				{#if spec.components.securitySchemes}
					<div class="border-t pt-4">
						<FormInput
							id="auth-token"
							class="w-full"
							mandatory
							placeholder="SessionId"
							title="Authentication Token:"
							type="password"
							bind:value={authToken}
						/>
						<p class="mt-1 text-sm text-gray-500">
							Get your token from /api/login
							{#if sessionId}
								or use
								<button
									class="inline-flex cursor-pointer items-center gap-1 rounded px-1 font-mono font-bold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
									onclick={copySessionIdToInput}
									title="Click to copy to input field"
									type="button"
								>
									{sessionId}
									<Icon id="copy" size={12} />
								</button>
							{/if}
						</p>
					</div>
				{/if}
			</div>
		</Card>

		<!-- Endpoints by Tag -->
		{#each Object.entries(groupedEndpoints) as [tag, endpoints]}
			<div class="mb-12">
				<h2 class="mb-6 flex items-center gap-2 text-xl font-semibold">
					<Icon id="formatListBulleted" />
					{tag}
				</h2>

				<div class="space-y-4">
					{#each endpoints as endpoint}
						<EndpointSection
							{authToken}
							baseUrl={spec.servers[0]?.url || '/api'}
							{endpoint}
							schemas={spec.components.schemas}
						/>
					{/each}
				</div>
			</div>
		{/each}
	{:else}
		<div class="p-8 text-center">
			<Icon id="error" class="mb-4 text-red-500" size={48} />
			<h2 class="mb-2 text-xl font-semibold">Failed to load API specification</h2>
			<p class="text-gray-600">Unable to fetch the OpenAPI specification from the server.</p>
		</div>
	{/if}
</div>

<style>
	.openapi-explorer :global(.method-badge) {
		font-family: monospace;
		font-weight: bold;
		font-size: 0.75rem;
	}
</style>
