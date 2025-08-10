<script lang="ts">
	import clsx from 'clsx';
	import { Alert } from 'flowbite-svelte';

	import Icon from './Icon.svelte';

	interface Properties {
		class?: string;
	}

	const { class: aClass = '' }: Properties = $props();
</script>

<Alert class={clsx('items-start', aClass)} color="red">
	{#snippet icon()}<span>
			<Icon id="error" />
			<span class="sr-only">Warning</span>
		</span>
	{/snippet}
	<p class="font-medium">
		Default user with predefined password detected. Please update or remove it to ensure security:
	</p>
	<ul class="ms-4 mt-1.5 list-inside list-disc">
		<li>Remove user after creation of <strong>new user</strong></li>
		<li>Change password <strong>to something secure</strong></li>
		<li>Remove ENV variables <strong>related to the default user</strong></li>
	</ul>
</Alert>
