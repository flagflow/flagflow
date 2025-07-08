<script lang="ts" module>
	import ModalNewFlag from './ModalNewFlag.svelte';

	export const showModalNewFlag = async () => {
		const user = {
			userName: 'user@company.com',
			name: 'John Doe',
			password: '',
			password2: '',
			roles: ['flagflow-viewer'] as UserRole[],
			mustChangePassword: true
		};

		return modalHandler.show({
			component: ModalNewFlag,
			props: {
				user
			}
		});
	};
</script>

<script lang="ts">
	import { Badge, Heading, Hr, Li, List, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import FormInput from '$components/form/FormInput.svelte';
	import FormToggle from '$components/form/FormToggle.svelte';
	import FormUserRoleEditor from '$components/form/FormUserRoleEditor.svelte';
	import PasswordStrengthIndicator from '$components/PasswordStrengthIndicator.svelte';
	import Stepper from '$components/Stepper.svelte';
	import { ArrayValidator, focusInputById, FormLogic, StringValidator } from '$lib/form.svelte';
	import { modalHandler } from '$lib/modals';
	import { rpcClient } from '$lib/rpc/client';
	import { EtcdUserKey } from '$types/etcd';
	import { type UserRole } from '$types/userRoles';

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
						name: new StringValidator(source.name, 'trim').required().maxLength(100).error,
						roles: new ArrayValidator(source.roles).required().error
					}
				};
			}
		}
	);

	focusInputById('userName');
</script>

<form onsubmit={formExecute}>
	<Modal
		class="min-h-[600px]"
		dismissable={false}
		onclose={() => dispatch('resolve', { isOk: false })}
		permanent
		size="lg"
	>
		{#snippet header()}
			<div class="flex justify-between">
				New flag
				{#if $stateInProgress}
					<Badge color="green">Saving...</Badge>
				{:else if $stateError}
					<Badge color="red">{$stateError?.message || ''}</Badge>
				{/if}
			</div>
		{/snippet}

		<Stepper
			disabled={!$stateAllValid || $stateInProgress}
			finishOperation="Create flag"
			onclose={() => dispatch('resolve', { isOk: false })}
			onfinish={() => formExecute()}
			steps={['Welcome', 'Type', 'Schema', 'Value']}
		>
			{#snippet content1Welcome()}
				<Heading class="mt-4 text-center text-xl font-bold">Welcome to Flag Creation</Heading>
				<div class=" text-gray-500">
					<p>
						Let's get started on setting up your new feature flag. This process will guide you
						through defining its core properties.
					</p>
					<br />
					<p>Please follow these steps on the upcoming pages:</p>
					<List class="space-y-1 text-gray-500 dark:text-gray-400" tag="ul">
						<Li><b>Name Your Flag:</b> Begin by giving your flag a clear and descriptive name.</Li>
						<Li
							><b>Define Type & Schema:</b>
							<List class="mt-0 space-y-1 ps-5" tag="ol">
								<Li
									>Choose the type of data your flag will hold (e.g., boolean, string, number, or
									object).</Li
								>
								<Li>
									If you select object, you'll then need to specify its detailed schema (structure).
								</Li>
							</List>
						</Li>
						<Li
							><b>Set a Default Value:</b> Provide an initial value for your flag that precisely matches
							the type and schema you've defined. This value will be used if no specific override is
							applied.</Li
						>
					</List>
					<br />
					<p>
						<b>Optionally, if you have the necessary permissions</b>, you will also be able to set
						the <b>current active value</b> for the flag.
					</p>
					<br />
					<p class="text-right">Click "Next" to begin!</p>
				</div>
			{/snippet}

			{#snippet content2Type()}
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
							bind:value={formData.password}
						/>
						<FormInput
							id="password2"
							inProgress={$stateInProgress}
							mandatory
							title="Password again"
							type="password"
							bind:value={formData.password2}
						/>
						<PasswordStrengthIndicator password={formData.password} />
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
							validity={$stateIsValid?.user.roles}
							bind:roles={formData.roles}
						/>
					</div>
				</div>
			{/snippet}

			{#snippet content3Schema()}
				C
			{/snippet}
			{#snippet content4Value()}
				C
			{/snippet}
		</Stepper>
	</Modal>
</form>
