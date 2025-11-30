export const circularDependencyChecker = (
	graph: Record<string, string[]>
): string[] | undefined => {
	const visited = new Set<string>();
	const recStack = new Set<string>();
	const path: string[] = [];

	const dfs = (node: string): string[] | undefined => {
		if (recStack.has(node)) {
			const cycleStartIndex = path.indexOf(node);
			return [...path.slice(cycleStartIndex), node];
		}
		if (visited.has(node)) return;

		visited.add(node);
		recStack.add(node);
		path.push(node);

		const neighbors = graph[node];
		if (neighbors)
			for (const neighbor of neighbors) {
				const cycle = dfs(neighbor);
				if (cycle) return cycle;
			}

		recStack.delete(node);
		path.pop();
	};

	for (const node of Object.keys(graph))
		if (!visited.has(node)) {
			const cycle = dfs(node);
			if (cycle) return cycle;
		}
};
