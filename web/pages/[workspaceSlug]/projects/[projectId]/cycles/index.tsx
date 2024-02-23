import { Fragment, useCallback, useState, ReactElement } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { Tab } from "@headlessui/react";
import { useTheme } from "next-themes";
// hooks
import { useEventTracker, useCycle, useUser, useProject } from "hooks/store";
import useLocalStorage from "hooks/use-local-storage";
// layouts
import { AppLayout } from "layouts/app-layout";
// components
import { PageHead } from "components/core";
import { CyclesHeader } from "components/headers";
import { CyclesView, ActiveCycleDetails, CycleCreateUpdateModal } from "components/cycles";
import { EmptyState, getEmptyStateImagePath } from "components/empty-state";
// ui
import { Tooltip } from "@plane/ui";
import { CycleModuleBoardLayout, CycleModuleListLayout, GanttLayoutLoader } from "components/ui";
// types
import { TCycleView, TCycleLayout } from "@plane/types";
import { NextPageWithLayout } from "lib/types";
// constants
import { CYCLE_TAB_LIST, CYCLE_VIEW_LAYOUTS } from "constants/cycle";
import { EUserWorkspaceRoles } from "constants/workspace";
import { CYCLE_EMPTY_STATE_DETAILS } from "constants/empty-state";

