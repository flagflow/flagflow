<script lang="ts">
	import { passwordStrength } from 'check-password-strength';
	import { Progressbar } from 'flowbite-svelte';
	import { sineOut } from 'svelte/easing';

	interface Properties {
		password: string;
	}

	let { password }: Properties = $props();

	let strength = $state(passwordStrength(password));
	$effect(() => {
		strength = passwordStrength(password);
	});
</script>

<div class="flex gap-4">
	<span class="-mt-2 min-w-16 text-nowrap">{strength.value}</span>
	<Progressbar
		class="col-span-3"
		animate
		color={strength.id < 2 ? 'red' : strength.id < 3 ? 'yellow' : 'green'}
		easing={sineOut}
		progress={(strength.id + 1) * 25}
		size="h-2"
		tweenDuration={750}
	/>
</div>
