import { showToast, Toast, closeMainWindow, getPreferenceValues } from "@raycast/api";
import { getLinearWindowTitle, extractIssueId } from "../services/linear";
import { findIssueFolder, openFolderInFinder } from "../services/finder";

interface Preferences {
  searchDirectory: string;
}

export default async function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const searchDir = preferences.searchDirectory;

  try {
    // 1. Check if Linear is active/viewed
    const title = await getLinearWindowTitle();
    
    if (!title) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Linear not found",
        message: "Is the app running and open?",
      });
      return;
    }

    // 2. Extract ID
    const issueId = extractIssueId(title);
    if (!issueId) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No Issue ID found",
        message: `Current title: "${title}"`,
      });
      return;
    }

    // 3. Search for Folder
    // Optimistic toast
    await showToast({
      style: Toast.Style.Animated,
      title: `Searching for ${issueId}...`,
    });

    const results = await findIssueFolder(issueId, searchDir);

    if (results.length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Folder not found",
        message: `No folder named "${issueId}" in search path.`,
      });
      return;
    }

    if (results.length > 1) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Multiple matches found",
        message: `Found ${results.length} folders named "${issueId}".`,
      });
      // Future: Show a list to pick from
      return;
    }

    // 4. Success -> Open
    await openFolderInFinder(results[0]);
    await showToast({
      style: Toast.Style.Success,
      title: "Opened Folder",
      message: results[0],
    });
    
    await closeMainWindow();

  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Something went wrong",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
