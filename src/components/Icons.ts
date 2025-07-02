import { loadIcons } from '@iconify/svelte';

export const Icons = {
	customer: 'mdi:account',
	supplier: 'mdi:truck',
	partner: 'mdi:account',
	product: 'mdi:cube',
	productPack: 'mdi:cube-scan',
	service: 'mdi:hammer',
	customerOrder: 'mdi:cart',
	customer_order: 'mdi:cart',
	customerDelivery: 'mdi:cart-check',
	customer_delivery: 'mdi:cart-check',
	supplierOrder: 'mdi:truck-delivery',
	supplier_order: 'mdi:truck-delivery',
	supplierInvoice: 'mdi:truck-check',
	supplier_invoice: 'mdi:truck-check',
	assembly: 'mdi:assembly',
	inventory: 'mdi:warehouse',
	mrp: 'mdi:floor-plan',

	category: 'mdi:category',
	report: 'mdi:file-chart',
	graph: 'mdi:graph',
	settings: 'mdi:cog',

	logo: 'mdi:hexagon-slice-1',
	login: 'mdi:login',
	email: 'mdi:email',
	password: 'mdi:eye-off',
	passwordVisible: 'mdi:eye',

	warehouse: 'mdi:warehouse',
	error: 'mdi:error',
	warning: 'mdi:warning',
	information: 'mdi:information'
};

loadIcons(Object.values(Icons));
