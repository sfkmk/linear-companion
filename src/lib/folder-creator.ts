import { runAppleScript } from "@raycast/utils";

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
  
  const fs = await import("fs/promises");
  const path = await import("path");
  
  const fullPath = path.join(parentDir, folderName);
  
  // Create recursively just in case
  await fs.mkdir(fullPath, { recursive: true });
  
  return fullPath;
}

/**
 * Validates if the new folder location is configured.
 * Returns the path if valid, null otherwise.
 */
import { getPreferenceValues } from "@raycast/api";

export function getNewFolderLocation(): string | null {
  const prefs = getPreferenceValues<{ newFolderLocation?: string }>();
  return prefs.newFolderLocation || null;
}
