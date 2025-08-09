<script lang="ts" module>
	import ModalNewUser from './ModalNewUser.svelte';

	export const showModalNewUser = async () => modalHandler.show({ component: ModalNewUser });
</script>

<script lang="ts">
	import { passwordStrength } from 'check-password-strength';
	import { Badge, Button, Hr, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import FormInput from '$components/form/FormInput.svelte';
	import FormToggle from '$components/form/FormToggle.svelte';
	import FormUserPermissionEditor from '$components/form/FormUserPermissionEditor.svelte';
	import { showModalInformation } from '$components/modal/ModalInformation.svelte';
	import PasswordStrengthIndicator from '$components/PasswordStrengthIndicator.svelte';
	import { focusInputById, FormLogic, StringValidator } from '$lib/form.svelte';
	import { generatePassword } from '$lib/genId';
	import { modalHandler } from '$lib/modals';
	import { rpcClient } from '$lib/rpc/client';
	import { EtcdUserKey } from '$types/etcd';
	import { type UserPermission } from '$types/UserPermissions';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	const user = {
		userName: 'user@company.com',
		name: 'John Doe',
		password: '',
		password2: '',
		permissions: ['flag-value'] as UserPermission[],
		mustChangePassword: true
	};

	const {
		formData,
		formExecute,
		formState: { stateInProgress, stateError, stateAllValid, stateIsValid }
	} = new FormLogic(
		user,
		async () => {
			await rpcClient.user.create.mutate({
				key: formData.userName,
				...formData
			});
			dispatch('resolve', { isOk: true });
		},
		{
			validator: (source) => {
				return {
					user: {
						userName: new StringValidator(source.userName, 'trim')
							.required()
							.noSpace()
							.maxLength(64)
							.zod(EtcdUserKey).error,
						password: new StringValidator(source.password).required().minLength(8).error,
						password2: new StringValidator(source.password2)
							.required()
							.minLength(8)
							.equalsWith(source.password, 'password').error,
						name: new StringValidator(source.name, 'trim').required().maxLength(100).error
					}
				};
			}
		}
	);

	const generateRandomPassword = async () => {
		let password = generatePassword(8 + Math.random() * 8);
		while (passwordStrength(password).id < 3) password = generatePassword();

		formData.password = password;
		formData.password2 = password;

		await showModalInformation(
			'Generated password',
			`The generated password is: **${password}**
			<br/><br/>
			Warning! Keep it safe and send it to the user after user creation!`
		);
	};

	focusInputById('userName');
</script>

<form onsubmit={formExecute}>
	<Modal
		closedby="none"
		dismissable={false}
		oncancel={() => dispatch('resolve', { isOk: false })}
		open
		outsideclose={false}
		size="md"
	>
		{#snippet header()}
			<div class="flex justify-between gap-4">
				New user
				{#if $stateInProgress}
					<Badge color="green">Saving...</Badge>
				{:else if $stateError}
					<Badge color="red">{$stateError?.message || ''}</Badge>
				{/if}
			</div>
		{/snippet}
		<div class="grid grid-cols-2 gap-4">
			<FormInput
				id="userName"
				inProgress={$stateInProgress}
				mandatory
				title="Username"
				validity={$stateIsValid?.user.userName}
				bind:value={formData.userName}
			/>
			<FormInput
				id="name"
				inProgress={$stateInProgress}
				mandatory
				title="Name"
				validity={$stateIsValid?.user.name}
				bind:value={formData.name}
			/>
			<Hr class="col-span-2 m-2" />
			<div class="flex flex-col gap-4">
				<FormInput
					id="password"
					inProgress={$stateInProgress}
					mandatory
					title="Password"
					type="password"
					validity={$stateIsValid?.user.password}
					bind:value={formData.password}
				/>
				<FormInput
					id="password2"
					inProgress={$stateInProgress}
					mandatory
					title="Password again"
					type="password"
					validity={$stateIsValid?.user.password2}
					bind:value={formData.password2}
				/>
				<PasswordStrengthIndicator password={formData.password} />
				<Button color="light" onclick={generateRandomPassword} size="xs">Generate password</Button>
				<FormToggle
					inProgress={$stateInProgress}
					inline
					title="Must change password"
					bind:checked={formData.mustChangePassword}
				/>
			</div>
			<div class="flex flex-col gap-4">
				<FormUserPermissionEditor
					inProgress={$stateInProgress}
					mandatory
					title="Assigned permissions"
					bind:permissions={formData.permissions}
				/>
			</div>
		</div>

		<div class="mt-4 flex justify-center space-x-4">
			<Button
				class="w-20"
				disabled={!$stateAllValid || $stateInProgress}
				onclick={() => formExecute()}
			>
				Create</Button
			>
			<Button class="w-20" color="alternative" onclick={() => dispatch('resolve', { isOk: false })}
				>Cancel</Button
			>
		</div>
	</Modal>
</form>
