<script lang="ts">
	import clsx from 'clsx';
	import { Toggle, Tooltip } from 'flowbite-svelte';

	import Icon from '$components/icon/Icon.svelte';
	import { USER_ROLES_DESCRIPTOR, type UserRole } from '$types/userRoles';

	interface Properties {
		class?: string;
		roles: UserRole[];
		disabled?: boolean;
	}

	let { class: aClass = '', roles = $bindable(), disabled }: Properties = $props();

	const descriptors = USER_ROLES_DESCRIPTOR;

	const toggleRole = (role: UserRole) => {
		roles = roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role];
	};
</script>

<div class={clsx('flex flex-col gap-2', aClass)}>
	{#each Object.keys(descriptors) as key}
		<Toggle
			checked={roles.includes(key as UserRole)}
			disabled={!!disabled}
			onchange={() => toggleRole(key as UserRole)}
		>
			{key}
			<div>
				<Icon id="information" align="right" />
				<Tooltip placement="bottom-end" type="light">{descriptors[key as UserRole]}</Tooltip>
			</div>
		</Toggle>
	{/each}
</div>
