import { LaunchProps, getPreferenceValues, showToast, Toast } from '@raycast/api';
import { usePromise } from '@raycast/utils';
import React, { useEffect } from 'react';
import { IssueResolver } from './components/IssueResolver';
import { findIssueFolder } from './lib/finder';

interface ResolverArguments {
  issueId: string;
}

interface ResolverContext {
  foundPaths?: string[];
  issueTitle?: string;
}

interface Preferences {
  searchDirectory?: string;
}

export default function Command(
  props: LaunchProps<{
    arguments: ResolverArguments;
    launchContext?: ResolverContext;
  }>
) {
  const { issueId } = props.arguments;
  const normalizedId = issueId.trim().toUpperCase();
  const issueTitle = props.launchContext?.issueTitle ?? '';
  const hasContextResults = Array.isArray(props.launchContext?.foundPaths);
  const preferences = getPreferenceValues<Preferences>();
  const searchDir = preferences.searchDirectory || '~';

  const { data, isLoading, error } = usePromise(
    async (id: string, rootDir: string, hasContext: boolean) => {
      if (hasContext) {
        return props.launchContext?.foundPaths ?? [];
      }

      if (!id) {
        return [];
      }

      return findIssueFolder(id, rootDir);
    },
    [normalizedId, searchDir, hasContextResults]
  );

  useEffect(() => {
    if (!normalizedId) {
      showToast({
        style: Toast.Style.Failure,
        title: 'Issue ID required',
        message: 'Enter a valid Linear Issue ID.',
      });
      return;
    }

    if (error) {
      showToast({
        style: Toast.Style.Failure,
        title: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [normalizedId, error]);

  return (
    <IssueResolver
      issueId={normalizedId}
      issueTitle={issueTitle}
      foundPaths={data ?? []}
      isLoading={isLoading && !hasContextResults}
      isManual={!issueTitle.trim()}
    />
  );
}
