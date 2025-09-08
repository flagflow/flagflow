<script lang="ts">
	import { Badge } from 'flowbite-svelte';

	import Icon from '$components/Icon.svelte';
	import type { OpenApiSchema } from '$types/OpenApi';

	import SchemaDisplay from './SchemaDisplay.svelte';

	interface Properties {
		schema: OpenApiSchema;
		schemas: Record<string, OpenApiSchema>;
		name?: string;
		class?: string;
		depth?: number;
	}

	const { schema, schemas, name, class: aClass = '', depth = 0 }: Properties = $props();

	const MAX_DEPTH = 3; // Prevent infinite recursion

	const resolveSchema = (schema: OpenApiSchema): OpenApiSchema => {
		if (schema.$ref) {
			const referencePath = schema.$ref.replace('#/components/schemas/', '');
			return schemas[referencePath] || schema;
		}
		return schema;
	};

	const getTypeIcon = (type?: string) => {
		switch (type) {
			case 'string':
				return 'string';
			case 'number':
			case 'integer':
				return 'integer';
			case 'boolean':
				return 'boolean';
			case 'array':
				return 'formatListBulleted';
			case 'object':
				return 'object';
			default:
				return 'question';
		}
	};

	const getTypeColor = (type?: string) => {
		switch (type) {
			case 'string':
				return 'blue';
			case 'number':
			case 'integer':
				return 'purple';
			case 'boolean':
				return 'green';
			case 'array':
				return 'yellow';
			case 'object':
				return 'orange';
			default:
				return 'gray';
		}
	};

	const resolved = resolveSchema(schema);
	const indentation = depth * 1.5; // rem units
</script>

<div style="margin-left: {indentation}rem;" class={`schema-display ${aClass}`}>
	<div class="flex items-center gap-2 py-1">
		{#if name}
			<span class="font-mono text-sm font-medium text-gray-700">{name}:</span>
		{/if}

		<Badge class="flex items-center gap-1" color={getTypeColor(resolved.type)}>
			<Icon id={getTypeIcon(resolved.type)} size={12} />
			{resolved.type || 'unknown'}
		</Badge>

		{#if resolved.required}
			<Badge color="red" size="small">required</Badge>
		{/if}

		{#if resolved.enum}
			<Badge color="gray" size="small">enum</Badge>
		{/if}
	</div>

	{#if resolved.description}
		<p style="margin-left: {indentation + 0.5}rem;" class="mt-1 ml-2 text-xs text-gray-600">
			{resolved.description}
		</p>
	{/if}

	{#if resolved.enum && resolved.enum.length > 0}
		<div style="margin-left: {indentation + 1}rem;" class="mt-1 ml-4">
			<span class="text-xs text-gray-500">Values:</span>
			{#each resolved.enum as enumValue}
				<Badge class="ml-1" color="gray" size="small">{enumValue}</Badge>
			{/each}
		</div>
	{/if}

	{#if resolved.type === 'array' && resolved.items && depth < MAX_DEPTH}
		<div class="mt-1">
			<span style="margin-left: {indentation + 1}rem;" class="ml-4 text-xs text-gray-500"
				>Items:</span
			>
			<SchemaDisplay depth={depth + 1} schema={resolved.items} {schemas} />
		</div>
	{/if}

	{#if resolved.type === 'object' && resolved.properties && depth < MAX_DEPTH}
		<div class="mt-1">
			{#each Object.entries(resolved.properties) as [propertyName, propertySchema]}
				<SchemaDisplay name={propertyName} depth={depth + 1} schema={propertySchema} {schemas} />
			{/each}
		</div>
	{/if}

	{#if resolved.type === 'object' && resolved.additionalProperties && depth < MAX_DEPTH}
		<div class="mt-1">
			<span style="margin-left: {indentation + 1}rem;" class="ml-4 text-xs text-gray-500"
				>Additional properties:</span
			>
			{#if typeof resolved.additionalProperties === 'object'}
				<SchemaDisplay depth={depth + 1} schema={resolved.additionalProperties} {schemas} />
			{:else}
				<Badge class="ml-2" color="gray" size="small">any</Badge>
			{/if}
		</div>
	{/if}

	{#if depth >= MAX_DEPTH}
		<div style="margin-left: {indentation + 1}rem;" class="ml-4 text-xs text-gray-400">
			<Icon id="dots" class="mr-1 inline" size={12} />
			(nested content hidden)
		</div>
	{/if}
</div>

<style>
	.schema-display {
		border-left: 1px solid #e5e7eb;
		padding-left: 0.5rem;
	}

	.schema-display:first-child {
		border-left: none;
		padding-left: 0;
	}
</style>
