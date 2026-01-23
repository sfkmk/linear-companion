/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Search Directory - The root directory to search for project folders recursively. Defaults to home directory. */
  "searchDirectory": string,
  /** New Folder Location - Where new project folders should be created. */
  "newFolderLocation"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `open-issue-folder` command */
  export type OpenIssueFolder = ExtensionPreferences & {}
  /** Preferences accessible in the `query-issue-folder` command */
  export type QueryIssueFolder = ExtensionPreferences & {}
  /** Preferences accessible in the `copy-issue-id` command */
  export type CopyIssueId = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `open-issue-folder` command */
  export type OpenIssueFolder = {}
  /** Arguments passed to the `query-issue-folder` command */
  export type QueryIssueFolder = {
  /** Issue ID */
  "issueId": string
}
  /** Arguments passed to the `copy-issue-id` command */
  export type CopyIssueId = {}
}