const ProjectCyclesPage: NextPageWithLayout = observer(() => {
  const [createModal, setCreateModal] = useState(false);
  // theme
  const { resolvedTheme } = useTheme();
  // store hooks
  const { setTrackElement } = useEventTracker();
  const {
    membership: { currentProjectRole },
    currentUser,
  } = useUser();
  const { currentProjectCycleIds, loader } = useCycle();
  const { getProjectById } = useProject();
  // router
  const router = useRouter();
  const { workspaceSlug, projectId, peekCycle } = router.query;
  // local storage
  const { storedValue: cycleTab, setValue: setCycleTab } = useLocalStorage<TCycleView>("cycle_tab", "active");
  const { storedValue: cycleLayout, setValue: setCycleLayout } = useLocalStorage<TCycleLayout>("cycle_layout", "list");
  // derived values
  const isLightMode = resolvedTheme ? resolvedTheme === "light" : currentUser?.theme.theme === "light";
  const EmptyStateImagePath = getEmptyStateImagePath("onboarding", "cycles", isLightMode);
  const totalCycles = currentProjectCycleIds?.length ?? 0;
  const isEditingAllowed = !!currentProjectRole && currentProjectRole >= EUserWorkspaceRoles.MEMBER;
  const project = projectId ? getProjectById(projectId?.toString()) : undefined;
  const pageTitle = project?.name ? `${project?.name} - Cycles` : undefined;

  const handleCurrentLayout = useCallback(
    (_layout: TCycleLayout) => {
      setCycleLayout(_layout);
    },
    [setCycleLayout]
  );

  const handleCurrentView = useCallback(
    (_view: TCycleView) => {
      setCycleTab(_view);
      if (_view === "draft") handleCurrentLayout("list");
    },
    [handleCurrentLayout, setCycleTab]
  );

  if (!workspaceSlug || !projectId) return null;

  if (loader)
    return (
      <>
        {cycleLayout === "list" && <CycleModuleListLayout />}
        {cycleLayout === "board" && <CycleModuleBoardLayout />}
        {cycleLayout === "gantt" && <GanttLayoutLoader />}
      </>
    );

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="w-full h-full">
        <CycleCreateUpdateModal
          workspaceSlug={workspaceSlug.toString()}
          projectId={projectId.toString()}
          isOpen={createModal}
          handleClose={() => setCreateModal(false)}
        />
        {totalCycles === 0 ? (
          <div className="h-full place-items-center">
            <EmptyState
              title={CYCLE_EMPTY_STATE_DETAILS["cycles"].title}
              description={CYCLE_EMPTY_STATE_DETAILS["cycles"].description}
              image={EmptyStateImagePath}
              comicBox={{
                title: CYCLE_EMPTY_STATE_DETAILS["cycles"].comicBox.title,
                description: CYCLE_EMPTY_STATE_DETAILS["cycles"].comicBox.description,
              }}
              primaryButton={{
                text: CYCLE_EMPTY_STATE_DETAILS["cycles"].primaryButton.text,
                onClick: () => {
                  setTrackElement("Cycle empty state");
                  setCreateModal(true);
                },
              }}
              size="lg"
              disabled={!isEditingAllowed}
            />
          </div>
        ) : (
          <Tab.Group
            as="div"
            className="flex h-full flex-col overflow-hidden"
            defaultIndex={CYCLE_TAB_LIST.findIndex((i) => i.key == cycleTab)}
            selectedIndex={CYCLE_TAB_LIST.findIndex((i) => i.key == cycleTab)}
            onChange={(i) => handleCurrentView(CYCLE_TAB_LIST[i]?.key ?? "active")}
          >
            <div className="flex flex-col items-start justify-between gap-4 border-b border-custom-border-200 px-4 sm:flex-row sm:items-center sm:px-5 sm:pb-0">
              <Tab.List as="div" className="flex items-center overflow-x-scroll">
                {CYCLE_TAB_LIST.map((tab) => (
                  <Tab
                    key={tab.key}
                    className={({ selected }) =>
                      `border-b-2 p-4 text-sm font-medium outline-none ${
                        selected ? "border-custom-primary-100 text-custom-primary-100" : "border-transparent"
                      }`
                    }
                  >
                    {tab.name}
                  </Tab>
                ))}
              </Tab.List>
              <div className="hidden sm:block">
                {cycleTab !== "active" && (
                  <div className="flex items-center self-end sm:self-center md:self-center lg:self-center gap-1 rounded bg-custom-background-80 p-1">
                    {CYCLE_VIEW_LAYOUTS.map((layout) => {
                      if (layout.key === "gantt" && cycleTab === "draft") return null;

                      return (
                        <Tooltip key={layout.key} tooltipContent={layout.title}>
                          <button
                            type="button"
                            className={`group grid h-[22px] w-7 place-items-center overflow-hidden rounded transition-all hover:bg-custom-background-100 ${
                              cycleLayout == layout.key ? "bg-custom-background-100 shadow-custom-shadow-2xs" : ""
                            }`}
                            onClick={() => handleCurrentLayout(layout.key as TCycleLayout)}
                          >
                            <layout.icon
                              strokeWidth={2}
                              className={`h-3.5 w-3.5 ${
                                cycleLayout == layout.key ? "text-custom-text-100" : "text-custom-text-200"
                              }`}
                            />
                          </button>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <Tab.Panels as={Fragment}>
              <Tab.Panel as="div" className="h-full overflow-y-auto">
                {cycleTab && cycleLayout && (
                  <CyclesView
                    filter="all"
                    layout={cycleLayout}
                    workspaceSlug={workspaceSlug.toString()}
                    projectId={projectId.toString()}
                    peekCycle={peekCycle?.toString()}
                  />
                )}
              </Tab.Panel>

              <Tab.Panel as="div" className="h-full space-y-5 overflow-y-auto p-4 sm:p-5">
                <ActiveCycleDetails workspaceSlug={workspaceSlug.toString()} projectId={projectId.toString()} />
              </Tab.Panel>

              <Tab.Panel as="div" className="h-full overflow-y-auto">
                {cycleTab && cycleLayout && (
                  <CyclesView
                    filter="upcoming"
                    layout={cycleLayout as TCycleLayout}
                    workspaceSlug={workspaceSlug.toString()}
                    projectId={projectId.toString()}
                    peekCycle={peekCycle?.toString()}
                  />
                )}
              </Tab.Panel>

              <Tab.Panel as="div" className="h-full overflow-y-auto">
                {cycleTab && cycleLayout && workspaceSlug && projectId && (
                  <CyclesView
                    filter="completed"
                    layout={cycleLayout as TCycleLayout}
                    workspaceSlug={workspaceSlug.toString()}
                    projectId={projectId.toString()}
                    peekCycle={peekCycle?.toString()}
                  />
                )}
              </Tab.Panel>

              <Tab.Panel as="div" className="h-full overflow-y-auto">
                {cycleTab && cycleLayout && workspaceSlug && projectId && (
                  <CyclesView
                    filter="draft"
                    layout={cycleLayout as TCycleLayout}
                    workspaceSlug={workspaceSlug.toString()}
                    projectId={projectId.toString()}
                    peekCycle={peekCycle?.toString()}
                  />
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        )}
      </div>
    </>
  );
});

ProjectCyclesPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout header={<CyclesHeader />} withProjectWrapper>
      {page}
    </AppLayout>
  );
};

export default ProjectCyclesPage;
