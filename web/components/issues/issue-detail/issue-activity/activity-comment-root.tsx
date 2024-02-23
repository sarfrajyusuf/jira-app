import { FC } from "react";
import { observer } from "mobx-react-lite";
// hooks
import { useIssueDetail } from "hooks/store";
// components
import { IssueActivityList } from "./activity/activity-list";
import { IssueCommentCard } from "./comments/comment-card";
// types
import { TActivityOperations } from "./root";

type TIssueActivityCommentRoot = {
  workspaceSlug: string;
  issueId: string;
  activityOperations: TActivityOperations;
  showAccessSpecifier?: boolean;
};

export const IssueActivityCommentRoot: FC<TIssueActivityCommentRoot> = observer((props) => {
  const { workspaceSlug, issueId, activityOperations, showAccessSpecifier } = props;
  // hooks
  const {
    activity: { getActivityCommentByIssueId },
    comment: {},
  } = useIssueDetail();

  const activityComments = getActivityCommentByIssueId(issueId);

  if (!activityComments || (activityComments && activityComments.length <= 0)) return <></>;
  return (
    <div>
      {activityComments.map((activityComment, index) =>
        activityComment.activity_type === "COMMENT" ? (
          <IssueCommentCard
            workspaceSlug={workspaceSlug}
            commentId={activityComment.id}
            activityOperations={activityOperations}
            ends={index === 0 ? "top" : index === activityComments.length - 1 ? "bottom" : undefined}
            showAccessSpecifier={showAccessSpecifier}
          />
        ) : activityComment.activity_type === "ACTIVITY" ? (
          <IssueActivityList
            activityId={activityComment.id}
            ends={index === 0 ? "top" : index === activityComments.length - 1 ? "bottom" : undefined}
          />
        ) : (
          <></>
        )
      )}
    </div>
  );
});
