import { showToast, Toast, closeMainWindow, getPreferenceValues, launchCommand, LaunchType } from "@raycast/api";
import { getLinearWindowTitle, parseLinearTitle } from "./lib/linear";
import { findIssueFolder, openFolderInFinder } from "./lib/finder";

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

    // 2. Parse ID and Title
    const parsed = parseLinearTitle(title);
    if (!parsed) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No Issue ID found",
        message: `Current title: "${title}"`,
      });
      return;
    }

    const { id: issueId, title: issueTitle } = parsed;

    // 3. Search for Folder
    await showToast({
      style: Toast.Style.Animated,
      title: `Searching for ${issueId}...`,
    });

    const results = await findIssueFolder(issueId, searchDir);

    // 4. Handle Results

    // Happy Path: Exactly one result
    if (results.length === 1) {
      await openFolderInFinder(results[0]);
      await showToast({
        style: Toast.Style.Success,
        title: "Opened Folder",
        message: results[0],
      });
      await closeMainWindow();
      return;
    }

    // Ambiguous or Missing Path: Launch UI
    // We launch the 'resolve-issue' command passing the context.
    await launchCommand({
      name: "resolve-issue",
      type: LaunchType.UserInitiated,
      arguments: {
        issueId,
        issueTitle,
      },
      context: {
        foundPaths: results,
      },
    });

  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Something went wrong",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
