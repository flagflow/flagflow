<script lang="ts" module>
	import ModalNewFlag from './ModalNewFlag.svelte';

	export const showModalNewFlag = async () => modalHandler.show({ component: ModalNewFlag });
</script>

<script lang="ts">
	import { Badge, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import Stepper from '$components/Stepper.svelte';
	import { focusInputById, FormLogic, isValidValidator, StringValidator } from '$lib/form.svelte';
	import { modalHandler } from '$lib/modals';
	//import { rpcClient } from '$lib/rpc/client';
	import type { EtcdFlag } from '$types/etcd';
	import { EtcdFlagKey } from '$types/etcd';

	import New1Welcome from './components/New1Welcome.svelte';
	import New2NameAndType from './components/New2NameAndType.svelte';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	const steps = ['Welcome', 'Name & Type', 'Schema', 'Value'];

	const flag: EtcdFlag & { name: string } = {
		name: '',
		description: '',
		type: 'BOOLEAN',
		defaultValue: false,
		isKillSwitch: false,
		value: false
	};

	let currentStepIndex = $state(0);
	const canForward = $state([true, false, false, false]);

	const {
		formData,
		formExecute,
		formState: { stateInProgress, stateError, stateIsValid }
	} = new FormLogic(
		flag,
		async () => {
			// await rpcClient.user.create.mutate({
			// 	key: formData.userName,
			// 	...formData
			// });
			dispatch('resolve', { isOk: true });
		},
		{
			validator: (source) => {
				const name = new StringValidator(source.name, 'trim')
					.required()
					.maxLength(128)
					.zod(EtcdFlagKey).error;
				const description = new StringValidator(source.description, 'trim').maxLength(128).error;

				canForward[1] = isValidValidator({ name, description });
				canForward[2] = true;
				canForward[3] = isValidValidator({ name, description });

				return {
					name,
					description
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
			{canForward}
			disabled={$stateInProgress}
			finishOperation="Create flag"
			onclose={() => dispatch('resolve', { isOk: false })}
			onfinish={() => formExecute()}
			{steps}
			bind:currentStepIndex
		>
			{#snippet content1Welcome()}
				<New1Welcome />
			{/snippet}

			{#snippet content2Type()}
				{formData.type}
				<New2NameAndType
					validity={$stateIsValid}
					bind:name={formData.name}
					bind:type={formData.type}
					bind:description={formData.description}
				/>
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
