import { Action, ActionPanel, Form, showToast, Toast, closeMainWindow } from "@raycast/api";
import React, { useState } from "react";
import { createIssueFolder } from "../lib/folder-creator";
import { openFolderInFinder } from "../lib/finder";

interface CreateFolderFormProps {
  parentDir: string;
  initialName: string;
  navigationTitle: string;
}

interface FormValues {
  folderName: string;
}

export function CreateFolderForm({ parentDir, initialName, navigationTitle }: CreateFolderFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: FormValues) {
    const folderName = values.folderName.trim();

    if (!folderName) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Folder name required",
        message: "Enter a name to create the folder.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newPath = await createIssueFolder(parentDir, folderName);
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
        message: error instanceof Error ? error.message : "Unknown error",
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
          <Action.SubmitForm title="Create Folder" onSubmit={handleSubmit} />
        </ActionPanel>
      }
      isLoading={isLoading}
    >
      <Form.TextField id="folderName" title="Folder Name" defaultValue={initialName} />
    </Form>
  );
}
