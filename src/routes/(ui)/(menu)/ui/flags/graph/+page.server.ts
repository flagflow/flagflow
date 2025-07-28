import { formatFlagApiResponseJson } from '$lib/server/flagApiFormatter';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { container } }) => {
	const flagService = container.resolve('flagService');
	const flags = await flagService.getFlags('');

	const json = formatFlagApiResponseJson(flags);

	const mermaidData: string[] = ['mindmap', '  flags((Flags))'];
	const objectToMermaid = (object: Record<string, unknown>, indent: number): void => {
		for (const [key, value] of Object.entries(object))
			if (typeof value === 'object' && value !== null) {
				mermaidData.push('  '.repeat(indent) + key + '(' + key + ')');
				objectToMermaid(value as Record<string, unknown>, indent + 1);
			} else mermaidData.push('  '.repeat(indent) + key);
	};
	objectToMermaid(json as Record<string, unknown>, 2);

	return {
		mermaidData: mermaidData.join('\n')
	};
};
