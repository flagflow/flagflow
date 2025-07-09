<script lang="ts" module>
	import ModalNewFlag from './ModalNewFlag.svelte';

	export const showModalNewFlag = async () => modalHandler.show({ component: ModalNewFlag });
</script>

<script lang="ts">
	import { Badge, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import Stepper from '$components/Stepper.svelte';
	import { focusInputById, FormLogic, StringValidator } from '$lib/form.svelte';
	import { modalHandler } from '$lib/modals';
	//import { rpcClient } from '$lib/rpc/client';
	import type { EtcdFlag } from '$types/etcd';
	import { EtcdFlagKey } from '$types/etcd';

	import NameAndType from './components/NameAndType.svelte';
	import Welcome from './components/Welcome.svelte';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	const flag: EtcdFlag & { name: string } = {
		name: '',
		description: '',
		type: 'BOOLEAN',
		defaultValue: false,
		isKillSwitch: false,
		value: false
	};

	const {
		formData,
		formExecute,
		formState: { stateInProgress, stateError, stateAllValid, stateIsValid }
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
				return {
					flag: {
						name: new StringValidator(source.name, 'trim')
							.required()
							.maxLength(128)
							.zod(EtcdFlagKey).error,
						description: new StringValidator(source.description, 'trim').maxLength(128).error
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
			steps={['Welcome', 'Name & Type', 'Schema', 'Value']}
		>
			{#snippet content1Welcome()}
				{$stateAllValid}
				<Welcome />
			{/snippet}

			{#snippet content2Type()}
				<NameAndType
					validity={$stateIsValid?.flag}
					bind:name={formData.name}
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
