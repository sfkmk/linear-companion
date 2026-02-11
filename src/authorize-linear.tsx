import { authorize } from './lib/linear-client';
import { showToast, Toast } from '@raycast/api';

export default async function Command() {
  try {
    await authorize();
    await showToast({ style: Toast.Style.Success, title: 'Authorized Linear' });
  } catch (error) {
    await showToast({
        style: Toast.Style.Failure,
        title: 'Authorization failed',
        message: error instanceof Error ? error.message : String(error)
    });
  }
}
