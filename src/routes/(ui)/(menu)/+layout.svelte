<script lang="ts">
	import {
		Avatar,
		Badge,
		Dropdown,
		DropdownHeader,
		DropdownItem,
		Navbar,
		NavBrand,
		Sidebar,
		SidebarDropdownWrapper,
		SidebarGroup,
		SidebarItem
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';

	import { page } from '$app/state';
	import Icon from '$components/icon/Icon.svelte';
	import { deleteTokensCookies, setTokensCookies } from '$lib/cookies';
	import { dateAddSeconds } from '$lib/dateEx';
	import { modalHandler } from '$lib/modals';
	import { rpcClient } from '$lib/rpc/client';
	import ModalPortal from '$lib/svelteModal/ModalPortal.svelte';
	import type { UserRole } from '$types/UserRoles';

	import type { LayoutProps as LayoutProperties } from './$types';

	const spanClass = 'flex-1 ms-3 whitespace-nowrap';

	const { data, children }: LayoutProperties = $props();

	const userName = data.authenticationContext.userName;
	const userNameInitials =
		userName.split(' ').length > 1
			? userName.split(' ')[0].slice(0, 1) + userName.split(' ')[1].slice(0, 1)
			: userName.slice(0, 2);

	const userRolesString = Object.keys(data.authenticationContext.roles)
		.filter((role) => data.authenticationContext.roles[role as UserRole])
		.map((role) => role.slice(0, 1).toUpperCase())
		.join('');

	const logout = async () => {
		if (data.authenticationContext.type === 'JWT') deleteTokensCookies();
		if (data.authenticationContext.logoutUrl)
			window.location.href = data.authenticationContext.logoutUrl;
	};

	let accessTokenExpiredAt = data.authenticationContext.jwtExpiredAt;
	const refreshTokenIfNeeded = async () => {
		if (data.authenticationContext.type !== 'JWT') return;
		if (accessTokenExpiredAt.getTime() - Date.now() < 23 * 1000)
			try {
				const tokens = await rpcClient.login.refreshKeycloakToken.mutate();
				setTokensCookies(tokens);
				accessTokenExpiredAt = dateAddSeconds(new Date(), tokens.expires_in);
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error('Failed to refresh access token', error);
			}
	};
	onMount(() => {
		const unmounts: (() => void)[] = [];

		const timer = setInterval(async () => {
			refreshTokenIfNeeded();
		}, 1234);
		unmounts.push(() => clearInterval(timer));

		const handleVisibilityChange = async () =>
			document.visibilityState === 'visible' ? refreshTokenIfNeeded() : undefined;
		document.addEventListener('visibilitychange', handleVisibilityChange);
		unmounts.push(() => document.removeEventListener('visibilitychange', handleVisibilityChange));

		return () => {
			for (const unmount of unmounts) unmount();
		};
	});
</script>

<Navbar class="bg-gray-50" fluid>
	<NavBrand href="/">
		<img class="me-3 h-6 sm:h-9" alt="FlagFlow Logo" src="/favicon.png" />
		<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
			FlagFlow admin
		</span>
		{#if data.environmentContext.name}
			<Badge class="text-md ml-4" color="emerald" rounded>{data.environmentContext.name}</Badge>
		{/if}
	</NavBrand>
	<div class="flex cursor-pointer items-center md:order-2">
		<Avatar id="avatar" class="bg-orange-100 p-4" border>{userNameInitials}</Avatar>
	</div>
	<Dropdown placement="bottom" simple triggeredBy="#avatar">
		<DropdownHeader class="text-xs font-semibold">
			{userName}
			<Badge>{userRolesString}</Badge>
		</DropdownHeader>
		<DropdownItem href="#" onclick={logout}>Logout</DropdownItem>
	</Dropdown>
</Navbar>

<div class="relative">
	<Sidebar
		class="z-50 h-full"
		activeUrl={page.url.pathname}
		backdrop={false}
		classes={{ active: 'p-2 text-white bg-primary-600 hover:bg-primary-800', nonactive: 'p-2' }}
		params={{ x: 0, duration: 0 }}
		position="absolute"
	>
		<SidebarGroup>
			<SidebarItem href="/" label="Dashboard" {spanClass}>
				{#snippet icon()}
					<Icon id="dashboard" />
				{/snippet}
			</SidebarItem>
			<SidebarDropdownWrapper btnClass="p-2" label="Flags">
				{#snippet icon()}
					<Icon id="flag" />
				{/snippet}
				<SidebarItem href="/ui/flags" label="Flags" {spanClass} />
				<SidebarItem href="/ui/flags?inconsistencies" label="Inconsistencies" {spanClass} />
				<SidebarItem href="/ui/flags?deprecated" label="Deprecated" {spanClass} />
				<SidebarItem href="/ui/flags/depgraph" label="Dependency graph" {spanClass} />
				<SidebarItem href="/ui/flags/urls" label="URL info" {spanClass} />
			</SidebarDropdownWrapper>
		</SidebarGroup>
		<SidebarGroup border>
			<SidebarItem href="/ui/export" label="Export / import" {spanClass}>
				{#snippet icon()}
					<Icon id="export" />
				{/snippet}
			</SidebarItem>
			<SidebarDropdownWrapper btnClass="p-2" label="Users">
				{#snippet icon()}
					<Icon id="user" />
				{/snippet}
				<SidebarItem href="/ui/users" label="Users" />
				<SidebarItem href="/ui/sessions" label="Sessions" />
			</SidebarDropdownWrapper>
		</SidebarGroup>
		<SidebarGroup border>
			<SidebarItem href="#" label="Logout" onclick={logout}>
				{#snippet icon()}
					<Icon id="logout" />
				{/snippet}
			</SidebarItem>
		</SidebarGroup>
	</Sidebar>
	<div class="h-[calc(100svh-64px)] overflow-auto p-0 md:ml-64">
		{@render children()}
	</div>
</div>

<ModalPortal store={modalHandler} />
