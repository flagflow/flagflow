<script lang="ts" module>
	import type {
		BooleanKeys,
		NullableArrayStringKeys,
		NullableBooleanKeys,
		NullableDateKeys,
		NullableNumberKeys,
		NullableStringKeys,
		NumberKeys,
		StringKeys,
		TypeKeys
	} from '$lib/typeEx';

	type SortableTypeKeys<T> = TypeKeys<T, string | number | Date>;
	type Align = 'left' | 'center' | 'right';
	type CommandColor = 'red' | 'blue' | 'green' | 'black';
	const commandColors: Record<CommandColor, string> = {
		red: 'text-orange-700',
		blue: 'text-blue-700',
		green: 'text-green-700',
		black: 'text-gray-700'
	};
	export type IndicatorColors =
		| 'primary'
		| 'secondary'
		| 'green'
		| 'emerald'
		| 'red'
		| 'blue'
		| 'yellow'
		| 'orange'
		| 'gray'
		| 'teal'
		| 'cyan'
		| 'sky'
		| 'indigo'
		| 'lime'
		| 'amber'
		| 'violet'
		| 'purple'
		| 'fuchsia'
		| 'pink'
		| 'rose';

	type AutoTableFilter<T, F> = {
		value: Writable<F>;
		filterFunction: (item: T, value: F) => boolean;
	};
	export const createDefaultTextFilter = (
		tableFilter: Writable<string>
	): AutoTableFilter<object, string> => ({
		value: tableFilter,
		filterFunction: (object: object, value: string) =>
			searchObjectStringField(
				object,
				value
					.split(' ')
					.map((f) => f.trim())
					.filter((f) => f.length >= 3)
			)
	});

	type AutoTableTotal<T> = {
		calcFunction: (data: T[]) => number | string;
		totalSign?: string;
		totalMetric?: string;
	};

	type ValueOrFunction<T, V> = V | ((row: T) => V);

	type Command<T> = {
		visible?: ValueOrFunction<T, boolean>;
		title?: ValueOrFunction<T, string>;
		tooltip?: ValueOrFunction<T, string>;
		icon?: ValueOrFunction<T, IconId>;
		color?: ValueOrFunction<T, CommandColor>;
		onCommand: (row: T) => void | Promise<void>;
	};

	type AutoTableColumn<T> = {
		mobileVisibility?: 'mobile' | 'always';
		visible?: boolean;
		href?: (row: T) => string;
		total?: AutoTableTotal<T>;
	};
	type AutoTableCheckboxColumn<T> = AutoTableColumn<T> & {
		checkbox: true;
		align: 'center';
		idProperty: NumberKeys<T>;
	};
	type AutoTableCommandColumn<T> = AutoTableColumn<T> & {
		align: 'right';
		commands: Command<T>[];
	};
	type AutoTablePropertyColumn<T> = AutoTableColumn<T> & {
		title: string;
		property: keyof T;
		align?: Align;
		textClass?: ValueOrFunction<T, string>;
	};
	type AutoTableSubColumn<T> = AutoTablePropertyColumn<T> & {
		property: NullableStringKeys<T>;
		subProperty?: NullableStringKeys<T> | NullableStringKeys<T>[];
		statusProperty?: NullableStringKeys<T>;
		tagsProperty?: NullableArrayStringKeys<T>;
		align?: 'left';
	};
	type AutoTableValueColumn<T> = AutoTablePropertyColumn<T> & {
		property: NullableNumberKeys<T>;
		subProperty: NullableNumberKeys<T>;
		align: 'right';
		metric?: string;
		metricProperty?: StringKeys<T>;
		forceSign?: boolean;
	};
	type AutoTableDateColumn<T> = AutoTablePropertyColumn<T> & {
		property: NullableDateKeys<T>;
		subProperty?: NullableStringKeys<T> | NullableStringKeys<T>[];
		align: 'left';
		dateFormat: string;
		indicatorColor?: ValueOrFunction<T, IndicatorColors | undefined>;
	};
	type AutoTableBooleanColumn<T> = AutoTablePropertyColumn<T> & {
		property: NullableBooleanKeys<T>;
		align: 'center';
		trueValue: string;
		falseValue: string;
	};
	type AutoTableTagColumn<T> = AutoTablePropertyColumn<T> & {
		property: NullableArrayStringKeys<T>;
		subProperty?: NullableStringKeys<T> | NullableStringKeys<T>[];
		statusProperty?: NullableStringKeys<T>;
		align: 'left';
		isTagLarge: boolean;
	};
	type AutoTableInfoColumn<T> = AutoTableColumn<T> & {
		align: 'left';
		calcInfoItems: (row: T) => (string | undefined)[];
	};
	type AutoTableCustomColumn<T> = AutoTablePropertyColumn<T> & {
		component: typeof AutoTableCustomCell;
	};
	export type ConfigAutoTableParameters<T> = {
		data: T[];
		columns: (
			| AutoTableCheckboxColumn<T>
			| AutoTableCommandColumn<T>
			| AutoTablePropertyColumn<T>
			| AutoTableSubColumn<T>
			| AutoTableValueColumn<T>
			| AutoTableDateColumn<T>
			| AutoTableBooleanColumn<T>
			| AutoTableTagColumn<T>
			| AutoTableCustomColumn<T>
			| AutoTableInfoColumn<T>
		)[];
		primary?: keyof T;
		sortables?: SortableTypeKeys<T>[];
		sortOrderDefaultDesc?: boolean;
		rowClass?: (row: T) => string;
		href?: (row: T) => string;
		onclick?: (row: T) => void;
		ondblclick?: (row: T) => void;
		preview?: {
			component: typeof AutoTablePreview;
			callback?: () => void;
		};
		//eslint-disable-next-line @typescript-eslint/no-explicit-any
		filters?: AutoTableFilter<T, any>[];
	};
	export const configAutoTable = <T extends object>(parameters: ConfigAutoTableParameters<T>) =>
		parameters;
	export type AutoTableDescriptor = ReturnType<typeof configAutoTable>;

	export const AutoTableTotals = {
		get TOTAL() {
			return {
				calcFunction: () => 'Total'
			};
		},

		count: <T,>(metric = 'items'): AutoTableTotal<T> => ({
			calcFunction: (data: T[]) => data.length,
			totalMetric: metric
		}),

		countTrue: <T,>(property: BooleanKeys<T>, metric: string = ''): AutoTableTotal<T> => ({
			calcFunction: (data: T[]) =>
				data.reduce((count, item) => count + (item[property] ? 1 : 0), 0),
			totalMetric: metric
		}),

		sum: <T,>(property: NullableNumberKeys<T>, metric: string = ''): AutoTableTotal<T> => ({
			calcFunction: (data: T[]) =>
				data.reduce((sum, item) => sum + ((item[property] ?? 0) as number), 0),
			totalMetric: metric
		}),

		avg: <T,>(property: NullableNumberKeys<T>, metric: string = ''): AutoTableTotal<T> => ({
			calcFunction: (data: T[]) =>
				data.length > 0
					? Math.round(
							data.reduce((sum, item) => sum + ((item[property] ?? 0) as number), 0) / data.length
						)
					: '',
			totalMetric: metric,
			totalSign: 'avg'
		}),

		min: <T,>(property: NullableNumberKeys<T>, metric: string = ''): AutoTableTotal<T> => ({
			calcFunction: (data: T[]) =>
				data.reduce((min, item) => Math.min(min, (item[property] ?? 0) as number), 0),
			totalMetric: metric,
			totalSign: 'min'
		}),

		max: <T,>(property: NullableNumberKeys<T>, metric: string = ''): AutoTableTotal<T> => ({
			calcFunction: (data: T[]) =>
				data.reduce((min, item) => Math.max(min, (item[property] ?? 0) as number), 0),
			totalMetric: metric,
			totalSign: 'max'
		})
	};
