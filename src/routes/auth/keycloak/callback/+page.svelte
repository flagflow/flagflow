<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import HtmlTitle from '$components/HtmlTitle.svelte';
	import { setTokensCookies } from '$lib/cookies';

	import type { PageProps as PageProperties } from './$types';

	let { data }: PageProperties = $props();

	onMount(async () => {
		setTokensCookies(data.tokens);
		await goto(resolve('/', {}));
	});
</script>

<HtmlTitle title="Logged in" />
<center>
	<h1>Hello {data.accesToken.name}, you have successfully logged in with Keycloak</h1>
	<h2>You will be redirected to main page</h2>
	<Button class="mt-6" href="/">Go to main page</Button>
</center>
