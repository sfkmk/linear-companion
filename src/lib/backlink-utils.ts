import { BacklinkResult } from './backlinker';

export function describeBacklinkResult(result: BacklinkResult): string | null {
  switch (result.status) {
    case 'created':
      return 'Backlink created';
    case 'updated':
      return 'Backlink updated';
    case 'skipped':
      return 'Backlink already up to date';
    case 'disabled':
      return 'Backlinking disabled';
    case 'error': {
      const message = result.message || 'Unknown error';
      return `Backlink failed: ${message}`;
    }
    default:
      return null;
  }
}
