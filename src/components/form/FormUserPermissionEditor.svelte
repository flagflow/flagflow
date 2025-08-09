<script lang="ts">
	import UserPermissionsEditor from '$components/input/UserPermissionEditor.svelte';
	import type { ValidityItem } from '$lib/form.svelte';
	import type { UserPermission } from '$types/UserPermissions';

	import FormContainer from './FormContainer.svelte';

	interface Properties {
		class?: string;
		id?: string;
		title?: string;
		permissions: UserPermission[];
		mandatory?: boolean;
		inProgress?: boolean;
		validity?: ValidityItem | undefined;
	}

	let {
		class: aClass = '',
		id = '',
		title = '',
		permissions = $bindable(),
		mandatory = false,
		inProgress = false,
		validity = { isError: false }
	}: Properties = $props();
</script>

<FormContainer class={aClass} {mandatory} {title} {validity}>
	<UserPermissionsEditor
		id={id || title}
		class="m-4 gap-4"
		disabled={inProgress}
		bind:permissions
	/>
</FormContainer>
