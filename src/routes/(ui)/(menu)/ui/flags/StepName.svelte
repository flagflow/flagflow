<script lang="ts">
	import FormInput from '$components/form/FormInput.svelte';
	import FormTextarea from '$components/form/FormTextarea.svelte';
	import { focusInputById, type ValidityItem } from '$lib/form.svelte';
	import { PersistentHierarchicalKeyInputRegExp } from '$types/persistent';

	interface Properties {
		name: string;
		description: string;
		validity?:
			| {
					name: ValidityItem;
					description: ValidityItem;
			  }
			| undefined;
	}
	let { name = $bindable(), description = $bindable(), validity }: Properties = $props();

	focusInputById('name');
</script>

<div class="flex flex-col gap-4">
	<FormInput
		id="name"
		mandatory
		maxLength={128}
		regexp={PersistentHierarchicalKeyInputRegExp}
		title="Name"
		validity={validity?.name}
		bind:value={name}
	/>
	<FormTextarea
		id="description"
		rows={8}
		title="Description"
		validity={validity?.description}
		bind:value={description}
	/>
</div>
