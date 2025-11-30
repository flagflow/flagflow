/* eslint-disable unicorn/no-null */
import { describe, expect, it } from 'vitest';

import { buildHierarchy } from './hierarchy';

describe('hierarchy', () => {
	describe('buildHierarchy', () => {
		it('should build simple hierarchy tree', () => {
			const items = [
				{ id: 1, parentId: null, name: 'Root' },
				{ id: 2, parentId: 1, name: 'Child 1' },
				{ id: 3, parentId: 1, name: 'Child 2' }
			];

			const result = buildHierarchy(items);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(1);
			expect(result[0].name).toBe('Root');
			expect(result[0].children).toHaveLength(2);
			expect(result[0].children[0].id).toBe(2);
			expect(result[0].children[1].id).toBe(3);
		});

		it('should build multiple root nodes', () => {
			const items = [
				{ id: 1, parentId: null, name: 'Root 1' },
				{ id: 2, parentId: null, name: 'Root 2' },
				{ id: 3, parentId: 1, name: 'Child of Root 1' }
			];

			const result = buildHierarchy(items);

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe(1);
			expect(result[1].id).toBe(2);
			expect(result[0].children).toHaveLength(1);
			expect(result[1].children).toHaveLength(0);
		});

		it('should build deep nested hierarchy', () => {
			const items = [
				{ id: 1, parentId: null, name: 'Root' },
				{ id: 2, parentId: 1, name: 'Level 1' },
				{ id: 3, parentId: 2, name: 'Level 2' },
				{ id: 4, parentId: 3, name: 'Level 3' }
			];

			const result = buildHierarchy(items);

			expect(result).toHaveLength(1);
			expect(result[0].children[0].children[0].children[0].id).toBe(4);
			expect(result[0].children[0].children[0].children[0].name).toBe('Level 3');
		});

		it('should handle empty input', () => {
			const result = buildHierarchy([]);
			expect(result).toEqual([]);
		});

		it('should handle orphaned nodes', () => {
			const items = [
				{ id: 1, parentId: null, name: 'Root' },
				{ id: 2, parentId: 999, name: 'Orphaned' } // Parent doesn't exist
			];

			const result = buildHierarchy(items);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(1);
			expect(result[0].children).toHaveLength(0);
		});

		it('should handle circular references gracefully', () => {
			const items = [
				{ id: 1, parentId: 2, name: 'Node 1' },
				{ id: 2, parentId: 1, name: 'Node 2' }
			];

			const result = buildHierarchy(items);

			// Both nodes should end up with each other as children
			expect(result).toHaveLength(0); // No root nodes since both have parents
		});

		it('should preserve all properties from original items', () => {
			const items = [{ id: 1, parentId: null, name: 'Root', extra: 'data', count: 42 }];

			const result = buildHierarchy(items);

			expect(result[0].id).toBe(1);
			expect(result[0].name).toBe('Root');
			expect(result[0].extra).toBe('data');
			expect(result[0].count).toBe(42);
			expect(result[0].children).toEqual([]);
		});

		it('should handle mixed parentId types', () => {
			const items = [
				{ id: 1, parentId: null, name: 'Root' },
				{ id: 2, parentId: 1, name: 'Child with number parent' }
			];

			const result = buildHierarchy(items);

			expect(result).toHaveLength(1);
			expect(result[0].children).toHaveLength(1);
			expect(result[0].children[0].id).toBe(2);
		});

		it('should handle large hierarchies efficiently', () => {
			const items = [];
			for (let index = 1; index <= 1000; index++)
				items.push({
					id: index,
					parentId: index === 1 ? null : Math.floor(index / 2),
					name: `Node ${index}`
				});

			const result = buildHierarchy(items);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(1);
			// Should build complete binary tree structure
			expect(result[0].children).toHaveLength(2);
		});
	});
});
