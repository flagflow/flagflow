<script lang="ts">
	import { Input, Label, Textarea } from 'flowbite-svelte';

	import Icon from '$components/Icon.svelte';
	import type { EndpointInfo, FormValues, OpenApiParameter, OpenApiSchema } from '$types/OpenApi';

	interface Properties {
		endpoint: EndpointInfo;
		schemas: Record<string, OpenApiSchema>;
		values: FormValues;
		class?: string;
	}

	const { endpoint, schemas, values = $bindable(), class: aClass = '' }: Properties = $props();

	const resolveSchema = (schema: OpenApiSchema): OpenApiSchema => {
		if (schema.$ref) {
			const referencePath = schema.$ref.replace('#/components/schemas/', '');
			return schemas[referencePath] || schema;
		}
		return schema;
	};

	const getParameterType = (parameter: OpenApiParameter): string => {
		const schema = resolveSchema(parameter.schema);
		return schema.type || 'string';
	};

	const getParameterExample = (parameter: OpenApiParameter): string => {
		const schema = resolveSchema(parameter.schema);

		if (schema.enum && schema.enum.length > 0) return schema.enum[0];

		switch (schema.type) {
			case 'boolean':
				return 'true';
			case 'integer':
			case 'number':
				return schema.minimum?.toString() || '0';
			case 'string':
				if (schema.format === 'date') return '2023-01-01';
				if (schema.format === 'date-time') return '2023-01-01T00:00:00Z';
				return parameter.name === 'id' || parameter.name.endsWith('Id') ? '12345' : 'example';
			default:
				return '';
		}
	};

	const getRequestBodyExample = (): string => {
		if (!endpoint.requestBody?.content['application/json']) return '{}';

		const schema = resolveSchema(endpoint.requestBody.content['application/json'].schema);
		return generateSchemaExample(schema);
	};

	const generateSchemaExample = (schema: OpenApiSchema): string => {
		const resolved = resolveSchema(schema);

		if (resolved.type === 'object' && resolved.properties) {
			const object: Record<string, unknown> = {};

			for (const [propertyName, propertySchema] of Object.entries(resolved.properties)) {
				const resolvedProperty = resolveSchema(propertySchema);

				switch (resolvedProperty.type) {
					case 'string':
						if (propertyName.toLowerCase().includes('password'))
							object[propertyName] = 'password123';
						else if (propertyName.toLowerCase().includes('email'))
							object[propertyName] = 'user@example.com';
						else if (propertyName.toLowerCase().includes('name'))
							object[propertyName] = 'Example Name';
						else if (resolvedProperty.enum) object[propertyName] = resolvedProperty.enum[0];
						else object[propertyName] = 'string';
						break;
					case 'boolean':
						object[propertyName] = false;
						break;
					case 'integer':
					case 'number':
						object[propertyName] = resolvedProperty.minimum || 0;
						break;
					case 'array':
						if (resolvedProperty.items?.enum)
							object[propertyName] = [resolvedProperty.items.enum[0]];
						else if (resolvedProperty.items?.type === 'string')
							object[propertyName] = ['item1', 'item2'];
						else object[propertyName] = [];
						break;
					default:
						object[propertyName] = undefined;
				}
			}

			return JSON.stringify(object, undefined, 2);
		}

		return '{}';
	};

	// Initialize form values with examples
	const initializeFormValues = () => {
		// Initialize path parameters
		for (const parameter of endpoint.pathParams)
			if (!values.pathParams[parameter.name])
				values.pathParams[parameter.name] = getParameterExample(parameter);

		// Initialize query parameters
		for (const parameter of endpoint.queryParams)
			if (!values.queryParams[parameter.name])
				values.queryParams[parameter.name] = parameter.required
					? getParameterExample(parameter)
					: '';

		// Initialize header parameters
		for (const parameter of endpoint.headerParams)
			if (!values.headerParams[parameter.name])
				values.headerParams[parameter.name] = parameter.required
					? getParameterExample(parameter)
					: '';

		// Initialize request body
		if (endpoint.requestBody && !values.body) values.body = getRequestBodyExample();
	};

	// Initialize on mount
	initializeFormValues();
</script>

<div class={`request-form space-y-4 ${aClass}`}>
	<!-- Path Parameters -->
	{#if endpoint.pathParams.length > 0}
		<div>
			<Label class="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
				<Icon id="formatListBulleted" size={16} />
				Path Parameters
			</Label>
			<div class="space-y-2">
				{#each endpoint.pathParams as parameter}
					<div>
						<Label class="text-xs" for={`path-${parameter.name}`}>
							{parameter.name}
							{#if parameter.required}<span class="text-red-500">*</span>{/if}
						</Label>
						<Input
							id={`path-${parameter.name}`}
							placeholder={parameter.description || `Enter ${parameter.name}`}
							required={parameter.required}
							type={getParameterType(parameter) === 'number' ? 'number' : 'text'}
							bind:value={values.pathParams[parameter.name]}
						/>
						{#if parameter.description}
							<p class="mt-1 text-xs text-gray-500">{parameter.description}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Query Parameters -->
	{#if endpoint.queryParams.length > 0}
		<div>
			<Label class="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
				<Icon id="search" size={16} />
				Query Parameters
			</Label>
			<div class="space-y-2">
				{#each endpoint.queryParams as parameter}
					<div>
						<Label class="text-xs" for={`query-${parameter.name}`}>
							{parameter.name}
							{#if parameter.required}<span class="text-red-500">*</span>{/if}
						</Label>
						<Input
							id={`query-${parameter.name}`}
							placeholder={parameter.description || `Enter ${parameter.name}`}
							required={parameter.required}
							type={getParameterType(parameter) === 'number' ? 'number' : 'text'}
							bind:value={values.queryParams[parameter.name]}
						/>
						{#if parameter.description}
							<p class="mt-1 text-xs text-gray-500">{parameter.description}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Header Parameters -->
	{#if endpoint.headerParams.length > 0}
		<div>
			<Label class="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
				<Icon id="formatListCompact" size={16} />
				Header Parameters
			</Label>
			<div class="space-y-2">
				{#each endpoint.headerParams as parameter}
					<div>
						<Label class="text-xs" for={`header-${parameter.name}`}>
							{parameter.name}
							{#if parameter.required}<span class="text-red-500">*</span>{/if}
						</Label>
						<Input
							id={`header-${parameter.name}`}
							placeholder={parameter.description || `Enter ${parameter.name}`}
							required={parameter.required}
							type="text"
							bind:value={values.headerParams[parameter.name]}
						/>
						{#if parameter.description}
							<p class="mt-1 text-xs text-gray-500">{parameter.description}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Request Body -->
	{#if endpoint.requestBody}
		<div>
			<Label
				class="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
				for="request-body"
			>
				<Icon id="object" size={16} />
				Request Body
				{#if endpoint.requestBody.required}<span class="text-red-500">*</span>{/if}
			</Label>
			<Textarea
				id="request-body"
				class="font-mono text-sm"
				placeholder="Enter JSON request body"
				required={endpoint.requestBody.required}
				rows={8}
				bind:value={values.body}
			/>
			{#if endpoint.requestBody.description}
				<p class="mt-1 text-xs text-gray-500">{endpoint.requestBody.description}</p>
			{/if}
		</div>
	{/if}
</div>
