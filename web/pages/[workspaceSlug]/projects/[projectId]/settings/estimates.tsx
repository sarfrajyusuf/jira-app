import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
// hooks
import { useUser, useProject } from "hooks/store";
// layouts
import { AppLayout } from "layouts/app-layout";
import { ProjectSettingLayout } from "layouts/settings-layout";
// components
import { PageHead } from "components/core";
import { ProjectSettingHeader } from "components/headers";
import { EstimatesList } from "components/estimates";
// types
import { NextPageWithLayout } from "lib/types";
// constants
import { EUserProjectRoles } from "constants/project";

const EstimatesSettingsPage: NextPageWithLayout = observer(() => {
  const {
    membership: { currentProjectRole },
  } = useUser();
  const { currentProjectDetails } = useProject();
  // derived values
  const isAdmin = currentProjectRole === EUserProjectRoles.ADMIN;
  const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails?.name} - Estimates` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className={`h-full w-full overflow-y-auto py-8 pr-9 ${isAdmin ? "" : "pointer-events-none opacity-60"}`}>
        <EstimatesList />
      </div>
    </>
  );
});

EstimatesSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout header={<ProjectSettingHeader title="Estimates Settings" />} withProjectWrapper>
      <ProjectSettingLayout>{page}</ProjectSettingLayout>
    </AppLayout>
  );
};

export default EstimatesSettingsPage;
