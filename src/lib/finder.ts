import { execFile } from 'child_process';
import { promisify } from 'util';

import { runAppleScript } from '@raycast/utils';

const execFileAsync = promisify(execFile);

/**
 * Escapes a string for use in an MDQuery string literal.
 * In MDQuery, backslashes are escaped by doubling them and double quotes are escaped by a backslash.
 */
export function escapeMDQueryString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Searches for folders whose name starts with the given Issue ID within the root directory.
 * Uses mdfind (Spotlight) for instant results.
 */
export async function findIssueFolder(issueId: string, rootDir: string): Promise<string[]> {
  // mdfind query:
  // kMDItemContentType == "public.folder" -> only folders
  // kMDItemFSName == "issueId*" -> prefix match (supports folders like "ENG-123 Feature Name")
  // -onlyin -> restrict scope
  const escapedIssueId = escapeMDQueryString(issueId);
  const query = `kMDItemContentType == "public.folder" && kMDItemFSName == "${escapedIssueId}*"`;

  console.log(`[Linear Companion] Searching in: ${rootDir}`);
  console.log(`[Linear Companion] Query: ${query}`);

  try {
    const { stdout } = await execFileAsync('mdfind', ['-onlyin', rootDir, query]);
    const results = stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    console.log(`[Linear Companion] Found ${results.length} results:`, results);
    return results;
  } catch (error) {
    console.error('Spotlight search failed:', error);
    throw new Error('Failed to search file system.');
  }
}

/**
 * Finds all folders that look like Linear Issue folders (start with ID-123).
 */
export async function findAllIssueFolders(rootDir: string): Promise<{ path: string; issueId: string }[]> {
  const query = `kMDItemContentType == "public.folder" && kMDItemFSName == "*-[0-9]*"`;

  try {
    const { stdout } = await execFileAsync('mdfind', ['-onlyin', rootDir, query]);
    const paths = stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const results: { path: string; issueId: string }[] = [];
    const issueIdRegex = /\b([A-Z]{2,5}-\d{1,5})\b/;

    for (const path of paths) {
      const folderName = path.split('/').pop() || '';
      const match = folderName.match(issueIdRegex);
      if (match) {
        results.push({ path, issueId: match[1] });
      }
    }

    return results;
  } catch (error) {
    console.error('Spotlight search failed:', error);
    throw new Error('Failed to scan file system.');
  }
}

/**
 * Escapes a string for use in an AppleScript string literal.
 * It escapes backslashes and double quotes.
 */
export function escapeAppleScriptString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Opens a folder in Finder using AppleScript to ensure it grabs focus.
 */
export async function openFolderInFinder(path: string) {
  const escapedPath = escapeAppleScriptString(path);
  await runAppleScript(`
    tell application "Finder"
      activate
      open POSIX file "${escapedPath}"
    end tell
  `);
}
