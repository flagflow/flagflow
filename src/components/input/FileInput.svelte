<script lang="ts">
	interface Properties {
		accept?: string;
	}
	const { accept = '' }: Properties = $props();

	type OnSelect = (filename: string, fileContent: string | undefined) => void;
	export const selectFile = (onSelect: OnSelect) => {
		_onSelect = onSelect;
		fileInput.value = '';
		fileInput.click();
	};

	let _onSelect: OnSelect | undefined;
	let fileInput: HTMLInputElement;

	const onchange = async (event: Event) => {
		try {
			const files = (event.target as HTMLInputElement).files;
			if (files && files.length > 0) _onSelect?.(files[0].name, await files[0].text());
		} catch {
			/**/
		}
	};
</script>

<input bind:this={fileInput} id="textFile" style="display: none;" {accept} {onchange} type="file" />
