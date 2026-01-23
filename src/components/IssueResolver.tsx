import { Action, ActionPanel, List, Icon, showToast, Toast, openExtensionPreferences, closeMainWindow } from "@raycast/api";
import React, { useState } from "react";
import { createIssueFolder, getNewFolderLocation } from "../lib/folder-creator";
import { openFolderInFinder } from "../lib/finder";

interface IssueResolverProps {
  issueId: string;
  issueTitle: string;
  foundPaths: string[]; // Can be empty
}

export function IssueResolver({ issueId, issueTitle, foundPaths }: IssueResolverProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 1. Case: Multiple Results
  if (foundPaths.length > 0) {
    return (
      <List navigationTitle={`Resolve: ${issueId}`}>
        <List.Section title={`Found ${foundPaths.length} matches for ${issueId}`}>
          {foundPaths.map((path) => (
            <List.Item
              key={path}
              title={path.split("/").pop() || path}
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
  const proposedFolderName = `${issueId} ${issueTitle}`.trim();

  async function handleCreateFolder() {
    setIsLoading(true);
    try {
      const parentDir = getNewFolderLocation();

      if (!parentDir) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Configuration Required",
          message: "Set 'New Folder Location' in preferences.",
          primaryAction: {
            title: "Open Preferences",
            onAction: () => {
              openExtensionPreferences();
            },
          },
        });
        return;
      }

      const newPath = await createIssueFolder(parentDir, proposedFolderName);
      await openFolderInFinder(newPath);
      
      await showToast({
        style: Toast.Style.Success,
        title: "Created Folder",
        message: newPath,
      });
      await closeMainWindow();

    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to create folder",
        message: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List navigationTitle={`Create: ${issueId}`}>
      <List.EmptyView
        icon={Icon.Folder}
        title={`No folder found for ${issueId}`}
        description={`Create "${proposedFolderName}"?`}
        actions={
          <ActionPanel>
            <Action
              title="Create Folder"
              icon={Icon.Plus}
              onAction={handleCreateFolder}
            />
            <Action
              title="Open Preferences"
              icon={Icon.Gear}
              onAction={openExtensionPreferences}
            />
          </ActionPanel>
        }
      />
    </List>
  );
}
