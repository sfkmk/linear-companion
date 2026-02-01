import { showToast, Toast, Clipboard } from '@raycast/api';

import { getLinearWindowTitle, extractIssueId } from './lib/linear';

export default async function Command() {
  try {
    const title = await getLinearWindowTitle();

    if (!title) {
      await showToast({
        style: Toast.Style.Failure,
        title: 'Linear not found',
        message: 'Is the app running and open?',
      });
      return;
    }

    const issueId = extractIssueId(title);
    if (!issueId) {
      await showToast({
        style: Toast.Style.Failure,
        title: 'No Issue ID found',
        message: `Current title: "${title}"`,
      });
      return;
    }

    await Clipboard.copy(issueId);
    await showToast({
      style: Toast.Style.Success,
      title: 'Copied to Clipboard',
      message: issueId,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: 'Failed to copy',
      message: String(error),
    });
  }
}
