# Linear Companion (WIP)

This Raycast extension connects the Linear macOS app with your local filesystem. Its main purpose is to quickly switch contexts by opening the local project folder associated with the Linear issue you are currently viewing.

## Why this exists

When Linear is your SSOT, manually navigating to the corresponding local folder for each issue can be repetitive. This extension solves that by reading the active window title from Linear, extracting the Issue ID (e.g., `ENG-123`), and finding the matching directory on your machine, or creates one if there is none.

## Features

- **Open Issue Folder**: Detects the active issue in Linear and opens the matching local folder or creates a new folder for an issue.
- **Copy Issue ID**: Extracts the Issue ID from the current Linear window and copies it to your clipboard.
- **Query Issue Folder**: A manual search interface to find folders by Issue ID.

## Configuration

You can configure the following settings in Raycast:

- **Search Directory**: The root directory where the extension searches for project folders (defaults to users home folder).
- **New Folders Location**: The specific location where new project folders will be created.
- **Allow Emojis**: Option to allow emojis in folder names. By default, they will be removed.

---

#### Disclaimer

This is an unofficial community project and is not affiliated with, endorsed by, or connected to Linear Orbit, Inc. "Linear" and the Linear logo are trademarks of Linear Orbit, Inc.
