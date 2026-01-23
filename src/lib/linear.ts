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
 * Parses both the Issue ID and the Title from the window title.
 * Returns { id, title } or null if ID is missing.
 */
export function parseLinearTitle(title: string): { id: string; title: string } | null {
  // Regex: 2-5 uppercase letters, hyphen, 1-5 digits.
  const idMatch = title.match(/\b[A-Z]{2,5}-\d{1,5}\b/);
  
  if (!idMatch) return null;
  
  const id = idMatch[0];
  
  // Title is typically everything AFTER the ID.
  // Example: "ENG-123 Fix login bug" -> "Fix login bug"
  // Example: "Linear - ENG-123" -> "" (or handle gracefully)
  
  // We split by the ID, take the second part, and clean it up.
  const parts = title.split(id);
  const rawTitle = parts[1] || "";
  
  // Remove leading/trailing separators (like " - " or " ")
  const cleanTitle = rawTitle.replace(/^[\s-]+/, "").trim();

  return { id, title: cleanTitle };
}

// Keep backward compatibility for now if needed, or deprecate
export function extractIssueId(title: string): string | null {
  const parsed = parseLinearTitle(title);
  return parsed ? parsed.id : null;
}
