<script lang="ts">
	import Icon from './icon/Icon.svelte';

	interface Properties {
		sensitivity?: number;
	}

	const { sensitivity = 250 }: Properties = $props();

	let hidden = $state(true);

	const goTop = () => document.body.scrollIntoView({ behavior: 'smooth' });
	const handleOnScroll = () => {
		const scrollContainer = document.documentElement || document.body;
		if (!scrollContainer) return;

		hidden = scrollContainer.scrollTop < sensitivity;
	};
</script>

<svelte:window onscroll={handleOnScroll} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="back-to-top flex cursor-pointer" class:hidden onclick={goTop}>
	Scroll to top
	<Icon id="scrollToTop" align="right" />
</div>

<style>
	.back-to-top {
		opacity: 0.5;
		position: fixed;
		z-index: 99;
		right: 20px;
		user-select: none;
		bottom: 20px;
		color: white;
		background-color: orangered;
		padding: 4px 8px;
		border-radius: 6px;
	}

	.back-to-top.hidden {
		opacity: 0;
	}
	.back-to-top:hover {
		opacity: 0.9;
	}
</style>
