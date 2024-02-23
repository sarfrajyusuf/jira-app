import { FC, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { observer } from "mobx-react-lite";
// UI
import { Button, Loader } from "@plane/ui";
// hooks
import { useIssueDetail } from "hooks/store";
import useToast from "hooks/use-toast";

export type TIssueSubscription = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
};

export const IssueSubscription: FC<TIssueSubscription> = observer((props) => {
  const { workspaceSlug, projectId, issueId } = props;
  // hooks
  const {
    subscription: { getSubscriptionByIssueId },
    createSubscription,
    removeSubscription,
  } = useIssueDetail();
  const { setToastAlert } = useToast();
  // state
  const [loading, setLoading] = useState(false);

  const subscription = getSubscriptionByIssueId(issueId);

  const handleSubscription = async () => {
    setLoading(true);
    try {
      if (subscription?.subscribed) await removeSubscription(workspaceSlug, projectId, issueId);
      else await createSubscription(workspaceSlug, projectId, issueId);
      setToastAlert({
        type: "success",
        title: `Issue ${subscription?.subscribed ? `unsubscribed` : `subscribed`} successfully.!`,
        message: `Issue ${subscription?.subscribed ? `unsubscribed` : `subscribed`} successfully.!`,
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setToastAlert({
        type: "error",
        title: "Error",
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  if (!subscription)
    return (
      <Loader>
        <Loader.Item width="92px" height="27px" />
      </Loader>
    );

  return (
    <>
      {subscription ? (
        <div>
          <Button
            size="sm"
            prependIcon={subscription?.subscribed ? <BellOff /> : <Bell className="h-3 w-3" />}
            variant="outline-primary"
            className="hover:!bg-custom-primary-100/20"
            onClick={handleSubscription}
          >
            {loading ? (
              <span>
                <span className="hidden sm:block">Loading...</span>
              </span>
            ) : subscription?.subscribed ? (
              <div className="hidden sm:block">Unsubscribe</div>
            ) : (
              <div className="hidden sm:block">Subscribe</div>
            )}
          </Button>
        </div>
      ) : (
        <>
          <Loader>
            <Loader.Item height="28px" width="106px" />
          </Loader>
        </>
      )}
    </>
  );
});
