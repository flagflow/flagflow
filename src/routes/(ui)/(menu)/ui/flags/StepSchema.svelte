<script lang="ts">
	import { Button, Helper } from 'flowbite-svelte';
	import { SvelteMap } from 'svelte/reactivity';

	import FormInput from '$components/form/FormInput.svelte';
	import FormLabel from '$components/form/FormLabel.svelte';
	import FormMultiSelect from '$components/form/FormMultiSelect.svelte';
	import FormSelect from '$components/form/FormSelect.svelte';
	import FormSlider from '$components/form/FormSlider.svelte';
	import FormTag from '$components/form/FormTag.svelte';
	import FormTextarea from '$components/form/FormTextarea.svelte';
	import FormToggle from '$components/form/FormToggle.svelte';
	import { showModalInformation } from '$components/modal/ModalInformation.svelte';
	import { flagValueToString } from '$lib/flagHandler/flagToString';
	import {
		convertStringsToSelectInput,
		focusInputById,
		type Validator,
		type ValidityItem
	} from '$lib/form.svelte';
	import type { PersistentFlag } from '$types/persistent';

	interface Properties {
		name: string;
		flag: PersistentFlag;
		headers?: boolean;

		validity?:
			| {
					schema: Validator | ValidityItem;
			  }
			| undefined;
	}
	let { name, flag, headers = false, validity }: Properties = $props();

	const regexpExamples = [
		['^v[0-9]+.[0-9]+$', 'Version format like "v1.2", "v2.0"'],
		['^release_[0-9]{4}_[0-9]{2}$', 'Release format like "release_2024_01"'],
		['^user_[0-9]+$', 'Any string starting with "user_" followed by numbers'],
		['.*_user$', 'Any string ending with "user" '],
		['^test_.*_(control|variant)$', 'Test groups'],
		['^(dev|staging)_feature_[a-z_]+_v[0-9]+$', 'Environment + feature + version']
	];

	const runABSimulation = (flag: PersistentFlag) => {
		const ITERATIONS = 1000;
		const values: SvelteMap<string, number> = new SvelteMap();
		for (let index = 0; index < ITERATIONS; index++) {
			const valueString = String(flagValueToString(flag).value);
			values.set(valueString, (values.get(valueString) ?? 0) + 1);
		}
		showModalInformation(
			`AB simulation ${ITERATIONS} iterations`,
			`A: ${values.get('A') ?? 0}<br />B: ${values.get('B') ?? 0}`,
			{ size: 'sm', align: 'left' }
		);
	};

	focusInputById('default');
</script>

<div class="flex flex-col gap-4">
	{#if headers}
		<FormLabel class="trimmed-content" mandatory text={name} title="Name" tooltip />
		<FormLabel mandatory text={flag.type} title="Type" />
		<hr />
	{/if}
	{#if flag.type === 'BOOLEAN'}
		<FormToggle id="default" mandatory title="Default value" bind:checked={flag.defaultValue} />
		<FormToggle title="Kill switch" bind:checked={flag.isKillSwitch} />
	{:else if flag.type === 'INTEGER'}
		<FormInput id="default" title="Default value" type="number" bind:value={flag.defaultValue} />
		<div class="grid grid-cols-2 gap-4">
			<FormInput title="Minimum value" type="number" bind:value={flag.minValue} />
			<FormInput title="Maximum value" type="number" bind:value={flag.maxValue} />
		</div>
	{:else if flag.type === 'STRING'}
		<FormInput id="default" title="Default value" type="text" bind:value={flag.defaultValue} />
		<div class="grid grid-cols-3 gap-4">
			<FormInput minNumber={0} title="Maximum length" type="number" bind:value={flag.maxLength} />
			<FormInput
				class="col-span-2"
				postButton={{
					text: '?',
					onclick: () =>
						showModalInformation(
							'Regular expression examples',
							regexpExamples
								.map(([regex, description]) => `**${regex}**: ${description}`)
								.join('<br />'),
							{ size: 'md', align: 'left' }
						),
					color: 'light'
				}}
				postText="/g"
				preText="/"
				title="Regular expression"
				type="text"
				bind:value={flag.regExp}
			/>
		</div>
	{:else if flag.type === 'OBJECT'}
		<FormTextarea id="schema" rows={5} title="Schema" bind:value={flag.schema} />
		<FormTextarea id="default" rows={5} title="Default value" bind:value={flag.defaultValue} />
	{:else if flag.type === 'ENUM'}
		<FormTag
			id="default"
			class="mt-5 mb-3"
			allowSort
			title="Enum values"
			bind:tags={flag.enumValues}
		/>
		<FormSelect
			items={convertStringsToSelectInput(
				flag.enumValues,
				flag.allowEmpty ? { name: '[Not set]', value: '' } : undefined
			)}
			title="Default value"
			bind:value={flag.defaultValue}
		/>
		<FormToggle title="Allow no selection" bind:checked={flag.allowEmpty} />
	{:else if flag.type === 'TAG'}
		<FormTag
			id="default"
			class="mt-5 mb-3"
			allowSort
			title="Tag values"
			bind:tags={flag.tagValues}
		/>
		<FormMultiSelect
			items={convertStringsToSelectInput(flag.tagValues)}
			title="Default value"
			bind:value={flag.defaultValue}
		/>
		<div class="grid grid-cols-2 gap-4">
			<FormInput minNumber={0} title="Minimum count" type="number" bind:value={flag.minCount} />
			<FormInput minNumber={0} title="Maximum count" type="number" bind:value={flag.maxCount} />
		</div>
	{:else if flag.type === 'AB-TEST'}
		<FormSlider
			id="default"
			class="mt-5 mb-3"
			mandatory
			maxValue={100}
			minValue={0}
			step={1}
			title="The percentage chance of option B"
			bind:value={flag.chanceBPercent}
		/>
		<div class="grid grid-cols-2 gap-4 text-center">
			<div>A = <span class="font-bold">{100 - flag.chanceBPercent} %</span></div>
			<div>B = <span class="font-bold">{flag.chanceBPercent} %</span></div>
		</div>
		<div class="mt-8 flex items-center justify-center">
			<Button class="w-fit" color="alternative" onclick={() => runABSimulation(flag)}
				>Run AB simulation</Button
			>
		</div>
	{/if}
	{#if validity?.schema.message}
		<Helper class="text-red-700">{validity.schema.message}</Helper>
	{/if}
</div>
