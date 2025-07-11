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

	edit: 'mdi:edit',
	delete: 'mdi:delete',
	close: 'mdi:close',
	dots: 'mdi:dots-horizontal',
	dotsVertical: 'mdi:dots-vertical',

	error: 'mdi:error',
	warning: 'mdi:warning',
	information: 'mdi:information'
};
export type IconId = keyof typeof IconIds;

loadIcons(Object.values(IconIds));
