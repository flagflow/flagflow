<script lang="ts" module>
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import ModalUserOperation from './ModalUserOperation.svelte';

	type UserOperationType = 'create' | 'modify' | 'setPassword';
	type EditableUser = {
		userName: string;
		name: string;
		permissions: UserPermission[];
		mustChangePassword: boolean;
	};

	export const showModalUserOperation = async (operation: UserOperationType, userName?: string) => {
		let user: EditableUser | undefined;

		if (operation === 'modify' || operation === 'setPassword') {
			if (!userName) throw new Error('userName is required for modify and setPassword operations');
			user = {
				userName,
				mustChangePassword: true,
				...(await rpcClient.user.get.query({ key: userName }))
			};
		}

		return modalHandler.show({
			component: ModalUserOperation,
			props: {
				operation,
				user: user
			}
		});
	};
</script>

<script lang="ts">
	import { passwordStrength } from 'check-password-strength';
	import { Badge, Button, Hr, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import FormInput from '$components/form/FormInput.svelte';
	import FormLabel from '$components/form/FormLabel.svelte';
	import FormToggle from '$components/form/FormToggle.svelte';
	import FormUserPermissionEditor from '$components/form/FormUserPermissionEditor.svelte';
	import { showModalInformation } from '$components/modal/ModalInformation.svelte';
	import PasswordStrengthIndicator from '$components/PasswordStrengthIndicator.svelte';
	import { ArrayValidator, focusInputById, FormLogic, StringValidator } from '$lib/form.svelte';
	import { generatePassword } from '$lib/genId';
	import { rpcClient } from '$lib/rpc/client';
	import { modalHandler } from '$lib/svelteModal/modal';
	import { PersistentUserKey } from '$types/persistent';
	import { type UserPermission } from '$types/UserPermissions';

	type UserOperationType = 'create' | 'modify' | 'setPassword';

	interface Properties {
		operation: UserOperationType;
		user?: EditableUser | undefined;
	}

	const { operation, user }: Properties = $props();

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	const getInitialFormData = (): any => {
		if (operation === 'create')
			return {
				userName: 'user@company.com',
				name: 'John Doe',
				password: '',
				password2: '',
				permissions: ['flag-value'] as UserPermission[],
				mustChangePassword: true
			};
		else if (operation === 'modify')
			return {
				userName: user!.userName,
				name: user!.name,
				permissions: user!.permissions
			};
		else
			// setPassword
			return {
				userName: user!.userName,
				password: '',
				password2: '',
				mustChangePassword: true
			};
	};

	const getSubmitAction = () => {
		if (operation === 'create')
			return async () => {
				await rpcClient.user.create.mutate({
					key: formData.userName as string,
					name: formData.name as string,
					password: formData.password as string,
					permissions: formData.permissions as UserPermission[],
					mustChangePassword: formData.mustChangePassword as boolean
				});
				dispatch('resolve', { isOk: true });
			};
		else if (operation === 'modify')
			return async () => {
				await rpcClient.user.update.mutate({
					key: formData.userName as string,
					name: formData.name as string,
					permissions: formData.permissions as UserPermission[]
				});
				dispatch('resolve', { isOk: true });
			};
		else
			// setPassword
			return async () => {
				await rpcClient.user.update.mutate({
					key: formData.userName as string,
					password: formData.password as string,
					mustChangePassword: formData.mustChangePassword as boolean
				});
				dispatch('resolve', { isOk: true });
			};
	};

	const getValidator = () => {
		if (operation === 'create')
			return (source: any) => {
				return {
					user: {
						userName: new StringValidator(source.userName, 'trim')
							.required()
							.noSpace()
							.maxLength(64)
							.zod(PersistentUserKey).error,
						password: new StringValidator(source.password).required().minLength(8).error,
						password2: new StringValidator(source.password2)
							.required()
							.minLength(8)
							.equalsWith(source.password, 'password').error,
						name: new StringValidator(source.name, 'trim').required().maxLength(100).error
					}
				};
			};
		else if (operation === 'modify')
			return (source: any) => {
				return {
					user: {
						name: new StringValidator(source.name, 'trim').required().maxLength(100).error,
						permissions: new ArrayValidator(source.permissions).required().error
					}
				};
			};
		else
			// setPassword
			return (source: any) => {
				return {
					user: {
						password: new StringValidator(source.password).required().minLength(8).error,
						password2: new StringValidator(source.password2)
							.required()
							.minLength(8)
							.equalsWith(source.password, 'password').error
					}
				};
			};
	};

	const initialFormData = getInitialFormData();

	const {
		formData,
		formExecute,
		formState: { stateInProgress, stateError, stateAllValid, stateIsValid }
	} = new FormLogic(initialFormData, getSubmitAction(), {
		validator: getValidator() as any
	});

	const generateRandomPassword = async () => {
		let password = generatePassword(8 + Math.random() * 8);
		while (passwordStrength(password).id < 3) password = generatePassword();

		formData.password = password;
		formData.password2 = password;

		await showModalInformation(
			'Generated password',
			`The generated password is: **${password}**
			<br/><br/>
			Warning! Keep it safe and send it to the user after ${operation === 'create' ? 'user creation' : 'password change'}!`
		);
	};

	const getModalTitle = () => {
		switch (operation) {
			case 'create':
				return 'New user';
			case 'modify':
				return 'Modify user';
			case 'setPassword':
				return 'Set password';
		}
	};

	const getButtonText = () => {
		switch (operation) {
			case 'create':
				return 'Create';
			case 'modify':
				return 'Update';
			case 'setPassword':
				return 'Set Password';
		}
	};

	const getModalSize = () => (operation === 'create' ? 'md' : 'sm');

	const getFocusInputId = () => {
		if (operation === 'create') return 'userName';
		if (operation === 'modify') return 'name';
		return 'password';
	};

	focusInputById(getFocusInputId());
</script>

<form onsubmit={formExecute}>
	<Modal
		closedby="none"
		dismissable={false}
		oncancel={() => dispatch('resolve', { isOk: false })}
		open
		outsideclose={false}
		size={getModalSize()}
	>
		{#snippet header()}
			<div class="flex justify-between gap-4">
				{getModalTitle()}
				{#if $stateInProgress}
					<Badge color="green">Saving...</Badge>
				{:else if $stateError}
					<Badge color="red">{$stateError?.message || ''}</Badge>
				{/if}
			</div>
		{/snippet}

		{#if operation === 'create'}
			<div class="grid grid-cols-2 gap-4">
				<FormInput
					id="userName"
					inProgress={$stateInProgress}
					mandatory
					title="Username"
					validity={($stateIsValid as any)?.user?.userName}
					bind:value={formData.userName}
				/>
				<FormInput
					id="name"
					inProgress={$stateInProgress}
					mandatory
					title="Name"
					validity={($stateIsValid as any)?.user?.name}
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
						validity={($stateIsValid as any)?.user?.password}
						bind:value={formData.password}
					/>
					<FormInput
						id="password2"
						inProgress={$stateInProgress}
						mandatory
						title="Password again"
						type="password"
						validity={($stateIsValid as any)?.user?.password2}
						bind:value={formData.password2}
					/>
					<PasswordStrengthIndicator password={formData.password as string} />
					<Button color="light" onclick={generateRandomPassword} size="xs">Generate password</Button
					>
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
		{:else if operation === 'modify'}
			<div class="flex flex-col gap-4">
				<FormLabel mandatory text={user!.userName} title="Username" />
				<FormInput
					id="name"
					inProgress={$stateInProgress}
					mandatory
					title="Name"
					validity={($stateIsValid as any)?.user?.name}
					bind:value={formData.name}
				/>
				<FormUserPermissionEditor
					inProgress={$stateInProgress}
					mandatory
					title="Assigned permissions"
					validity={($stateIsValid as any)?.user?.permissions}
					bind:permissions={formData.permissions}
				/>
			</div>
		{:else if operation === 'setPassword'}
			<div class="flex flex-col gap-4">
				<FormLabel mandatory text={user!.userName} title="Username" />
				<FormInput
					id="password"
					inProgress={$stateInProgress}
					mandatory
					title="Password"
					type="password"
					validity={($stateIsValid as any)?.user?.password}
					bind:value={formData.password}
				/>
				<FormInput
					id="password2"
					inProgress={$stateInProgress}
					mandatory
					title="Password again"
					type="password"
					validity={($stateIsValid as any)?.user?.password2}
					bind:value={formData.password2}
				/>
				<PasswordStrengthIndicator password={formData.password as string} />
				<Button color="light" onclick={generateRandomPassword} size="xs">Generate password</Button>
				<FormToggle
					inProgress={$stateInProgress}
					inline
					title="Must change password"
					bind:checked={formData.mustChangePassword}
				/>
			</div>
		{/if}

		<div class="mt-4 flex justify-center space-x-4">
			<Button
				class="w-30 whitespace-nowrap"
				disabled={!$stateAllValid || $stateInProgress}
				onclick={() => formExecute()}
			>
				{getButtonText()}
			</Button>
			<Button class="w-30" color="alternative" onclick={() => dispatch('resolve', { isOk: false })}
				>Cancel</Button
			>
		</div>
	</Modal>
</form>
