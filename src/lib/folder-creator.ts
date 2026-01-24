import { getPreferenceValues } from '@raycast/api';
import { removeEmojis } from '../utils/text-utils';

interface Preferences {
  newFolderLocation?: string;
  allowEmojis?: boolean;
}

/**
 * Creates a folder at the specified location and opens it.
 * @param parentDir The directory where the new folder will live.
 * @param folderName The name of the new folder (e.g., "ENG-123 Fix Login").
 * @returns The absolute path of the created folder.
 */
export async function createIssueFolder(parentDir: string, folderName: string): Promise<string> {
  // Use AppleScript to creating the folder to ensure Finder refreshes immediately
  // and we handle permissions via "Finder" context if needed, though simple 'mkdir'
  // is often faster. However, let's use 'mkdir' for reliability and speed in Node,
  // then just 'open' it.

  const fs = await import('fs/promises');
  const path = await import('path');

  const normalizedName = folderName.trim();
  const fullPath = path.join(parentDir, normalizedName);

  let exists = false;

  try {
    await fs.stat(fullPath);
    exists = true;
  } catch (error) {
    const errno = (error as NodeJS.ErrnoException).code;
    if (errno !== 'ENOENT') {
      throw error;
    }
  }

  if (exists) {
    throw new Error('Folder already exists');
  }

  // Create recursively just in case
  await fs.mkdir(fullPath, { recursive: true });

  return fullPath;
}

/**
 * Builds a suggested folder name from an issue ID and title.
 * Falls back to the issue ID if the title is empty.
 */
export function buildIssueFolderName(issueId: string, issueTitle: string, separator = ' '): string {
  const cleanTitle = issueTitle.trim();
  const preferences = getPreferenceValues<Preferences>();
  const allowEmojis = preferences.allowEmojis ?? false;
  const finalTitle = allowEmojis ? cleanTitle : removeEmojis(cleanTitle);
  return finalTitle ? `${issueId}${separator}${finalTitle}` : issueId;
}

/**
 * Validates if the new folder location is configured.
 * Returns the path if valid, null otherwise.
 */
export function getNewFolderLocation(): string | null {
  const prefs = getPreferenceValues<Preferences>();
  return prefs.newFolderLocation || null;
}
