<script lang="ts" module>
	import ModalNewUser from './ModalNewUser.svelte';

	export const showModalNewUser = async () => {
		const user = {
			userName: 'user@company.com',
			name: 'John Doe',
			password: '',
			password2: '',
			roles: ['flagflow-viewer'] as UserRole[],
			mustChangePassword: true
		};

		return modalHandler.show({
			component: ModalNewUser,
			props: {
				user
			}
		});
	};
</script>

<script lang="ts">
	import { passwordStrength } from 'check-password-strength';
	import { Badge, Button, Hr, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import FormInput from '$components/form/FormInput.svelte';
	import FormToggle from '$components/form/FormToggle.svelte';
	import FormUserRoleEditor from '$components/form/FormUserRoleEditor.svelte';
	import { showModalInformation } from '$components/modal/ModalInformation.svelte';
	import PasswordStrengthIndicator from '$components/PasswordStrengthIndicator.svelte';
	import { apiClient } from '$lib/api/client';
	import { ArrayValidator, focusInputById, FormLogic, StringValidator } from '$lib/form.svelte';
	import { generatePassword } from '$lib/genId';
	import { modalHandler } from '$lib/modals';
	import { EtcdUserKey } from '$types/Etcd';
	import { type UserRole } from '$types/UserRoles';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	interface Properties {
		user: {
			userName: string;
			name: string;
			password: string;
			password2: string;
			roles: UserRole[];
			mustChangePassword: boolean;
		};
	}

	const { user }: Properties = $props();

	const {
		formData,
		formExecute,
		formState: { stateInProgress, stateError, stateAllValid, stateIsValid }
	} = new FormLogic(
		user,
		async () => {
			await apiClient.user.create.mutate({
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
						name: new StringValidator(source.name, 'trim').required().maxLength(100).error,
						roles: new ArrayValidator(source.roles).required().error
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
			`The generated password is: <strong>${password}</strong>
			<br/><br/>
			Warning! Keep it safe and send it to the user after user creation!`
		);
	};

	focusInputById('userName');
</script>

<form onsubmit={formExecute}>
	<Modal
		dismissable={false}
		onclose={() => dispatch('resolve', { isOk: false })}
		permanent
		size="md"
	>
		{#snippet header()}
			<div class="flex justify-between">
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
				<FormUserRoleEditor
					inProgress={$stateInProgress}
					mandatory
					title="Assigned roles"
					bind:roles={formData.roles}
				/>
			</div>
		</div>

		<div class="mt-4 flex justify-center space-x-4">
			<Button
				class="w-20"
				disabled={!$stateAllValid || $stateInProgress}
				onclick={() => formExecute({})}
			>
				Create</Button
			>
			<Button class="w-20" color="alternative" onclick={() => dispatch('resolve', { isOk: false })}
				>Cancel</Button
			>
		</div>
	</Modal>
</form>
