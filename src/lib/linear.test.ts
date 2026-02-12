import { expect, test, describe, mock } from 'bun:test';

// Mock @raycast/utils as it's not available in the environment and depends on AppleScript
mock.module('@raycast/utils', () => ({
  runAppleScript: async () => '',
}));

import { parseLinearTitle, extractIssueId } from './linear';

describe('parseLinearTitle', () => {
  test('should parse standard ID and title', () => {
    const result = parseLinearTitle('ENG-123 Fix login bug');
    expect(result).toEqual({ id: 'ENG-123', title: 'Fix login bug' });
  });

  test('should parse ID and title with " - " separator', () => {
    const result = parseLinearTitle('ENG-123 - Fix login bug');
    expect(result).toEqual({ id: 'ENG-123', title: 'Fix login bug' });
  });

  test('should parse title with "Linear - " prefix', () => {
    const result = parseLinearTitle('Linear - ENG-123 Fix login bug');
    expect(result).toEqual({ id: 'ENG-123', title: 'Fix login bug' });
  });

  test('should parse title with "Linear - " prefix and " - " separator', () => {
    const result = parseLinearTitle('Linear - ENG-123 - Fix login bug');
    expect(result).toEqual({ id: 'ENG-123', title: 'Fix login bug' });
  });

  test('should handle ID only', () => {
    const result = parseLinearTitle('ENG-123');
    expect(result).toEqual({ id: 'ENG-123', title: '' });
  });

  test('should handle ID with trailing spaces', () => {
    const result = parseLinearTitle('ENG-123   ');
    expect(result).toEqual({ id: 'ENG-123', title: '' });
  });

  test('should handle various ID lengths (2-5 letters, 1-5 digits)', () => {
    expect(parseLinearTitle('AB-1')?.id).toBe('AB-1');
    expect(parseLinearTitle('ABCDE-12345')?.id).toBe('ABCDE-12345');
  });

  test('should return null for invalid ID format (too few letters)', () => {
    expect(parseLinearTitle('A-123')).toBeNull();
  });

  test('should return null for invalid ID format (too many letters)', () => {
    expect(parseLinearTitle('ABCDEF-123')).toBeNull();
  });

  test('should return null for invalid ID format (too many digits)', () => {
    expect(parseLinearTitle('ENG-123456')).toBeNull();
  });

  test('should return null for lowercase ID', () => {
    expect(parseLinearTitle('eng-123')).toBeNull();
  });

  test('should return null if no ID is present', () => {
    expect(parseLinearTitle('Fix login bug')).toBeNull();
  });

  test('should handle ID in the middle of text (though rare in window titles)', () => {
    const result = parseLinearTitle('Working on ENG-123 now');
    expect(result).toEqual({ id: 'ENG-123', title: 'now' });
  });
});

describe('extractIssueId', () => {
  test('should extract ID from valid title', () => {
    expect(extractIssueId('ENG-123 Fix bug')).toBe('ENG-123');
  });

  test('should return null if no ID is found', () => {
    expect(extractIssueId('No ID here')).toBeNull();
  });
});
