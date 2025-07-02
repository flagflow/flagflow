<script lang="ts">
	import { apiClient } from '$lib/api/client';

	import type { PageProps as PageProperties } from './$types';

	const { data }: PageProperties = $props();
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-3"></div>