</script>

<script lang="ts">
	import { clsx } from 'clsx';
	import { format as dateFormat } from 'date-fns';
	import {
		Badge,
		Checkbox,
		Indicator,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Tooltip
	} from 'flowbite-svelte';
	import type { SvelteSet } from 'svelte/reactivity';
	import { derived, get, type Writable } from 'svelte/store';

	import AsyncButton from '$components/AsyncButton.svelte';
	import Icon from '$components/Icon.svelte';
	import { type IconId } from '$components/Icon.svelte';
	import { isStringArray, searchObjectStringField } from '$lib/objectEx';
	import { isStringStore } from '$lib/storeEx';
	import { trimEnd } from '$lib/stringEx';
	import { numberFormatter, numberFormatterSignDisplay } from '$lib/windowEx';

	import type AutoTableCustomCell from './AutoTableCustomCell.svelte';
	import type AutoTablePreview from './AutoTablePreview.svelte';

	interface Properties {
		descriptor: AutoTableDescriptor;
		selectedIds?: SvelteSet<number>;
		shadow?: boolean;
		border?: boolean;
		headClass?: string;
		footClass?: string;
	}

	let {
		descriptor,
		selectedIds = $bindable(),
		shadow = false,
		border = true,
		headClass = 'bg-slate-200',
		footClass = 'bg-slate-100'
	}: Properties = $props();

	/* Infinite scroll */
	const SCROLL_BATCH_SIZE = 50;
	const SCROLL_SENSITIVITY = 150;
	let scrollItemCount = $state(SCROLL_BATCH_SIZE);
	const onInfiniteScroll = () => {
		if (window.innerHeight + window.scrollY >= document.body.offsetHeight - SCROLL_SENSITIVITY)
			scrollItemCount += SCROLL_BATCH_SIZE;
		else if (window.scrollY <= SCROLL_SENSITIVITY) scrollItemCount = SCROLL_BATCH_SIZE;
	};

	/* Filter */
	const derivedFilters = descriptor.filters
		? derived(
				descriptor.filters.map((f) => f.value),
				($values) => {
					return descriptor.filters?.map((filter, index) => ({
						value: $values[index],
						filter: filter.filterFunction
					}));
				}
			)
		: undefined;
	derivedFilters?.subscribe(() => (scrollItemCount = SCROLL_BATCH_SIZE));

	/* Sort */
	let sortKey = $state<string>(descriptor.sortables?.at(0) ?? '');
	let sortDirection = $state(descriptor.sortOrderDefaultDesc ? -1 : 1);
	let sortItems = $state([...descriptor.data]);
	const sortTable = (key: string) => {
		if (sortKey === key) sortDirection = -sortDirection;
		else {
			sortKey = key;
			sortDirection = descriptor.sortOrderDefaultDesc ? -1 : 1;
		}
		scrollItemCount = SCROLL_BATCH_SIZE;
	};

	$effect(() => {
		previewId = undefined;
		//eslint-disable-next-line @typescript-eslint/no-unused-expressions
		$derivedFilters;
		const itemCount = scrollItemCount;
		const key = sortKey;
		const direction = sortDirection;

		let filtered = [...descriptor.data];
		for (const filter of descriptor.filters ?? [])
			filtered = filtered.filter((index) => filter.filterFunction(index, get(filter.value)));

		const sorted = filtered
			.sort((a, b) => {
				const aValue = a[key as SortableTypeKeys<typeof a>];
				const bValue = b[key as SortableTypeKeys<typeof b>];
				if (aValue < bValue) return -direction;
				if (aValue > bValue) return direction;
				return 0;
			})
			.slice(0, itemCount);
		sortItems = sorted;
	});

	/* Preview */
	let previewId: number | undefined = $state();
	const togglePreview = (id: number) => {
		previewId = previewId === id ? undefined : id;
	};

	/* Utils */
	const toTagArray = (data: unknown): string[] => (isStringArray(data) ? data : []).filter(Boolean);
