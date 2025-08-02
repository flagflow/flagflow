<script lang="ts" module>
	import ModalNewFlag from './ModalNewFlag.svelte';

	export const showModalNewFlag = async (allowValueSet: boolean, groupName = '') =>
		modalHandler.show({ component: ModalNewFlag, props: { allowValueSet, groupName } });
</script>

<script lang="ts">
	import { Badge, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Writable } from 'svelte/store';

	import FormLabel from '$components/form/FormLabel.svelte';
	import Icon from '$components/Icon.svelte';
	import Stepper from '$components/Stepper.svelte';
	import { flagSchemaValidator, flagValueValidator } from '$lib/flagHandler/flagValidator';
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
		EMPTY_AB_FLAG,
		EMPTY_BOOLEAN_FLAG,
		EMPTY_ENUM_FLAG,
		EMPTY_INTEGER_FLAG,
		EMPTY_STRING_FLAG,
		EMPTY_TAG_FLAG
	} from '$types/etcd/flagEmptyInstance';

	import StepName from './StepName.svelte';
	import StepNewWelcome from './StepNewWelcome.svelte';
	import StepSchema from './StepSchema.svelte';
	import StepType from './StepType.svelte';
	import StepValue from './StepValue.svelte';

	const dispatch = createEventDispatcher<{
		resolve: { isOk: boolean };
	}>();

	interface Properties {
		allowValueSet: boolean;
		groupName: string;
	}
	const { allowValueSet, groupName }: Properties = $props();

	const steps = ['Welcome', 'Name & Type', 'Schema & Value'];
	let currentStepIndex = $state(groupName ? 1 : 0);
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
			case 'TAG':
				flagSpecific = {
					...EMPTY_TAG_FLAG,
					description: flagCommon.description
				};
				break;
			case 'AB-TEST':
				flagSpecific = {
					...EMPTY_AB_FLAG,
					description: flagCommon.description
				};
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
		closedby="none"
		dismissable={false}
		oncancel={() => dispatch('resolve', { isOk: false })}
		open
		outsideclose={false}
		size="lg"
	>
		{#snippet header()}
			<div class="flex justify-between gap-4">
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
				<div class="grid grid-cols-2 gap-4">
					<StepName
						validity={$stateIsValid}
						bind:name={formData.name}
						bind:description={formData.description}
					/>
					<StepType bind:type={formData.type} />
				</div>
			{/snippet}

			{#snippet content3Schema()}
				{#if formSpecific}
					<div class="grid grid-cols-2 gap-4">
						<FormLabel
							class="trimmed-content"
							mandatory
							text={formData.name}
							title="Name"
							tooltip
						/>
						<FormLabel mandatory text={formData.type} title="Type" />
					</div>
					<hr />
					<div class="grid min-h-80 grid-cols-2 gap-4">
						<StepSchema
							name={formData.name}
							flag={formSpecific.formData}
							validity={$formStateIsvalid}
						/>
						<div class="border-l-1 border-dashed">
							{#if allowValueSet}
								<StepValue
									name={formData.name}
									flag={formSpecific.formData}
									initial
									validity={$formStateIsvalid}
								/>
							{:else}
								<div class="flex flex-col items-center gap-8">
									<center>
										<Icon id="noPermission" class="text-gray-400" size={48} />
										<div class="mt-4 text-gray-500">
											Sorry, you cannot set flag value because of your permissions
										</div>
									</center>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			{/snippet}
		</Stepper>
	</Modal>
</form>
