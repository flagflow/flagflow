<script lang="ts">
	import UserRoleEditor from '$components/input/UserRoleEditor.svelte';
	import type { ValidityItem } from '$lib/form.svelte';
	import type { UserRole } from '$types/userRoles';

	import FormContainer from './FormContainer.svelte';

	interface Properties {
		class?: string;
		title?: string;
		roles: UserRole[];
		mandatory?: boolean;
		inProgress?: boolean;
		validity?: ValidityItem | undefined;
	}

	let {
		class: aClass = '',
		title = '',
		roles = $bindable(),
		mandatory = false,
		inProgress = false,
		validity = { isError: false }
	}: Properties = $props();
</script>

<FormContainer class={aClass} {mandatory} {title} {validity}>
	<UserRoleEditor class="m-4 gap-4" disabled={inProgress} bind:roles />
</FormContainer>
