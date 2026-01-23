import { exec } from 'child_process';
import { promisify } from 'util';
import { runAppleScript } from '@raycast/utils';

const execAsync = promisify(exec);

/**
 * Searches for a folder with the exact name of the Issue ID within the given root directory.
 * Uses mdfind (Spotlight) for instant results.
 */
export async function findIssueFolder(issueId: string, rootDir: string): Promise<string[]> {
  // mdfind query:
  // kMDItemContentType == "public.folder" -> only folders
  // kMDItemFSName == "issueId" -> exact name match (case insensitive usually, but good for ID)
  // -onlyin -> restrict scope

  // Changed to prefix match to support folders like "ENG-123 Feature Name"
  const query = `kMDItemContentType == "public.folder" && kMDItemFSName == "${issueId}*"`;

  console.log(`[Linear Companion] Searching in: ${rootDir}`);
  console.log(`[Linear Companion] Query: ${query}`);

  try {
    const { stdout } = await execAsync(`mdfind -onlyin "${rootDir}" '${query}'`);
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
 * Opens a folder in Finder using AppleScript to ensure it grabs focus.
 */
export async function openFolderInFinder(path: string) {
  await runAppleScript(`
    tell application "Finder"
      activate
      open POSIX file "${path}"
    end tell
  `);
}
