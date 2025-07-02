<script lang="ts">
	import type { ComponentEvents } from 'svelte';

	import type { createModalStore } from './modal';
	import type {
		ModalComponentBase,
		ModalComponentBaseResolved,
		ModalPushOutput
	} from './modal.types';

	interface Properties {
		store: ReturnType<typeof createModalStore>;
	}

	const { store }: Properties = $props();

	function onResolve<
		Component extends ModalComponentBase,
		Resolved extends ModalComponentBaseResolved = ComponentEvents<Component>['resolve']['detail']
	>(modal: ModalPushOutput<Component, Resolved>, event: CustomEvent<Resolved>) {
		store.pop(modal, event.detail);
	}
</script>

{#each $store as modal (modal.id)}
	<modal.component {...modal.props} on:resolve={(event) => onResolve(modal, event)} />
{/each}
