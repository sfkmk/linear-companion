import { LinearClient } from '@linear/sdk';
import { getPreferenceValues } from '@raycast/api';
import { getLinearClient } from './linear-client';

interface Preferences {
  backlinkUrlScheme?: string;
  backlinkTitle?: string;
}

export interface BacklinkResult {
  status: 'created' | 'updated' | 'skipped' | 'error' | 'disabled';
  message?: string;
  url?: string;
}

function generateBacklinkUrl(issueId: string): string | null {
  const preferences = getPreferenceValues<Preferences>();
  const scheme = preferences.backlinkUrlScheme;

  if (!scheme || scheme.trim().length === 0) {
    return null;
  }

  return scheme.replace(/{issueId}/g, issueId);
}

export async function ensureBacklink(issueId: string): Promise<BacklinkResult> {
  const preferences = getPreferenceValues<Preferences>();
  const targetTitle = preferences.backlinkTitle || 'Local Folder';
  const targetUrl = generateBacklinkUrl(issueId);

  if (!targetUrl) {
    return { status: 'disabled' };
  }

  try {
    const client = await getLinearClient();

    // Fetch issue details (needed for ID if passed Key)
    const issue = await client.issue(issueId);

    // Fetch existing attachments
    const attachments = await issue.attachments();
    const existingLinks = attachments.nodes;

    // 1. Check for match by Title
    const matchingTitleLink = existingLinks.find(
      (link) => link.title === targetTitle
    );

    if (matchingTitleLink) {
      if (matchingTitleLink.url === targetUrl) {
        return { status: 'skipped', message: 'Link matches configuration', url: targetUrl };
      } else {
        // Title matches, URL differs -> Update URL
        await client.attachmentUpdate(matchingTitleLink.id, {
          url: targetUrl,
        });
        return { status: 'updated', message: 'Updated link URL', url: targetUrl };
      }
    }

    // 2. Check for match by URL
    const matchingUrlLink = existingLinks.find(
      (link) => link.url === targetUrl
    );

    if (matchingUrlLink) {
        // URL matches, Title differs -> Update Title
        await client.attachmentUpdate(matchingUrlLink.id, {
            title: targetTitle
        });
        return { status: 'updated', message: 'Updated link Title', url: targetUrl };
    }

    // 3. Create new
    await client.attachmentCreate({
      issueId: issue.id,
      url: targetUrl,
      title: targetTitle,
      // subtitle: 'Created by Raycast',
    });

    return { status: 'created', message: 'Created new backlink', url: targetUrl };

  } catch (error) {
    // console.error(`Failed to ensure backlink for ${issueId}:`, error);
    // Return error status so caller can handle
    return {
        status: 'error',
        message: error instanceof Error ? error.message : String(error)
    };
  }
}
