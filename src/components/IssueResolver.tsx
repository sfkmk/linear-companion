import {
  Action,
  ActionPanel,
  List,
  Icon,
  showToast,
  Toast,
  openExtensionPreferences,
  closeMainWindow,
  useNavigation,
  getPreferenceValues,
} from '@raycast/api';
import React, { useState } from 'react';

import { handleBacklinkResult } from '../lib/backlink-utils';
import { ensureBacklink } from '../lib/backlinker';
import { openFolderInFinder } from '../lib/finder';
import { buildIssueFolderName, createIssueFolder, getNewFolderLocation } from '../lib/folder-creator';

import { CreateFolderForm } from './CreateFolderForm';

interface IssueResolverProps {
  issueId: string;
  issueTitle: string;
  foundPaths: string[]; // Can be empty
  isLoading?: boolean;
  isManual?: boolean;
}

interface Preferences {
  autoBacklinkOnCreate?: boolean;
}

export function IssueResolver({
  issueId,
  issueTitle,
  foundPaths,
  isLoading = false,
  isManual = false,
}: IssueResolverProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { push } = useNavigation();
  const displayTitle = issueTitle.trim() || issueId;
  const suggestedName = buildIssueFolderName(issueId, issueTitle);
  const preferences = getPreferenceValues<Preferences>();
  const autoBacklinkOnCreate = preferences.autoBacklinkOnCreate ?? true;

  if (isLoading) {
    return <List isLoading navigationTitle={`Searching: ${issueId}`} />;
  }

  // 1. Case: Multiple Results
  if (foundPaths.length > 0) {
    return (
      <List navigationTitle={`Resolve: ${issueId}`} searchBarPlaceholder="Filter folders...">
        <List.Section title={`Found ${foundPaths.length} matches for ${issueId}`}>
          {foundPaths.map((path) => (
            <List.Item
              key={path}
              title={path.split('/').pop() || path}
              subtitle={path}
              icon={Icon.Folder}
              actions={
                <ActionPanel>
                  <Action
                    title="Open Folder"
                    icon={Icon.Finder}
                    onAction={async () => {
                      await openFolderInFinder(path);
                      await closeMainWindow();
                    }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      </List>
    );
  }

  // 2. Case: No Results -> Create Folder
  async function ensureNewFolderLocation(): Promise<string | null> {
    const parentDir = getNewFolderLocation();

    if (!parentDir) {
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
      return null;
    }

    return parentDir;
  }

  async function handleCreateDefaultFolder() {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const parentDir = await ensureNewFolderLocation();
      if (!parentDir) return;

      const newPath = await createIssueFolder(parentDir, suggestedName);
      await openFolderInFinder(newPath);

      if (autoBacklinkOnCreate) {
        await showToast({ style: Toast.Style.Animated, title: 'Creating backlink...' });
        const result = await ensureBacklink(issueId);
        await handleBacklinkResult(result);
        if (result.status === 'skipped' || result.status === 'disabled') {
            await showToast({
                style: Toast.Style.Success,
                title: 'Created Folder',
                message: newPath,
            });
        }
      } else {
        await showToast({
            style: Toast.Style.Success,
            title: 'Created Folder',
            message: newPath,
        });
      }

      await closeMainWindow();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: 'Failed to create folder',
        message: String(error),
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCreateCustomFolder() {
    const parentDir = await ensureNewFolderLocation();
    if (!parentDir) return;

    const defaultName = issueTitle.trim();

    push(
      <CreateFolderForm
        parentDir={parentDir}
        issueId={issueId}
        initialName={defaultName}
        navigationTitle={`Create: ${displayTitle}`}
      />
    );
  }

  const createDefaultAction = (
    <Action title="Create Suggested Folder" icon={Icon.Plus} onAction={handleCreateDefaultFolder} />
  );

  const createCustomAction = (
    <Action title="Create Custom Folder" icon={Icon.Pencil} onAction={handleCreateCustomFolder} />
  );

  return (
    <List navigationTitle={`Create: ${issueId}`}>
      <List.EmptyView
        icon={Icon.Folder}
        title={`No folder found for ${displayTitle}`}
        description={`Suggested name: "${suggestedName}"`}
        actions={
          <ActionPanel>
            {isManual ? createCustomAction : createDefaultAction}
            {isManual ? createDefaultAction : createCustomAction}
            <Action title="Open Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
          </ActionPanel>
        }
      />
    </List>
  );
}
