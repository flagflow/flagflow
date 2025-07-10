<script lang="ts">
	import { Heading, Li, List } from 'flowbite-svelte';
</script>

<Heading class="mt-4 text-center text-xl font-bold">Welcome to Flag Creation</Heading>
<div class=" text-gray-500">
	<p>
		Let's get started on setting up your new feature flag. This process will guide you through
		defining its core properties.
	</p>
	<br />
	<p>Please follow these steps on the upcoming pages:</p>
	<List class="space-y-1 text-gray-500 dark:text-gray-400" tag="ul">
		<Li><b>Name Your Flag:</b> Begin by giving your flag a clear and descriptive name.</Li>
		<Li
			><b>Define Type & Schema:</b>
			<List class="mt-0 space-y-1 ps-5" tag="ol">
				<Li
					>Choose the type of data your flag will hold (e.g., boolean, string, number, or object).</Li
				>
				<Li>If you select object, you'll then need to specify its detailed schema (structure).</Li>
			</List>
		</Li>
		<Li
			><b>Set a Default Value:</b> Provide an initial value for your flag that precisely matches the
			type and schema you've defined. This value will be used if no specific override is applied.</Li
		>
	</List>
	<br />
	<p>
		<b>Optionally, if you have the necessary permissions</b>, you will also be able to set the
		<b>current active value</b> for the flag.
	</p>
	<br />
	<p class="text-right">Click "Next" to begin!</p>
</div>
