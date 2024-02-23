import { FC } from "react";
import { observer } from "mobx-react";
// hooks
import { useIssueDetail } from "hooks/store";
// components
import { IssueActivityBlockComponent, IssueLink } from "./";
// icons
import { DoubleCircleIcon } from "@plane/ui";

type TIssueStateActivity = { activityId: string; showIssue?: boolean; ends: "top" | "bottom" | undefined };

export const IssueStateActivity: FC<TIssueStateActivity> = observer((props) => {
  const { activityId, showIssue = true, ends } = props;
  // hooks
  const {
    activity: { getActivityById },
  } = useIssueDetail();

  const activity = getActivityById(activityId);

  if (!activity) return <></>;
  return (
    <IssueActivityBlockComponent
      icon={<DoubleCircleIcon className="h-4 w-4 flex-shrink-0" />}
      activityId={activityId}
      ends={ends}
    >
      <>
        set the state to <span className="font-medium text-custom-text-100">{activity.new_value}</span>
        {showIssue ? ` for ` : ``}
        {showIssue && <IssueLink activityId={activityId} />}.
      </>
    </IssueActivityBlockComponent>
  );
});
