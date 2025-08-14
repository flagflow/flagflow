<script lang="ts">
	import clsx from 'clsx';
	import { Helper, Radio } from 'flowbite-svelte';

	import FormContainer from '$components/form/FormContainer.svelte';
	import Icon from '$components/Icon.svelte';
	import { focusInputById } from '$lib/form.svelte';
	import {
		type PersistentFlagType,
		PersistentFlagTypeDescription,
		PersistentFlagTypeIcon
	} from '$types/persistent';

	interface Properties {
		type: PersistentFlagType;
	}
	let { type = $bindable() }: Properties = $props();

	focusInputById('name');
</script>

<FormContainer class="flex flex-col gap-3 px-4" mandatory title="Type">
	{#each Object.entries(PersistentFlagTypeDescription) as [flagType, description]}
		<div class={clsx('ml-2 flex flex-col', { 'opacity-50': !description.enabled })}>
			<Radio disabled={!description.enabled} value={flagType} bind:group={type}>
				{flagType}
				<Icon id={PersistentFlagTypeIcon[flagType as PersistentFlagType]} align="right" size={20} />
			</Radio>
			<Helper class="ps-6">{description.text}</Helper>
		</div>
	{/each}
</FormContainer>
