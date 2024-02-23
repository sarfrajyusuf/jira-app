import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import useSWR from "swr";
// store hooks
import { useGlobalView } from "hooks/store";
// components
import { GlobalViewListItem } from "components/workspace";
// ui
import { ViewListLoader } from "components/ui";

type Props = {
  searchQuery: string;
};

export const GlobalViewsList: React.FC<Props> = observer((props) => {
  const { searchQuery } = props;
  // router
  const router = useRouter();
  const { workspaceSlug } = router.query;
  // store hooks
  const { fetchAllGlobalViews, currentWorkspaceViews, getSearchedViews } = useGlobalView();

  useSWR(
    workspaceSlug ? `GLOBAL_VIEWS_LIST_${workspaceSlug.toString()}` : null,
    workspaceSlug ? () => fetchAllGlobalViews(workspaceSlug.toString()) : null
  );

  if (!currentWorkspaceViews) return <ViewListLoader />;

  const filteredViewsList = getSearchedViews(searchQuery);

  return (
    <>
      {filteredViewsList?.map((viewId) => (
        <GlobalViewListItem key={viewId} viewId={viewId} />
      ))}
    </>
  );
});
