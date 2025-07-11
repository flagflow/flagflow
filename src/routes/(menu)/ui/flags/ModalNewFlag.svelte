<script lang="ts" module>
	import ModalNewFlag from './ModalNewFlag.svelte';

	export const showModalNewFlag = async (groupName = '') =>
		modalHandler.show({ component: ModalNewFlag, props: { groupName } });
</script>

<script lang="ts">
	import { Badge, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Writable } from 'svelte/store';

	import Stepper from '$components/Stepper.svelte';
	import { flagSchemaValidator, flagValueValidator } from '$lib/flagValidator';
	import {
		ExternalValidator,
		FormLogic,
		isValidValidator,
		StringValidator,
		type Validator,
		type ValidityItem
	} from '$lib/form.svelte';
	import { modalHandler } from '$lib/modals';
	import { rpcClient } from '$lib/rpc/client';
	import type { EtcdFlag, EtcdFlagType } from '$types/etcd';
	import { EtcdFlagKey } from '$types/etcd';
	import {
		EMPTY_BOOLEAN_FLAG,
		EMPTY_ENUM_FLAG,
		EMPTY_INTEGER_FLAG,
		EMPTY_STRING_FLAG
	} from '$types/etcd/flagEmptyInstance';

	import StepSchemaAndValue from './/StepSchemaAndValue.svelte';
	import StepNameAndType from './StepNameAndType.svelte';
	import StepNewWelcome from './StepNewWelcome.svelte';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	interface Properties {
		groupName: string;
	}
	const { groupName }: Properties = $props();

	const steps = ['Welcome', 'Name & Type', 'Schema & Value'];
	let currentStepIndex = $state(0);
	const canForwardStep = $state([true, false, false]);

	// Flag states
	const flagCommon: {
		name: string;
		description: string;
		type: EtcdFlagType;
	} = {
		name: groupName ? groupName + '/' : '',
		description: '',
		type: 'BOOLEAN'
	};

	let flagSpecific: EtcdFlag | undefined;
	let formSpecific:
		| FormLogic<
				EtcdFlag,
				{
					schema: Validator | ValidityItem;
					value: Validator | ValidityItem;
				},
				object
		  >
		| undefined = $state();
	let formStateIsvalid: Writable<
		| {
				schema: Validator | ValidityItem;
				value: Validator | ValidityItem;
		  }
		| undefined
	>;

	// Create flag
	const createSpecificFlag = (flagType: EtcdFlagType) => {
		flagSpecific = undefined;
		switch (flagType) {
			case 'BOOLEAN':
				{
					flagSpecific = {
						...EMPTY_BOOLEAN_FLAG,
						description: flagCommon.description
					};
				}
				break;
			case 'INTEGER':
				{
					flagSpecific = {
						...EMPTY_INTEGER_FLAG,
						description: flagCommon.description
					};
				}
				break;
			case 'STRING':
				{
					flagSpecific = {
						...EMPTY_STRING_FLAG,
						description: flagCommon.description
					};
				}
				break;
			case 'ENUM':
				{
					flagSpecific = {
						...EMPTY_ENUM_FLAG,
						description: flagCommon.description
					};
				}
				break;
			default:
				throw new Error(`Unsupported flag type: ${flagType}`);
		}
		formSpecific = new FormLogic(flagSpecific, async () => {}, {
			validator: (source) => {
				const schema = new ExternalValidator(flagSchemaValidator(source)).error;
				const value = new ExternalValidator(flagValueValidator(source)).error;

				canForwardStep[2] = stateAllValid && isValidValidator({ schema, value });

				return {
					schema,
					value
				};
			}
		});
		formStateIsvalid = formSpecific.formState.stateIsValid;
	};

	const {
		formData,
		formExecute,
		formState: { stateInProgress, stateError, stateIsValid, stateAllValid }
	} = new FormLogic(
		flagCommon,
		async () => {
			if (!formSpecific) throw new Error('Flag data is not initialized');
			await rpcClient.flag.create.mutate({
				key: formData.name,
				flag: {
					...formSpecific.formData,
					description: formData.description
				}
			});
			dispatch('resolve', { isOk: true });
		},
		{
			validator: (source) => {
				const name = new StringValidator(source.name, 'trim')
					.required()
					.maxLength(128)
					.zod(EtcdFlagKey).error;
				const description = new StringValidator(source.description, 'trim').maxLength(512).error;

				canForwardStep[1] = isValidValidator({ name, description });

				return {
					name,
					description
				};
			},
			changed: (target, property: string) => {
				if (property === 'type') createSpecificFlag(target.type);
			}
		}
	);

	createSpecificFlag(flagCommon.type);
</script>

<form onsubmit={formExecute}>
	<Modal
		class="min-h-[570px]"
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
			canForward={canForwardStep}
			disabled={$stateInProgress}
			finishOperation="Create flag"
			onclose={() => dispatch('resolve', { isOk: false })}
			onfinish={() => formExecute()}
			{steps}
			bind:currentStepIndex
		>
			{#snippet content1Welcome()}
				<StepNewWelcome />
			{/snippet}

			{#snippet content2Type()}
				<StepNameAndType
					validity={$stateIsValid}
					bind:name={formData.name}
					bind:type={formData.type}
					bind:description={formData.description}
				/>
			{/snippet}

			{#snippet content3Schema()}
				{#if formSpecific}
					<StepSchemaAndValue
						name={formData.name}
						flag={formSpecific.formData}
						validity={$formStateIsvalid}
					/>
				{/if}
			{/snippet}
		</Stepper>
	</Modal>
</form>
