import {
  Action,
  ActionPanel,
  Form,
  showToast,
  Toast,
  closeMainWindow,
  getPreferenceValues,
  PopToRootType,
} from '@raycast/api';
import React, { useState } from 'react';
import { createIssueFolder } from '../lib/folder-creator';
import { openFolderInFinder } from '../lib/finder';
import { removeEmojisPreserveSpaces } from '../utils/text-utils';

interface CreateFolderFormProps {
  parentDir: string;
  issueId: string;
  initialName: string;
  navigationTitle: string;
}

interface Preferences {
  allowEmojis?: boolean;
}

export function CreateFolderForm({ parentDir, issueId, initialName, navigationTitle }: CreateFolderFormProps) {
  const preferences = getPreferenceValues<Preferences>();
  const allowEmojis = preferences.allowEmojis ?? false;
  const sanitizeName = (value: string) => (allowEmojis ? value : removeEmojisPreserveSpaces(value));
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(() => sanitizeName(initialName).trimStart());
  const [separator, setSeparator] = useState(' ');

  const trimmedName = name.trim();
  const preview = trimmedName ? `${issueId}${separator}${trimmedName}` : issueId;

  const handleNameChange = (value: string) => {
    setName(sanitizeName(value));
  };

  async function handleSubmit() {
    if (!trimmedName) {
      await showToast({
        style: Toast.Style.Failure,
        title: 'Folder name required',
        message: 'Enter a name to create the folder.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const newPath = await createIssueFolder(parentDir, preview);
      await openFolderInFinder(newPath);
      await showToast({
        style: Toast.Style.Success,
        title: 'Created Folder',
        message: newPath,
      });
      await closeMainWindow({ popToRootType: PopToRootType.Immediate });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: 'Failed to create folder',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      navigationTitle={navigationTitle}
      actions={
        <ActionPanel>
          <Action title="Create Folder" onAction={handleSubmit} />
        </ActionPanel>
      }
      isLoading={isLoading}
    >
      <Form.Description title="Preview" text={preview} />
      <Form.TextField
        id="folderName"
        title="Name"
        value={name}
        onChange={handleNameChange}
        placeholder="Enter folder name"
        autoFocus
      />
      <Form.Dropdown id="separator" title="Separator" value={separator} onChange={setSeparator}>
        <Form.Dropdown.Item value=" " title="Space" />
        <Form.Dropdown.Item value="-" title="Hyphen" />
        <Form.Dropdown.Item value="." title="Period" />
      </Form.Dropdown>
    </Form>
  );
}
