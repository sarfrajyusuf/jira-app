import { useState, ReactElement } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { observer } from "mobx-react-lite";
// hooks
import { useProject } from "hooks/store";
// layouts
import { AppLayout } from "layouts/app-layout";
import { ProjectSettingLayout } from "layouts/settings-layout";
// components
import { PageHead } from "components/core";
import { ProjectSettingHeader } from "components/headers";
import {
  DeleteProjectModal,
  DeleteProjectSection,
  ProjectDetailsForm,
  ProjectDetailsFormLoader,
} from "components/project";
// types
import { NextPageWithLayout } from "lib/types";

const GeneralSettingsPage: NextPageWithLayout = observer(() => {
  // states
  const [selectProject, setSelectedProject] = useState<string | null>(null);
  // router
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;
  // store hooks
  const { currentProjectDetails, fetchProjectDetails } = useProject();
  // api call to fetch project details
  // TODO: removed this API if not necessary
  const { isLoading } = useSWR(
    workspaceSlug && projectId ? `PROJECT_DETAILS_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchProjectDetails(workspaceSlug.toString(), projectId.toString()) : null
  );
  // derived values
  const isAdmin = currentProjectDetails?.member_role === 20;
  const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails?.name} - General Settings` : undefined;
  // const currentNetwork = NETWORK_CHOICES.find((n) => n.key === projectDetails?.network);
  // const selectedNetwork = NETWORK_CHOICES.find((n) => n.key === watch("network"));

  return (
    <>
      <PageHead title={pageTitle} />
      {currentProjectDetails && (
        <DeleteProjectModal
          project={currentProjectDetails}
          isOpen={Boolean(selectProject)}
          onClose={() => setSelectedProject(null)}
        />
      )}

      <div className={`w-full overflow-y-auto py-8 pr-9 ${isAdmin ? "" : "opacity-60"}`}>
        {currentProjectDetails && workspaceSlug && projectId && !isLoading ? (
          <ProjectDetailsForm
            project={currentProjectDetails}
            workspaceSlug={workspaceSlug.toString()}
            projectId={projectId.toString()}
            isAdmin={isAdmin}
          />
        ) : (
          <ProjectDetailsFormLoader />
        )}

        {isAdmin && (
          <DeleteProjectSection
            projectDetails={currentProjectDetails}
            handleDelete={() => setSelectedProject(currentProjectDetails.id ?? null)}
          />
        )}
      </div>
    </>
  );
});

GeneralSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout header={<ProjectSettingHeader title="General Settings" />} withProjectWrapper>
      <ProjectSettingLayout>{page}</ProjectSettingLayout>
    </AppLayout>
  );
};

export default GeneralSettingsPage;
