<script lang="ts">
	import { Badge, Button, Card } from 'flowbite-svelte';

	import Icon from '$components/Icon.svelte';
	import { deleteTokensCookies } from '$lib/cookies';
	import { showModalPasswordChange } from '$routes/(ui)/(menu)/ModalPasswordChange.svelte';

	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	const logout = () => {
		deleteTokensCookies();
		window.location.href = '/login';
	};

	const handlePasswordChange = async () => {
		try {
			const result = await showModalPasswordChange();
			if (result) window.location.href = '/login';
			else logout();
		} catch {
			logout();
		}
	};
</script>

<svelte:head>
	<title>Password Expired - FlagFlow</title>
</svelte:head>

<div class="flex min-h-screen justify-center bg-gray-50 py-4 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div>
			<div class="flex justify-center">
				<img class="h-12 w-auto" alt="FlagFlow" src="/favicon.png" />
			</div>
			<h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
				Password Expired
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Your password has expired and must be changed to continue.
			</p>
		</div>

		<Card class="px-4 py-8 shadow sm:rounded-lg sm:px-10" size="lg">
			<div class="flex flex-col items-center space-y-6">
				<div class="flex items-center space-x-2">
					<Icon id="user" class="h-5 w-5 text-gray-400" />
					<span class="text-sm text-gray-600">Logged in as: {data.userName}</span>
				</div>

				<div class="flex items-center space-x-2">
					<Badge color="red">
						<Icon id="warning" class="mr-1 h-4 w-4" />
						Password Expired
					</Badge>
				</div>

				<div class="w-full text-center">
					<p class="mb-4 text-sm text-gray-500">
						Please change your password to continue using FlagFlow.
					</p>

					<Button
						class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
						onclick={handlePasswordChange}
					>
						<Icon id="password" class="mr-2 h-4 w-4" />
						Change Password
					</Button>

					<Button
						class="focus:ring-primary-500 mt-3 flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none"
						onclick={logout}
					>
						<Icon id="logout" class="mr-2 h-4 w-4" />
						Logout
					</Button>
				</div>

				<div class="text-center text-xs text-gray-400">
					<p>
						Canceling password change will log you out.<br />
						You'll need to log back in after changing your password.
					</p>
				</div>
			</div>
		</Card>
	</div>
</div>
