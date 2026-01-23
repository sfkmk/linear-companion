import { LaunchProps } from "@raycast/api";
import React from "react";
import { IssueResolver } from "./components/IssueResolver";

interface ResolverArguments {
  issueId: string;
  issueTitle: string;
}

interface ResolverContext {
  foundPaths?: string[];
}

export default function Command(props: LaunchProps<{ arguments: ResolverArguments; launchContext: ResolverContext }>) {
  const { issueId, issueTitle } = props.arguments;
  const foundPaths = props.launchContext?.foundPaths || [];

  return (
    <IssueResolver 
      issueId={issueId} 
      issueTitle={issueTitle || ""} 
      foundPaths={foundPaths} 
    />
  );
}
