<script lang="ts">
	import { getContext, type Snippet } from 'svelte';

	interface Properties {
		class?: string;
		enabled?: boolean | undefined;
		oneditclick?: () => Promise<void>;
		children: Snippet;
	}

	const { class: aClass = '', enabled = true, oneditclick, children }: Properties = $props();

	const inplaceClickModeSingle = getContext<boolean>('InplaceClickModeSingle');

	let inprogress = false;
	const clickEvent = async () => {
		if (!inplaceClickModeSingle) return;
		if (!oneditclick) return;
		if (inprogress) return;
		inprogress = true;
		try {
			await oneditclick();
		} finally {
			inprogress = false;
		}
	};
	const dblClickEvent = async () => {
		if (inplaceClickModeSingle) return;
		if (!oneditclick) return;
		if (inprogress) return;
		inprogress = true;
		try {
			await oneditclick();
		} finally {
			inprogress = false;
		}
	};
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
	class={'px-3 py-0 ' + aClass}
	class:cursor-text={oneditclick && enabled}
	class:hover:bg-slate-100={oneditclick && enabled}
	onclick={clickEvent}
	ondblclick={dblClickEvent}
>
	{@render children()}
</span>
