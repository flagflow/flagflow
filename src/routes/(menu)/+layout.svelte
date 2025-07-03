<script lang="ts">
	import Icon from '@iconify/svelte';
	import {
		Avatar,
		Dropdown,
		DropdownGroup,
		DropdownHeader,
		DropdownItem,
		Navbar,
		NavBrand,
		NavHamburger,
		Sidebar,
		SidebarGroup,
		SidebarItem
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';

	import { page } from '$app/state';
	import { apiClient } from '$lib/api/client';
	import { deleteTokensCookies, setTokensCookies } from '$lib/cookies';
	import { dateAddSeconds } from '$lib/dateEx';

	import type { LayoutProps as LayoutProperties } from './$types';

	const activeUrl = $state(page.url.pathname);
	const spanClass = 'flex-1 ms-3 whitespace-nowrap';

	const { data, children }: LayoutProperties = $props();

	const logout = async () => {
		if (data.authentication.type === 'JWT') deleteTokensCookies();
		if (data.logoutUrl) window.location.href = data.logoutUrl;
	};

	let accessTokenExpiredAt =
		data.authentication.type === 'JWT' && data.authentication.success
			? data.authentication.success.expiredAt
			: new Date();
	const refreshTokenIfNeeded = async () => {
		if (data.authentication.type !== 'JWT' || !data.authentication.success) return;
		if (accessTokenExpiredAt.getTime() - Date.now() < 23 * 1000)
			try {
				const tokens = await apiClient.login.refreshKeycloakToken.mutate();
				setTokensCookies(tokens);
				accessTokenExpiredAt = dateAddSeconds(new Date(), tokens.expires_in);
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error('Failed to refresh access token:', error);
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

<Navbar fluid>
	<NavBrand href="/">
		<img class="me-3 h-6 sm:h-9" alt="FlagFlow Logo" src="favicon.png" />
		<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">FlagFlow</span
		>
	</NavBrand>
	<div class="flex items-center md:order-2">
		<Avatar id="avatar-menu" src="/images/profile-picture-3.webp" />
		<NavHamburger />
	</div>
	<Dropdown placement="bottom" triggeredBy="#avatar-menu">
		<DropdownHeader>
			<span class="block text-sm">{data.authentication.success?.name}</span>
			<span class="block truncate text-sm font-medium">name@flowbite.com</span>
		</DropdownHeader>
		<DropdownGroup>
			<DropdownItem>Dashboard</DropdownItem>
			<DropdownItem>Settings</DropdownItem>
			<DropdownItem>Earnings</DropdownItem>
		</DropdownGroup>
		<DropdownHeader>Sign out</DropdownHeader>
	</Dropdown>
</Navbar>

<div class="relative">
	<Sidebar
		class="z-50 h-full"
		activeClass="p-2"
		{activeUrl}
		backdrop={false}
		isOpen
		nonActiveClass="p-2"
		params={{ x: -50, duration: 50 }}
		position="absolute"
	>
		<SidebarGroup>
			<SidebarItem href="/" label="Dashboard">
				{#snippet icon()}
					<Icon class="mr-2" icon="mdi:view-dashboard" width="18" />
				{/snippet}
			</SidebarItem>
			<SidebarItem href="/abc" label="Flags" {spanClass}>
				{#snippet icon()}
					<Icon class="mr-2" icon="mdi:flag" width="18" />
				{/snippet}
				{#snippet subtext()}
					<span
						class="ms-3 inline-flex items-center justify-center rounded-full bg-gray-200 px-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
						>Pro</span
					>
				{/snippet}
			</SidebarItem>
			<SidebarItem href="/123" label="Export / import" {spanClass}>
				{#snippet icon()}
					<Icon class="mr-2" icon="mdi:export" width="18" />
				{/snippet}
				{#snippet subtext()}
					<span
						class="bg-primary-200 text-primary-600 dark:bg-primary-900 dark:text-primary-200 ms-3 inline-flex h-3 w-3 items-center justify-center rounded-full p-3 text-sm font-medium"
						>3</span
					>
				{/snippet}
			</SidebarItem>
			<SidebarItem href="/components/sidebar" label="Users">
				{#snippet icon()}
					<Icon class="mr-2" icon="mdi:user" width="18" />
				{/snippet}
			</SidebarItem>
			<SidebarItem href="#" label="Logout" onclick={logout}>
				{#snippet icon()}
					<Icon class="mr-2" icon="mdi:logout" width="18" />
				{/snippet}
			</SidebarItem>
		</SidebarGroup>
	</Sidebar>
	<div class="h-96 overflow-auto px-4 md:ml-64">
		<div class="rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700">
			{@render children()}
		</div>
	</div>
</div>

<style>
</style>
