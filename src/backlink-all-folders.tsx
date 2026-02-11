import {
  List,
  ActionPanel,
  Action,
  Icon,
  showToast,
  Toast,
  getPreferenceValues,
  launchCommand,
  LaunchType,
  openExtensionPreferences,
} from '@raycast/api';
import React, { useState, useEffect } from 'react';

import { ensureBacklink, BacklinkResult } from './lib/backlinker';
import { findAllIssueFolders } from './lib/finder';
import { isAuthenticated } from './lib/linear-client';

interface ProcessItem {
  issueId: string;
  path: string;
  status: 'pending' | 'processing' | 'done' | 'error' | 'skipped';
  result?: string;
}

interface Preferences {
  searchDirectory?: string;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const searchDir = preferences.searchDirectory || '~';

  const [items, setItems] = useState<ProcessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState({ total: 0, current: 0, success: 0, updated: 0, errors: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    async function init() {
        const auth = await isAuthenticated();
        setIsAuth(auth);

        await scan();
    }

    async function scan() {
      try {
        // await showToast({ style: Toast.Style.Animated, title: 'Scanning for folders...' });
        const folders = await findAllIssueFolders(searchDir);

        const unique = new Map<string, string>();
        folders.forEach(f => {
            if (!unique.has(f.issueId)) {
                unique.set(f.issueId, f.path);
            }
        });

        const initialItems: ProcessItem[] = Array.from(unique.entries()).map(([issueId, path]) => ({
          issueId,
          path,
          status: 'pending',
        }));

        setItems(initialItems);
        setProgress(p => ({ ...p, total: initialItems.length }));
        setIsLoading(false);
      } catch (error) {
        await showToast({ style: Toast.Style.Failure, title: 'Scan failed', message: String(error) });
        setIsLoading(false);
      }
    }

    init();
  }, [searchDir]);

  async function startProcessing() {
    if (!isAuth) {
         await showToast({ style: Toast.Style.Failure, title: 'Authentication Required', message: 'Please connect Linear first.' });
         return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      setItems(current => {
          const next = [...current];
          next[i] = { ...next[i], status: 'processing' };
          return next;
      });
      setProgress(p => ({ ...p, current: i + 1 }));

      try {
          const result = await ensureBacklink(item.issueId);

          let status: ProcessItem['status'] = 'done';
          let msg = result.message;

          if (result.status === 'created') successCount++;
          else if (result.status === 'updated') updatedCount++;
          else if (result.status === 'error') {
              status = 'error';
              errorCount++;
          }
          else if (result.status === 'disabled') {
               status = 'skipped';
               msg = 'Disabled in prefs';
          }

          setItems(current => {
            const next = [...current];
            next[i] = { ...next[i], status, result: msg };
            return next;
          });

      } catch (error) {
          errorCount++;
          setItems(current => {
            const next = [...current];
            next[i] = { ...next[i], status: 'error', result: String(error) };
            return next;
          });
      }
    }

    setIsProcessing(false);
    await showToast({
        style: Toast.Style.Success,
        title: 'Batch Complete',
        message: `Created: ${successCount}, Updated: ${updatedCount}, Errors: ${errorCount}`
    });
  }

  async function handleAuthorize() {
      try {
         await launchCommand({ name: 'authorize-linear', type: LaunchType.UserInitiated });
         // Wait a bit and recheck?
         // User comes back after auth.
         // We might need a "Refresh Auth" action or just reload.
         // But usually launchCommand is async/fire-and-forget?
         // Actually, `authorize-linear` is a view command, it will take focus.
         // When user returns, this command might be reloaded or state preserved.
         // We can assume user will re-run or we can add a "Refresh" action.
      } catch {
         openExtensionPreferences();
      }
  }

  return (
    <List
        isLoading={isLoading || isProcessing}
        navigationTitle={isProcessing ? `Processing ${progress.current}/${progress.total}` : `Found ${items.length} Folders`}
        searchBarPlaceholder="Filter found folders..."
    >
      {items.length > 0 ? (
          <>
            {!isProcessing && progress.current === 0 && (
                <List.Item
                    title={isAuth ? "Start Backlinking" : "Connect Linear to Start"}
                    icon={isAuth ? Icon.Play : Icon.Key}
                    actions={
                        <ActionPanel>
                            {isAuth ? (
                                <Action title="Start Processing" onAction={startProcessing} />
                            ) : (
                                <Action title="Connect Linear" onAction={handleAuthorize} />
                            )}
                        </ActionPanel>
                    }
                />
            )}

            <List.Section title="Issue Folders">
                {items.map((item) => (
                    <List.Item
                        key={item.issueId}
                        title={`${item.issueId}`}
                        subtitle={item.path}
                        icon={getStatusIcon(item.status)}
                        accessories={[{ text: item.result || item.status }]}
                        actions={
                            !isProcessing && (
                                <ActionPanel>
                                    {!isAuth && <Action title="Connect Linear" onAction={handleAuthorize} />}
                                    {isAuth && <Action title="Process This Item" onAction={async () => {
                                        // Individual process logic if needed
                                        await ensureBacklink(item.issueId);
                                        // Update UI state manually or refresh?
                                    }} />}
                                </ActionPanel>
                            )
                        }
                    />
                ))}
            </List.Section>
          </>
      ) : (
          <List.EmptyView title="No folders found" icon={Icon.Folder} />
      )}
    </List>
  );
}

function getStatusIcon(status: ProcessItem['status']) {
    switch (status) {
        case 'pending': return Icon.Circle;
        case 'processing': return Icon.CircleProgress;
        case 'done': return Icon.CheckCircle;
        case 'error': return Icon.ExclamationMark;
        case 'skipped': return Icon.Circle;
        default: return Icon.Circle;
    }
}
