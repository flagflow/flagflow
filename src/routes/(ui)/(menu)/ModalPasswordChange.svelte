<script lang="ts" module>
	import ModalPasswordChange from './ModalPasswordChange.svelte';

	export const showModalPasswordChange = async () =>
		modalHandler.show({ component: ModalPasswordChange });
</script>

<script lang="ts">
	import { Badge, Button, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import FormInput from '$components/form/FormInput.svelte';
	import { showModalInformation } from '$components/modal/ModalInformation.svelte';
	import PasswordStrengthIndicator from '$components/PasswordStrengthIndicator.svelte';
	import { focusInputById, FormLogic, StringValidator } from '$lib/form.svelte';
	import { modalHandler } from '$lib/modals';
	import { generateRandomPassword } from '$lib/passwordUtilities';
	import { rpcClient } from '$lib/rpc/client';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	const {
		formData,
		formExecute,
		formState: { stateInProgress, stateError, stateAllValid, stateIsValid }
	} = new FormLogic(
		{
			oldPassword: '',
			password: '',
			confirmPassword: ''
		},
		async () => {
			await rpcClient.userSetting.changePassword.mutate({
				oldPassword: formData.oldPassword as string,
				recentPassword: formData.password as string
			});
			dispatch('resolve', { isOk: true });
		},
		{
			validator: (source: { oldPassword: string; password: string; confirmPassword: string }) => ({
				passwords: {
					oldPassword: new StringValidator(source.oldPassword).required().error,
					password: new StringValidator(source.password).required().minLength(8).error,
					confirmPassword: new StringValidator(source.confirmPassword)
						.required()
						.minLength(8)
						.equalsWith(source.password, 'password').error
				}
			})
		}
	);

	const handleGeneratePassword = async () => {
		const password = await generateRandomPassword();
		formData.password = password;
		formData.confirmPassword = password;

		await showModalInformation(
			'Generated password',
			`The generated password is: **${password}**
			<br/><br/>
			Warning! Keep it safe as you will need it for future logins!`
		);
	};

	focusInputById('oldPassword');
</script>

<form onsubmit={formExecute}>
	<Modal
		closedby="none"
		dismissable={false}
		oncancel={() => dispatch('resolve', { isOk: false })}
		open
		outsideclose={false}
		size="sm"
	>
		{#snippet header()}
			<div class="flex justify-between gap-4">
				Change Password
				{#if $stateInProgress}
					<Badge color="green">Changing...</Badge>
				{:else if $stateError}
					<Badge color="red">{$stateError?.message || ''}</Badge>
				{/if}
			</div>
		{/snippet}

		<div class="flex flex-col gap-4">
			<FormInput
				id="oldPassword"
				inProgress={$stateInProgress}
				mandatory
				title="Current Password"
				type="password"
				validity={$stateIsValid?.passwords?.oldPassword}
				bind:value={formData.oldPassword}
			/>
			<FormInput
				id="password"
				inProgress={$stateInProgress}
				mandatory
				title="New Password"
				type="password"
				validity={$stateIsValid?.passwords?.password}
				bind:value={formData.password}
			/>
			<FormInput
				id="confirmPassword"
				inProgress={$stateInProgress}
				mandatory
				title="Confirm New Password"
				type="password"
				validity={$stateIsValid?.passwords?.confirmPassword}
				bind:value={formData.confirmPassword}
			/>
			<PasswordStrengthIndicator password={formData.password as string} />
			<Button color="light" onclick={handleGeneratePassword} size="xs">Generate password</Button>
		</div>

		<div class="mt-4 flex justify-center space-x-4">
			<Button
				class="w-34 whitespace-nowrap"
				disabled={!$stateAllValid || $stateInProgress}
				onclick={() => formExecute()}
			>
				Change password
			</Button>
			<Button class="w-34" color="alternative" onclick={() => dispatch('resolve', { isOk: false })}>
				Cancel
			</Button>
		</div>
	</Modal>
</form>
