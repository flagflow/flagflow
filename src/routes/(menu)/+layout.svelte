<script lang="ts">
	import {
		Avatar,
		Button,
		Dropdown,
		DropdownGroup,
		DropdownHeader,
		DropdownItem,
		Navbar,
		NavBrand,
		Search,
		Sidebar,
		SidebarDropdownWrapper,
		SidebarGroup,
		SidebarItem
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';

	import { page } from '$app/state';
	import Icon from '$components/icon/Icon.svelte';
	import { apiClient } from '$lib/api/client';
	import { deleteTokensCookies, setTokensCookies } from '$lib/cookies';
	import { dateAddSeconds } from '$lib/dateEx';
	import { modalHandler } from '$lib/modals';
	import ModalPortal from '$lib/svelteModal/ModalPortal.svelte';

	import type { LayoutProps as LayoutProperties } from './$types';

	const spanClass = 'flex-1 ms-3 whitespace-nowrap';

	const { data, children }: LayoutProperties = $props();

	const userName = data.authentication.success?.userName || '';
	const userNameInitials =
		userName.split(' ').length > 1
			? userName.split(' ')[0].slice(0, 1) + userName.split(' ')[1].slice(0, 1)
			: userName.slice(0, 2);

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

	let searchText = $state('');

	const doSearch = () => {
		if (searchText.trim() === '') return;

		const searchUrl = new URL('/ui/search', window.location.origin);
		searchUrl.searchParams.set('q', searchText.trim());
		window.location.href = searchUrl.toString();
	};
</script>

<Navbar class="bg-gray-50" fluid>
	<NavBrand href="/">
		<img class="me-3 h-6 sm:h-9" alt="FlagFlow Logo" src="/favicon.png" />
		<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
			FlagFlow admin
		</span>
	</NavBrand>
	<div class="items-cemter flex cursor-pointer md:order-1">
		<Search placeholder="Flags, users..." size="md" bind:value={searchText}>
			<Button class="me-1" onclick={doSearch} size="xs">Search</Button>
		</Search>
	</div>
	<div class="flex cursor-pointer items-center md:order-2">
		<Avatar id="avatar" class="bg-orange-100 p-4" border>{userNameInitials}</Avatar>
	</div>
	<Dropdown placement="bottom" triggeredBy="#avatar">
		<DropdownHeader class="text-xs font-semibold">{userName}</DropdownHeader>
		<DropdownGroup>
			<DropdownItem href="#" onclick={logout}>Logout</DropdownItem>
		</DropdownGroup>
	</Dropdown>
</Navbar>

<div class="relative">
	<Sidebar
		class="z-50 h-full"
		activeClass="p-2 text-white bg-primary-600 hover:bg-primary-800"
		activeUrl={page.url.pathname}
		backdrop={false}
		nonActiveClass="p-2"
		params={{ x: 0, duration: 0 }}
		position="absolute"
	>
		<SidebarGroup>
			<SidebarItem href="/" label="Dashboard" {spanClass}>
				{#snippet icon()}
					<Icon id="dashboard" />
				{/snippet}
			</SidebarItem>
			<SidebarItem href="/ui/flags" label="Flags" {spanClass}>
				{#snippet icon()}
					<Icon id="flag" />
				{/snippet}
			</SidebarItem>
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
	<div class="h-[calc(100svh-64px)] overflow-auto p-4 md:ml-64">
		{@render children()}
	</div>
</div>

<ModalPortal store={modalHandler} />
