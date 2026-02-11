import { showToast, Toast, openExtensionPreferences, launchCommand, LaunchType } from '@raycast/api';
import { BacklinkResult } from './backlinker';

export async function handleBacklinkResult(result: BacklinkResult) {
  if (result.status === 'created' || result.status === 'updated') {
    await showToast({
      style: Toast.Style.Success,
      title: result.status === 'created' ? 'Backlink Created' : 'Backlink Updated',
      message: result.url,
    });
  } else if (result.status === 'error') {
    const msg = result.message || 'Unknown error';
    const isAuthError = msg.includes('Authentication required') || msg.includes('Client ID missing');

    await showToast({
      style: Toast.Style.Failure,
      title: 'Backlink Failed',
      message: msg,
      primaryAction: isAuthError ? {
        title: 'Connect Linear',
        onAction: async () => {
             try {
                 await launchCommand({ name: 'authorize-linear', type: LaunchType.UserInitiated });
             } catch {
                 openExtensionPreferences();
             }
        }
      } : undefined
    });
  }
}
