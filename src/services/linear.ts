import { runAppleScript } from "@raycast/utils";

/**
 * Gets the window title of the frontmost Linear window.
 * Returns null if Linear is not running or no window is found.
 */
export async function getLinearWindowTitle(): Promise<string | null> {
  const script = `
    if application "Linear" is running then
      tell application "Linear"
        if (count of windows) > 0 then
          return name of front window
        end if
      end tell
    end if
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
