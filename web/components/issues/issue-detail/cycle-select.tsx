import React, { useState } from "react";
import { observer } from "mobx-react-lite";
// hooks
import { useIssueDetail } from "hooks/store";
// components
import { CycleDropdown } from "components/dropdowns";
// ui
import { Spinner } from "@plane/ui";
// helpers
import { cn } from "helpers/common.helper";
// types
import type { TIssueOperations } from "./root";

type TIssueCycleSelect = {
  className?: string;
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  issueOperations: TIssueOperations;
  disabled?: boolean;
};

export const IssueCycleSelect: React.FC<TIssueCycleSelect> = observer((props) => {
  const { className = "", workspaceSlug, projectId, issueId, issueOperations, disabled = false } = props;
  // states
  const [isUpdating, setIsUpdating] = useState(false);
  // store hooks
  const {
    issue: { getIssueById },
  } = useIssueDetail();
  // derived values
  const issue = getIssueById(issueId);
  const disableSelect = disabled || isUpdating;

  const handleIssueCycleChange = async (cycleId: string | null) => {
    if (!issue || issue.cycle_id === cycleId) return;
    setIsUpdating(true);
    if (cycleId) await issueOperations.addIssueToCycle?.(workspaceSlug, projectId, cycleId, [issueId]);
    else await issueOperations.removeIssueFromCycle?.(workspaceSlug, projectId, issue.cycle_id ?? "", issueId);
    setIsUpdating(false);
  };

  return (
    <div className={cn("flex items-center gap-1 h-full", className)}>
      <CycleDropdown
        value={issue?.cycle_id ?? null}
        onChange={handleIssueCycleChange}
        projectId={projectId}
        disabled={disableSelect}
        buttonVariant="transparent-with-text"
        className="w-full group"
        buttonContainerClassName="w-full text-left"
        buttonClassName={`text-sm ${issue?.cycle_id ? "" : "text-custom-text-400"}`}
        placeholder="No cycle"
        hideIcon
        dropdownArrow
        dropdownArrowClassName="h-3.5 w-3.5 hidden group-hover:inline"
      />
      {isUpdating && <Spinner className="h-4 w-4" />}
    </div>
  );
});
