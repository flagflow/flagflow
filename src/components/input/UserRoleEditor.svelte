<script lang="ts">
	import clsx from 'clsx';
	import { Toggle, Tooltip } from 'flowbite-svelte';

	import Icon from '$components/Icon.svelte';
	import { USER_ROLES_DESCRIPTOR, type UserRole } from '$types/UserRoles';

	interface Properties {
		class?: string;
		id?: string;
		roles: UserRole[];
		disabled?: boolean;
	}

	let { class: aClass = '', id = '', roles = $bindable(), disabled }: Properties = $props();

	const toggleRole = (role: UserRole) => {
		roles = roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role];
	};
</script>

<div class={clsx('flex flex-col gap-2', aClass)}>
	{#each Object.keys(USER_ROLES_DESCRIPTOR) as key}
		<Toggle
			id={`${id}-${key}`}
			checked={roles.includes(key as UserRole)}
			disabled={!!disabled}
			onchange={() => toggleRole(key as UserRole)}
		>
			{key}
			<div>
				<Icon id="information" align="right" />
				<Tooltip placement="bottom-end" type="light"
					>{USER_ROLES_DESCRIPTOR[key as UserRole]}</Tooltip
				>
			</div>
		</Toggle>
	{/each}
</div>
