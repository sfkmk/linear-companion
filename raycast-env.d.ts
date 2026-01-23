/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `open-issue-folder` command */
  export type OpenIssueFolder = ExtensionPreferences & {
  /** Search Directory - The root directory to search for project folders recursively. */
  "searchDirectory": string
}
  /** Preferences accessible in the `copy-issue-id` command */
  export type CopyIssueId = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `open-issue-folder` command */
  export type OpenIssueFolder = {}
  /** Arguments passed to the `copy-issue-id` command */
  export type CopyIssueId = {}
}

