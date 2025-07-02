<script lang="ts">
	import { serialize as serializeCookie, type SerializeOptions } from 'cookie';
	import dayjs from 'dayjs';
	import { Button } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import HtmlTitle from '$components/HtmlTitle.svelte';
	import { setTokensCookies } from '$lib/cookies';
	import { dateAddSeconds } from '$lib/dateEx';

	import type { PageProps as PageProperties } from './$types';

	let { data }: PageProperties = $props();

	onMount(async () => {
		setTokensCookies(data.tokens);
		await goto('/');
	});
</script>

<HtmlTitle title="Logged in" />
<center>
	<h1>Hello {data.accesToken.name}, you have successfully logged in with Keycloak</h1>
	<h2>You will be redirected to main page</h2>
	<Button class="mt-6" href="/">Go to main page</Button>
</center>
