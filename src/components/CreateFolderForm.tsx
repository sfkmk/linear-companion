import { Action, ActionPanel, Form, showToast, Toast, closeMainWindow } from "@raycast/api";
import React, { useState } from "react";
import { createIssueFolder } from "../lib/folder-creator";
import { openFolderInFinder } from "../lib/finder";

interface CreateFolderFormProps {
  parentDir: string;
  issueId: string;
  initialName: string;
  navigationTitle: string;
}

export function CreateFolderForm({ parentDir, issueId, initialName, navigationTitle }: CreateFolderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(initialName);
  const [separator, setSeparator] = useState(" ");

  const trimmedName = name.trim();
  const preview = trimmedName ? `${issueId}${separator}${trimmedName}` : issueId;

  async function handleSubmit() {
    if (!trimmedName) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Folder name required",
        message: "Enter a name to create the folder.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newPath = await createIssueFolder(parentDir, preview);
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
          <Action title="Create Folder" onAction={handleSubmit} />
        </ActionPanel>
      }
      isLoading={isLoading}
    >
      <Form.Description title="Issue ID" text={issueId} />
      <Form.Dropdown id="separator" title="Separator" value={separator} onChange={setSeparator}>
        <Form.Dropdown.Item value=" " title="Space" />
        <Form.Dropdown.Item value="-" title="Hyphen" />
        <Form.Dropdown.Item value="." title="Period" />
      </Form.Dropdown>
      <Form.TextField
        id="folderName"
        title={preview}
        value={name}
        onChange={setName}
        placeholder="Enter folder name"
        autoFocus
      />
    </Form>
  );
}
