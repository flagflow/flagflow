import { describe, expect, it } from 'vitest';

import { xmlAddFileHeader } from './xml';

describe('xml', () => {
	describe('xmlAddFileHeader', () => {
		it('should add XML file header to content', () => {
			const content = '<root><item>test</item></root>';
			const result = xmlAddFileHeader(content);
			expect(result).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<root><item>test</item></root>');
		});

		it('should handle empty content', () => {
			const result = xmlAddFileHeader('');
			expect(result).toBe('<?xml version="1.0" encoding="UTF-8"?>\n');
		});

		it('should handle multi-line content', () => {
			const content = '<root>\n  <item>test</item>\n</root>';
			const result = xmlAddFileHeader(content);
			expect(result).toBe(
				'<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item>test</item>\n</root>'
			);
		});

		it('should not duplicate header if already exists', () => {
			const content = '<?xml version="1.0"?>\n<root></root>';
			const result = xmlAddFileHeader(content);
			expect(result).toBe(
				'<?xml version="1.0" encoding="UTF-8"?>\n<?xml version="1.0"?>\n<root></root>'
			);
		});
	});
});
