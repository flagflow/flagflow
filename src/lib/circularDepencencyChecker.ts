export const circularDepencencyChecker = (
	graph: Record<string, string[]>
): string[] | undefined => {
	const visited = new Set<string>();
	const recStack = new Set<string>();
	const path: string[] = [];

	function dfs(node: string): string[] | undefined {
		if (recStack.has(node)) {
			const cycleStartIndex = path.indexOf(node);
			return [...path.slice(cycleStartIndex), node];
		}
		if (visited.has(node)) return;

		visited.add(node);
		recStack.add(node);
		path.push(node);

		for (const neighbor of graph[node] || []) {
			const cycle = dfs(neighbor);
			if (cycle) return cycle;
		}

		recStack.delete(node);
		path.pop();
		return;
	}

	for (const node in graph)
		if (!visited.has(node)) {
			const cycle = dfs(node);
			if (cycle) return cycle;
		}
};
