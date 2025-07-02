type HierarchyItem = { id: number; parentId: number | null };
type HierarchyTreeItem<T extends HierarchyItem> = T & { children: HierarchyTreeItem<T>[] };

export const buildHierarchy = <T extends HierarchyItem>(items: T[]): HierarchyTreeItem<T>[] => {
	const map = new Map<number, HierarchyTreeItem<T>>();
	const roots: HierarchyTreeItem<T>[] = [];

	for (const item of items) map.set(item.id, { ...item, children: [] });

	for (const item of items)
		if (item.parentId) {
			const parent = map.get(item.parentId);
			if (parent) parent.children.push(map.get(item.id)!);
		} else roots.push(map.get(item.id)!);

	return roots;
};
