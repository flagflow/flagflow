<script lang="ts">
	/* eslint-disable no-undef */
	import { Button, Card } from 'flowbite-svelte';
	import { persisted } from 'svelte-persisted-store';

	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import FormInput from '$components/form/FormInput.svelte';
	import HtmlTitle from '$components/HtmlTitle.svelte';
	import Icon from '$components/Icon.svelte';
	import { setSessionCookie } from '$lib/cookies';
	import { focusInputById, FormLogic } from '$lib/form.svelte';
	import { rpcClient } from '$lib/rpc/client';

	import type { PageProps as PageProperties } from './$types';

	let { data }: PageProperties = $props();

	type LoginLocalConfig = {
		rememberMe: boolean;
		lastLoginUsername: string | undefined;
	};
	const loginStore = persisted<LoginLocalConfig>('login', {
		rememberMe: false,
		lastLoginUsername: undefined
	});

	// Input fields DEV only! Production build does not include default values
	const input = dev
		? {
				username: data.defaultUser.username ?? '',
				password: data.defaultUser.password ?? '',
				rememberMe: $loginStore.rememberMe
			}
		: {
				username: $loginStore.lastLoginUsername ?? '',
				password: '',
				rememberMe: $loginStore.rememberMe
			};

	const {
		formData,
		formExecute,
		formState: { stateError, stateInProgress, stateIsValid, stateAllValid }
	} = new FormLogic(
		input,
		async () => {
			const { sessionId } = await rpcClient.login.login.mutate(formData);
			setSessionCookie(sessionId, formData.rememberMe ? 7 : 0);
			await goto(resolve('/', {}));
		},
		{
			validator: (data) => ({
				username: data.username.length === 0 ? { message: '', isError: true } : { isError: false },
				password: data.password.length === 0 ? { message: '', isError: true } : { isError: false }
			}),
			changed: (target, property) => {
				if (property === 'email') target.password = '';
				if (property === 'rememberMe') $loginStore.rememberMe = target.rememberMe;
			},
			submitted: (error) => {
				if (error) {
					formData.password = '';
					focusInputById('Password');
				} else if (formData.rememberMe) $loginStore.lastLoginUsername = formData.username;
			}
		}
	);
</script>

<HtmlTitle title="Login" />

<div class="flex h-svh bg-gray-200">
	<div class="m-auto">
		<h1 class="mb-4 text-center text-xl font-semibold text-gray-700 sm:text-2xl">
			<img class="inline-flex" alt="logo" src="/favicon.png" width="48" />
			FlagFlow admin
		</h1>
		<form onsubmit={formExecute}>
			<Card class="w-80 p-6 sm:w-96">
				<h1 class="text-center text-lg text-neutral-500">Login</h1>
				<span class="text-md my-2 min-h-6 text-center font-semibold text-red-700"
					>{$stateError ? $stateError.message : ''}</span
				>
				<div class="grid grid-cols-1 gap-4">
					<FormInput
						class="unfocused"
						inProgress={$stateInProgress}
						mandatory
						preIcon="email"
						title="Username"
						validity={$stateIsValid?.username}
						bind:value={formData.username}
					/>
					<FormInput
						class="unfocused"
						inProgress={$stateInProgress}
						mandatory
						title="Password"
						type="password"
						validity={$stateIsValid?.password}
						bind:value={formData.password}
					/>
					<Button class="w-full" disabled={!$stateAllValid || $stateInProgress} type="submit">
						<Icon id="login" align="left" />
						Login
					</Button>
				</div>
			</Card>
		</form>
		{#if data.keycloak.loginUrl}
			<Button class="mt-6 w-full bg-[#3F86B0] hover:bg-[#326B8E]" href={data.keycloak.loginUrl}>
				<Icon id="keycloak" align="left" />
				Keycloak login
			</Button>
		{/if}
		<h6 class="mt-2 text-center text-xs text-gray-700">
			v{__APP_VERSION__}
		</h6>
	</div>
</div>
