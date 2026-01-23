import { runAppleScript } from "@raycast/utils";

/**
 * Gets the window title of the frontmost Linear window.
 * Returns null if Linear is not running or no window is found.
 */
export async function getLinearWindowTitle(): Promise<string | null> {
  // Use System Events to inspect the process, which is more reliable for Electron apps
  // that might not support standard AppleScript dictionary window commands.
  const script = `
    tell application "System Events"
      if (count of (processes whose name is "Linear")) > 0 then
        tell process "Linear"
          if (count of windows) > 0 then
            return name of window 1
          end if
        end tell
      end if
    end tell
    return ""
  `;

  try {
    const result = await runAppleScript(script);
    return result.trim() || null;
  } catch (error) {
    console.error("Error fetching Linear window title:", error);
    return null;
  }
}

/**
 * Parses the Linear Issue ID from a window title.
 * Expected formats: "ENG-123 Fix login bug", "Linear - ENG-123"
 */
export function extractIssueId(title: string): string | null {
  // Regex looks for 2-4 uppercase letters, hyphen, 1-5 digits.
  // e.g. LIN-123, ENG-9941
  const match = title.match(/\b[A-Z]{2,5}-\d{1,5}\b/);
  return match ? match[0] : null;
}
