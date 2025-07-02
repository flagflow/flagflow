<script lang="ts">
	import Icon from '@iconify/svelte';
	import { clsx } from 'clsx';
	import { serialize as serializeCookie } from 'cookie';
	import {
		Avatar,
		Button,
		Dropdown,
		DropdownDivider,
		DropdownHeader,
		DropdownItem,
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		Tooltip
	} from 'flowbite-svelte';
	import { onDestroy, onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DropdownIconItem from '$components/DropdownIconItem.svelte';
	import { Icons } from '$components/Icons';
	import { apiClient } from '$lib/api/client';
	import { deleteTokensCookies, setTokensCookies } from '$lib/cookies';
	import { dateAddSeconds } from '$lib/dateEx';
	import { generateBrowserId } from '$lib/genId';
	import { modalHandler } from '$lib/modals';
	import { isMobileView } from '$lib/stores/mediaQueryStore';
	import ModalPortal from '$lib/svelteModal/ModalPortal.svelte';

	import type { LayoutProps as LayoutProperties } from './$types';

	let scrollPos = $state(0);
	const hamburgerMenuVisible = $state(false);

	const { data, children }: LayoutProperties = $props();

	const logout = async () => {
		if (data.authentication.type === 'JWT') deleteTokensCookies();
		if (data.logoutUrl) window.location.href = data.logoutUrl;
	};

	let accessTokenExpiredAt =
		data.authentication.type === 'JWT' && data.authentication.authentication
			? data.authentication.authentication.expiredAt
			: new Date();
	const refreshTokenIfNeeded = async () => {
		if (data.authentication.type !== 'JWT' || !data.authentication.authentication) return;
		if (accessTokenExpiredAt.getTime() - Date.now() < 23 * 1000)
			try {
				const tokens = await apiClient.login.refreshKeycloakToken.mutate();
				setTokensCookies(tokens);
				accessTokenExpiredAt = dateAddSeconds(new Date(), tokens.expires_in);
			} catch (error) {
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

<svelte:window onscroll={() => (scrollPos = window.scrollY)} />

{data.authentication.authentication?.name}

{data.authentication.authentication?.roles.join(', ')}

<Button onclick={logout}>Logout</Button>

{@render children()}