</script>

<svelte:window onscroll={onInfiniteScroll} />

{#snippet tableSummaryRow(hasMobileColumn: boolean)}
	<tr class={footClass}>
		{#each descriptor.columns as column}
			{#if column.visible ?? true}
				{@const fixedWithColumn = 'idProperty' in column || 'commands' in column}
				<TableHeadCell
					class={clsx(
						column.align === 'center'
							? 'text-center'
							: column.align === 'right'
								? 'text-right'
								: '',
						fixedWithColumn ? 'w-0' : '',
						hasMobileColumn
							? column.mobileVisibility === 'mobile'
								? 'md:hidden'
								: column.mobileVisibility === 'always'
									? ''
									: 'hidden md:table-cell'
							: ''
					)}
				>
					{#if 'total' in column}
						{#if column.total.totalSign}
							<span class="text-xs font-light">{column.total.totalSign}</span>
						{/if}
						{@const totalValue = column.total.calcFunction(sortItems)}
						{#if typeof totalValue === 'number'}
							<span>{numberFormatter.format(totalValue)}</span>
						{:else}
							<span>{totalValue}</span>
						{/if}
						{#if column.total.totalMetric}
							<span class="font-light">{column.total.totalMetric}</span>
						{/if}
					{/if}
				</TableHeadCell>
			{/if}
		{/each}
	</tr>
{/snippet}

<Table class="border-b border-gray-200" {border} hoverable {shadow}>
	{@const hasMobileColumn = descriptor.columns.some((column) => !!column.mobileVisibility)}
	<TableHead class={headClass}>
		{#if 'preview' in descriptor && descriptor.preview}
			<TableHeadCell />
		{/if}
		{#each descriptor.columns as column}
			{#if column.visible ?? true}
				{@const propertyColumn = 'property' in column}
				{@const fixedWithColumn = 'checkbox' in column || 'commands' in column}
				<TableHeadCell
					class={clsx(
						propertyColumn && descriptor.sortables?.includes(column.property)
							? 'cursor-pointer'
							: '',
						column.align === 'center'
							? 'text-center'
							: column.align === 'right'
								? 'text-right'
								: '',
						fixedWithColumn ? 'w-0' : '',
						hasMobileColumn
							? column.mobileVisibility === 'mobile'
								? 'md:hidden'
								: column.mobileVisibility === 'always'
									? ''
									: 'hidden md:table-cell'
							: ''
					)}
					onclick={() => {
						if (propertyColumn && descriptor.sortables?.includes(column.property))
							sortTable(column.property);
					}}
				>
					{@const isSorted =
						propertyColumn &&
						descriptor.sortables?.includes(column.property) &&
						sortKey === column.property}
					{@const textClass =
						isSorted || !descriptor.sortables || descriptor.sortables.length === 0
							? 'uppercase'
							: 'normal-case'}
					{#if 'title' in column}
						<span class={textClass}>{column.title}</span>
					{/if}
					{#if 'checkbox' in column}
						<Checkbox
							checked={selectedIds !== undefined && selectedIds.size === descriptor.data.length}
							indeterminate={selectedIds !== undefined &&
								selectedIds.size > 0 &&
								selectedIds.size < descriptor.data.length}
							onclick={(event) => {
								event.stopPropagation();
								if (selectedIds !== undefined) {
									const isFull = selectedIds.size === descriptor.data.length;
									selectedIds.clear();
									if (!isFull)
										for (const dataRow of descriptor.data)
											selectedIds.add(dataRow[column.idProperty]);
								}
							}}
						/>
					{/if}
					{#if isSorted}
						<Icon
							id={sortDirection > 0 ? 'arrowDown' : 'arrowUp'}
							class="inline-flex text-gray-500"
							size={12}
						/>
					{/if}
				</TableHeadCell>
			{/if}
		{/each}
	</TableHead>

	<TableBody class="cursor-pointer divide-y">
		{#each sortItems as row, index}
			<TableBodyRow
				class={clsx('border-gray-200', 'rowClass' in descriptor ? descriptor.rowClass(row) : '')}
				onclick={() => {
					if ('onclick' in descriptor && descriptor.onclick) descriptor.onclick(row);
					else if ('preview' in descriptor && descriptor.preview) togglePreview(index);
				}}
				ondblclick={() => {
					if ('ondblclick' in descriptor && descriptor.ondblclick) descriptor.ondblclick(row);
				}}
			>
				{#if 'preview' in descriptor && descriptor.preview}
					<TableBodyCell class="px-0 pl-4">
						<Icon
							id={previewId === index ? 'arrowDownCircle' : 'arrowRightCircleOutline'}
							color="#bbb"
						/>
					</TableBodyCell>
				{/if}
				{#each descriptor.columns as column}
					{#if column.visible ?? true}
						<TableBodyCell
							class={clsx(
								'rowClass' in descriptor ? descriptor.rowClass(row) : '',
								column.align === 'center'
									? 'text-center'
									: column.align === 'right'
										? 'text-right'
										: '',
								hasMobileColumn
									? column.mobileVisibility === 'mobile'
										? 'md:hidden'
										: column.mobileVisibility === 'always'
											? ''
											: 'hidden md:table-cell'
									: ''
							)}
						>
							{@const href =
								'href' in column && column.href
									? column.href(row)
									: 'href' in descriptor && descriptor.href
										? descriptor.href(row)
										: undefined}
							<a data-sveltekit-preload-data="tap" href={href ?? 'javascript:void(0);'}>
								{#if 'component' in column}
									<column.component source={{ row, property: column.property }} />
								{:else if 'commands' in column}
									{#each column.commands as command}
										{@const visible =
											typeof command.visible === 'function'
												? command.visible(row)
												: (command.visible ?? true)}
										<AsyncButton
											class={clsx(
												'rounded-none',
												'unfocused',
												'px-1',
												commandColors[
													typeof command.color === 'function'
														? command.color(row)
														: (command.color ?? 'black')
												]
											)}
											action={async () => {
												if (visible) await command.onCommand(row);
											}}
											color="none"
										>
											{#if visible}
												{#if command.icon}
													<Icon
														id={typeof command.icon === 'function'
															? command.icon(row)
															: command.icon}
														class={command.title ? 'mr-1' : ''}
													/>
												{/if}
												{#if command.title}
													{typeof command.title === 'function' ? command.title(row) : command.title}
												{/if}
											{/if}
										</AsyncButton>
										{#if command.tooltip && visible}
											<Tooltip color="gray"
												>{typeof command.tooltip === 'function'
													? command.tooltip(row)
													: command.tooltip}</Tooltip
											>
										{/if}
									{/each}
								{:else if 'checkbox' in column}
									<Checkbox
										checked={selectedIds !== undefined && selectedIds.has(row[column.idProperty])}
										onclick={(event) => {
											event.stopPropagation();
											const id = row[column.idProperty];
											if (selectedIds !== undefined)
												if (selectedIds.has(id)) selectedIds.delete(id);
												else selectedIds.add(id);
										}}
									/>
								{:else if 'isTagLarge' in column}
									<div class="pt-1 pl-2 text-xs font-light">
										{#each toTagArray(row[column.property]) as tag}
											<button
												onclick={(event) => {
													event.stopPropagation();
													event.preventDefault();
													for (const filter of descriptor.filters ?? []) {
														if (isStringStore(filter.value)) filter.value.set(tag);
														break;
													}
												}}
											>
												<Badge
													class="mr-2 px-1.5 py-0.5"
													border
													color={tag.endsWith('!!')
														? 'red'
														: tag.endsWith('!')
															? 'yellow'
															: 'green'}
													large={column.isTagLarge}>{trimEnd(tag, '!')}</Badge
												>
											</button>
										{/each}
									</div>
								{:else if 'calcInfoItems' in column}
									{@const infoItems = column.calcInfoItems(row)}
									<span class="text-xs font-light">
										{#each infoItems as infoItem}
											{#if infoItem}
												<div>{infoItem}</div>
											{/if}
										{/each}
									</span>
								{:else}
									{@const value = row[column.property]}
									{@const textClass = clsx(
										column.property === descriptor.primary ? 'font-semibold' : '',
										'textClass' in column
											? typeof column.textClass === 'function'
												? column.textClass(row)
												: column.textClass
											: ''
									)}
									{#if value !== null && value !== undefined}
										{#if 'metric' in column || 'metricProperty' in column}
											<span class={textClass}>
												{#if 'forceSign' in column ? (column.forceSign ?? false) : false}
													{numberFormatterSignDisplay.format(value)}
												{:else}
													{numberFormatter.format(value)}
												{/if}
											</span>
											<span class="inline-flex min-w-6 text-sm font-extralight">
												{#if 'metric' in column}
													{column.metric}
												{:else if 'metricProperty' in column}
													{row[column.metricProperty]}
												{/if}
											</span>
											{#if 'subProperty' in column}
												<br />
												<span class={clsx(textClass, 'text-xs')}>
													{#if 'forceSign' in column ? (column.forceSign ?? false) : false}
														{numberFormatterSignDisplay.format(value)}
													{:else}
														{numberFormatter.format(value)}
													{/if}
												</span>
												<span class="inline-flex min-w-6 text-xs font-extralight">
													{#if 'metric' in column}
														{column.metric}
													{:else if 'metricProperty' in column}
														{row[column.metricProperty]}
													{/if}
												</span>
											{/if}
										{:else if 'trueValue' in column && 'falseValue' in column}
											<span class={textClass}>{value ? column.trueValue : column.falseValue}</span>
										{:else if 'dateFormat' in column}
											<span class={textClass}>{dateFormat(value, column.dateFormat)}</span>
											{#if 'indicatorColor' in column}
												{@const indicatorColor =
													typeof column.indicatorColor === 'function'
														? column.indicatorColor(row)
														: column.indicatorColor}
												{#if indicatorColor}
													<Indicator class="ml-1 inline-flex" color={indicatorColor} size="xs" />
												{/if}
											{/if}
											{#if 'subProperty' in column}
												{@const subProperties = Array.isArray(column.subProperty)
													? column.subProperty
													: [column.subProperty]}
												{#each subProperties as subProperty}
													{#if row[subProperty]}
														<div class="text-xs font-light">{row[subProperty]}</div>
													{/if}
												{/each}
											{/if}
										{:else}
											<span class="flex w-full justify-between">
												<span class={textClass}>{value}</span>
												{#if 'statusProperty' in column && row[column.statusProperty]}
													<span class="text-xs font-light">{row[column.statusProperty]}</span>
												{/if}
											</span>
											{#if 'subProperty' in column}
												{@const subProperties = Array.isArray(column.subProperty)
													? column.subProperty
													: [column.subProperty]}
												{#each subProperties as subProperty}
													{#if row[subProperty]}
														<div class="text-xs font-light">{row[subProperty]}</div>
													{/if}
												{/each}
											{/if}
											{#if 'tagsProperty' in column && row[column.tagsProperty] && toTagArray(row[column.tagsProperty]).length > 0}
												<div class="pt-1 pl-2 text-xs font-light">
													{#each toTagArray(row[column.tagsProperty]) as tag}
														<button
															onclick={(event) => {
																event.stopPropagation();
																event.preventDefault();
																for (const filter of descriptor.filters ?? []) {
																	if (isStringStore(filter.value)) filter.value.set(tag);
																	break;
																}
															}}
														>
															<Badge
																class="mr-2 px-1.5 py-0.5"
																border
																color={tag.endsWith('!!')
																	? 'red'
																	: tag.endsWith('!')
																		? 'yellow'
																		: 'green'}>{trimEnd(tag, '!')}</Badge
															>
														</button>
													{/each}
												</div>
											{/if}
										{/if}
									{/if}
								{/if}
							</a>
						</TableBodyCell>
					{/if}
				{/each}
			</TableBodyRow>
			{#if 'preview' in descriptor && descriptor.preview}
				{#if previewId === index}
					<TableBodyRow>
						<TableBodyCell />
						<TableBodyCell class="col-span-full p-0">
							<descriptor.preview.component callback={descriptor.preview.callback} {row} />
						</TableBodyCell>
					</TableBodyRow>
				{/if}
			{/if}
		{/each}
	</TableBody>

	{#if descriptor.columns.some((column) => column && 'total' in column && column.total)}
		<tfoot>
			{@render tableSummaryRow(hasMobileColumn)}
		</tfoot>
	{/if}
</Table>
