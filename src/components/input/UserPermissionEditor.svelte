<script lang="ts">
	import clsx from 'clsx';
	import { Toggle, Tooltip } from 'flowbite-svelte';

	import Icon from '$components/Icon.svelte';
	import { USER_PERMISSIONS_DESCRIPTOR, type UserPermission } from '$types/UserPermissions';

	interface Properties {
		class?: string;
		id?: string;
		permissions: UserPermission[];
		disabled?: boolean;
	}

	let { class: aClass = '', id = '', permissions = $bindable(), disabled }: Properties = $props();

	const togglePermission = (permission: UserPermission) => {
		permissions = permissions.includes(permission)
			? permissions.filter((r) => r !== permission)
			: [...permissions, permission];
	};
</script>

<div class={clsx('flex flex-col gap-2', aClass)}>
	{#each Object.keys(USER_PERMISSIONS_DESCRIPTOR) as key}
		<Toggle
			id={`${id}-${key}`}
			checked={permissions.includes(key as UserPermission)}
			disabled={!!disabled}
			onchange={() => togglePermission(key as UserPermission)}
		>
			{key}
			<div>
				<Icon id="information" align="right" />
				<Tooltip placement="bottom-end" type="light"
					>{USER_PERMISSIONS_DESCRIPTOR[key as UserPermission]}</Tooltip
				>
			</div>
		</Toggle>
	{/each}
</div>
