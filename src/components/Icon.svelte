<script lang="ts" module>
	import { loadIcons } from '@iconify/svelte';

	export const IconIds = {
		dashboard: 'mdi:view-dashboard',
		flag: 'mdi:flag',
		export: 'mdi:export',
		user: 'mdi:user',
		session: 'mdi:user-group',

		login: 'mdi:login',
		logout: 'mdi:logout',
		email: 'mdi:email',
		keycloak: 'simple-icons:keycloak',
		password: 'mdi:eye-off',
		passwordVisible: 'mdi:eye',

		arrowLeft: 'mdi:chevron-left',
		arrowRight: 'mdi:chevron-right',
		arrowUp: 'mdi:chevron-up',
		arrowDown: 'mdi:chevron-down',
		arrowLeftCircle: 'mdi:arrow-left-drop-circle',
		arrowRightCircle: 'mdi:arrow-right-drop-circle',
		arrowUpCircle: 'mdi:arrow-up-drop-circle',
		arrowDownCircle: 'mdi:arrow-down-drop-circle',
		arrowLeftCircleOutline: 'mdi:arrow-left-drop-circle-outline',
		arrowRightCircleOutline: 'mdi:arrow-right-drop-circle-outline',
		arrowUpCircleOutline: 'mdi:arrow-up-drop-circle-outline',
		arrowDownCircleOutline: 'mdi:arrow-down-drop-circle-outline',
		scrollToTop: 'mdi:arrow-up-bold-circle-outline',
		formatListBulleted: 'mdi:format-list-bulleted',
		formatListNumbered: 'mdi:format-list-numbered',
		formatGrid: 'mdi:grid',
		formatListExpanded: 'mdi:format-list-text',
		formatListCompact: 'mdi:format-list-group',
		question: 'mdi:question-mark',
		copy: 'mdi:content-copy',
		copyOk: 'mdi:clipboard-check',
		externalLink: 'mdi:external-link',

		add: 'mdi:plus',
		edit: 'mdi:edit',
		delete: 'mdi:delete',
		close: 'mdi:close',
		dots: 'mdi:dots-horizontal',
		dotsVertical: 'mdi:dots-vertical',
		search: 'mdi:search',
		noPermission: 'mdi:do-not-disturb-on',
		sortAlphabeticalAscending: 'mdi:sort-alphabetical-ascending',
		sortAlphabeticalDescending: 'mdi:sort-alphabetical-descending',
		sortNumericAscending: 'mdi:sort-numeric-ascending',
		sortNumericDescending: 'mdi:sort-numeric-descending',
		changingValue: 'mdi:track-changes',
		download: 'mdi:download',
		upload: 'mdi:upload',
		uploadNetwork: 'mdi:upload-network',
		restore: 'mdi:restore-clock',
		migration: 'mdi:database-import',
		online: 'mdi:server-network',
		ban: 'mdi:ban',
		enable: 'mdi:check',

		boolean: 'mdi:toggle-switch',
		killswitch: 'mdi:shield-key',
		integer: 'mdi:numeric',
		string: 'mdi:format-text',
		object: 'mdi:bracket',
		enum: 'mdi:format-list-bulleted-type',
		tag: 'mdi:tag',
		abTest: 'mdi:ab-testing',

		check: 'mdi:checkbox-outline',
		error: 'mdi:error',
		warning: 'mdi:warning',
		information: 'mdi:information'
	};
	export type IconId = keyof typeof IconIds;

	loadIcons(Object.values(IconIds));
</script>

<script lang="ts">
	import Icon from '@iconify/svelte';
	import clsx from 'clsx';

	interface Properties {
		id: IconId;
		class?: string;
		align?: 'left' | 'right';
		size?: number;
		color?: string;
		onclick?: () => void;
	}
	const { id, class: aClass = '', align, size = 20, color = '', onclick }: Properties = $props();

	const cls = clsx(aClass, { 'mr-2': align === 'left', 'ml-2': align === 'right' });
</script>

<Icon class={cls} {color} icon={IconIds[id]} {onclick} width={size} />
