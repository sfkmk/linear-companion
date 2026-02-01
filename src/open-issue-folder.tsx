import {
  showToast,
  Toast,
  closeMainWindow,
  getPreferenceValues,
  launchCommand,
  LaunchType,
  openExtensionPreferences,
} from '@raycast/api';

import { findIssueFolder, openFolderInFinder } from './lib/finder';
import { buildIssueFolderName, createIssueFolder, getNewFolderLocation } from './lib/folder-creator';
import { getLinearWindowTitle, parseLinearTitle } from './lib/linear';

interface Preferences {
  searchDirectory?: string;
  autoCreateFolders?: boolean;
}

export default async function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const searchDir = preferences.searchDirectory || '~';
  const autoCreateFolders = preferences.autoCreateFolders ?? false;

  try {
    // 1. Check if Linear is active/viewed
    const title = await getLinearWindowTitle();

    if (!title) {
      await showToast({
        style: Toast.Style.Failure,
        title: 'Linear not found',
        message: 'Is the app running and open?',
      });
      return;
    }

    // 2. Parse ID and Title
    const parsed = parseLinearTitle(title);
    if (!parsed) {
      await showToast({
        style: Toast.Style.Failure,
        title: 'No Issue ID found',
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
        title: 'Opened Folder',
        message: results[0],
      });
      await closeMainWindow();
      return;
    }

    // Auto-create missing folder if enabled
    if (results.length === 0 && autoCreateFolders) {
      const newFolderLocation = getNewFolderLocation();

      if (!newFolderLocation) {
        await showToast({
          style: Toast.Style.Failure,
          title: 'Configuration Required',
          message: "Set 'New Folder Location' in preferences.",
          primaryAction: {
            title: 'Open Preferences',
            onAction: () => {
              openExtensionPreferences();
            },
          },
        });
        return;
      }

      const folderName = buildIssueFolderName(issueId, issueTitle);
      const newPath = await createIssueFolder(newFolderLocation, folderName);
      await openFolderInFinder(newPath);
      await showToast({
        style: Toast.Style.Success,
        title: 'Created Folder',
        message: newPath,
      });
      await closeMainWindow();
      return;
    }

    // Ambiguous or Missing Path: Launch UI
    // We launch the 'query-issue-folder' command passing the context.
    await launchCommand({
      name: 'query-issue-folder',
      type: LaunchType.UserInitiated,
      arguments: {
        issueId,
      },
      context: {
        foundPaths: results,
        issueTitle,
      },
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: 'Something went wrong',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
