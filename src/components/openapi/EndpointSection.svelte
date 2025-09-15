<script lang="ts">
	import { Badge, Button, Card, Heading } from 'flowbite-svelte';

	import AsyncButton from '$components/AsyncButton.svelte';
	import Icon from '$components/Icon.svelte';
	import { showModalError } from '$components/modal/ModalError.svelte';
	import type {
		ApiResponse,
		EndpointInfo,
		FormValues,
		HttpMethod,
		OpenApiSchema
	} from '$types/OpenApi';

	import RequestForm from './RequestForm.svelte';
	import ResponseViewer from './ResponseViewer.svelte';

	interface Properties {
		endpoint: EndpointInfo;
		authToken: string;
		baseUrl: string;
		schemas: Record<string, OpenApiSchema>;
		class?: string;
	}

	const { endpoint, authToken, baseUrl, schemas, class: aClass = '' }: Properties = $props();

	let expanded = $state(false);
	let response: ApiResponse | undefined = $state();
	let formValues: FormValues = $state({
		pathParams: {},
		queryParams: {},
		headerParams: {},
		body: ''
	});

	const getMethodColor = (method: HttpMethod) => {
		const colors = {
			GET: 'blue' as const,
			POST: 'green' as const,
			PUT: 'yellow' as const,
			PATCH: 'orange' as const,
			DELETE: 'red' as const,
			HEAD: 'gray' as const,
			OPTIONS: 'purple' as const
		};
		return colors[method] || 'gray';
	};

	const getMethodIcon = (method: HttpMethod) => {
		const icons = {
			GET: 'arrowDown' as const,
			POST: 'add' as const,
			PUT: 'edit' as const,
			PATCH: 'changingValue' as const,
			DELETE: 'delete' as const,
			HEAD: 'information' as const,
			OPTIONS: 'dots' as const
		};
		return icons[method] || 'question';
	};

	const buildRequestUrl = (values: FormValues): string => {
		let url = baseUrl + endpoint.path;

		// Replace path parameters
		for (const [key, value] of Object.entries(values.pathParams))
			url = url.replace(`{${key}}`, encodeURIComponent(value));

		// Add query parameters
		const queryString = Object.entries(values.queryParams)
			.filter(([, value]) => value.trim() !== '')
			.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
			.join('&');

		if (queryString) url += `?${queryString}`;

		return url;
	};

	const executeRequest = async () => {
		try {
			const url = buildRequestUrl(formValues);
			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				...formValues.headerParams
			};

			if (authToken && endpoint.operation.security?.length)
				headers['Authorization'] = `Bearer ${authToken}`;

			const options: globalThis.RequestInit = {
				method: endpoint.method,
				headers
			};

			if (endpoint.requestBody && ['POST', 'PUT', 'PATCH'].includes(endpoint.method))
				options.body = formValues.body;

			const startTime = Date.now();
			const fetchResponse = await fetch(url, options);
			const endTime = Date.now();

			const responseHeaders: Record<string, string> = {};
			for (const [key, value] of fetchResponse.headers.entries()) {
				responseHeaders[key] = value;
			}

			const responseText = await fetchResponse.text();
			let responseJson: unknown;

			try {
				responseJson = JSON.parse(responseText);
			} catch {
				// Response is not JSON
			}

			response = {
				status: fetchResponse.status,
				statusText: fetchResponse.statusText,
				headers: responseHeaders,
				body: responseText,
				json: responseJson
			};

			// Add timing info
			response.timing = endTime - startTime;
		} catch (error) {
			await showModalError(error);
		}
	};

	const resetResponse = () => {
		response = undefined;
	};

	const hasRequiredAuth = (endpoint.operation.security?.length ?? 0) > 0;
</script>

<Card class={`endpoint-section w-full ${aClass}`} size="xl">
	<div class="flex items-center justify-between p-4">
		<div class="flex min-w-0 flex-1 items-center gap-3">
			<Badge class="method-badge flex-shrink-0 font-mono" color={getMethodColor(endpoint.method)}>
				{endpoint.method}
			</Badge>
			<span class="truncate font-mono text-sm">{endpoint.path}</span>
			{#if hasRequiredAuth}
				<Icon id="password" class="flex-shrink-0 text-yellow-600" size={16} />
			{/if}
		</div>
		<Button
			class="flex-shrink-0"
			color="alternative"
			onclick={() => {
				expanded = !expanded;
				if (!expanded) resetResponse();
			}}
			size="sm"
		>
			<Icon id={expanded ? 'arrowUp' : 'arrowDown'} />
		</Button>
	</div>

	<div class="px-4 pb-4">
		<Heading class="text-base font-semibold" tag="h4">
			{endpoint.operation.summary}
		</Heading>
		{#if endpoint.operation.description}
			<p class="mt-2 text-sm leading-relaxed text-gray-600">
				{endpoint.operation.description}
			</p>
		{/if}
	</div>

	{#if expanded}
		<div class="border-t bg-gray-50">
			<div class="space-y-6 p-6">
				<!-- Authentication Warning -->
				{#if hasRequiredAuth && !authToken}
					<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
						<div class="flex items-center gap-2">
							<Icon id="warning" class="text-yellow-600" />
							<span class="text-sm font-medium text-yellow-800">Authentication Required</span>
						</div>
						<p class="mt-2 text-sm text-yellow-700">
							This endpoint requires authentication. Please provide a JWT token above.
						</p>
					</div>
				{/if}

				<!-- Request Form -->
				<RequestForm {endpoint} {schemas} bind:values={formValues} />

				<!-- Try It Button -->
				<div class="flex items-center gap-3">
					<AsyncButton action={executeRequest} color="primary" size="lg">
						<Icon id={getMethodIcon(endpoint.method)} align="left" />
						Execute Request
					</AsyncButton>
					{#if response}
						<Button color="alternative" onclick={resetResponse} size="lg">
							<Icon id="close" align="left" />
							Clear Response
						</Button>
					{/if}
				</div>

				<!-- Response Viewer -->
				{#if response}
					<ResponseViewer {response} />
				{/if}
			</div>
		</div>
	{/if}
</Card>

<style>
	:global(.endpoint-section .method-badge) {
		min-width: 4rem;
		text-align: center;
	}
</style>
