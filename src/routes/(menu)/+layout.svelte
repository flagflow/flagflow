<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	import { apiClient } from '$lib/api/client';
	import { deleteTokensCookies, setTokensCookies } from '$lib/cookies';
	import { dateAddSeconds } from '$lib/dateEx';

	import type { LayoutProps as LayoutProperties } from './$types';

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

{data.authentication.success?.name}

{data.authentication.success?.roles.join(', ')}

<Button onclick={logout}>Logout</Button>

{@render children()}
