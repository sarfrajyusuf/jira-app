import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import Link from "next/link";
// hooks
import {
  useApplication,
  useEventTracker,
  useLabel,
  useMember,
  useModule,
  useProject,
  useProjectState,
  useUser,
  useIssues,
} from "hooks/store";
import useLocalStorage from "hooks/use-local-storage";
// components
import { DisplayFiltersSelection, FiltersDropdown, FilterSelection, LayoutSelection } from "components/issues";
import { ProjectAnalyticsModal } from "components/analytics";
import { SidebarHamburgerToggle } from "components/core/sidebar/sidebar-menu-hamburger-toggle";
import { BreadcrumbLink } from "components/common";
// ui
import { Breadcrumbs, Button, CustomMenu, DiceIcon, LayersIcon } from "@plane/ui";
// icons
import { ArrowRight, PanelRight, Plus } from "lucide-react";
// helpers
import { truncateText } from "helpers/string.helper";
import { renderEmoji } from "helpers/emoji.helper";
// types
import { IIssueDisplayFilterOptions, IIssueDisplayProperties, IIssueFilterOptions, TIssueLayouts } from "@plane/types";
// constants
import { EIssuesStoreType, EIssueFilterType, ISSUE_DISPLAY_FILTERS_BY_LAYOUT } from "constants/issue";
import { EUserProjectRoles } from "constants/project";
import { cn } from "helpers/common.helper";
import { ModuleMobileHeader } from "components/modules/module-mobile-header";

const ModuleDropdownOption: React.FC<{ moduleId: string }> = ({ moduleId }) => {
  // router
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;
  // store hooks
  const { getModuleById } = useModule();
  // derived values
  const moduleDetail = getModuleById(moduleId);

  if (!moduleDetail) return null;

  return (
    <CustomMenu.MenuItem key={moduleDetail.id}>
      <Link
        href={`/${workspaceSlug}/projects/${projectId}/modules/${moduleDetail.id}`}
        className="flex items-center gap-1.5"
      >
        <DiceIcon className="h-3 w-3" />
        {truncateText(moduleDetail.name, 40)}
      </Link>
    </CustomMenu.MenuItem>
  );
};

export const ModuleIssuesHeader: React.FC = observer(() => {
  // states
  const [analyticsModal, setAnalyticsModal] = useState(false);
  // router
  const router = useRouter();
  const { workspaceSlug, projectId, moduleId } = router.query as {
    workspaceSlug: string;
    projectId: string;
    moduleId: string;
  };
  // store hooks
  const {
    issuesFilter: { issueFilters, updateFilters },
  } = useIssues(EIssuesStoreType.MODULE);
  const { projectModuleIds, getModuleById } = useModule();
  const {
    commandPalette: { toggleCreateIssueModal },
  } = useApplication();
  const { setTrackElement } = useEventTracker();
  const {
    membership: { currentProjectRole },
  } = useUser();
  const { currentProjectDetails } = useProject();
  const { projectLabels } = useLabel();
  const { projectStates } = useProjectState();
  const {
    project: { projectMemberIds },
  } = useMember();

  const { setValue, storedValue } = useLocalStorage("module_sidebar_collapsed", "false");

  const isSidebarCollapsed = storedValue ? (storedValue === "true" ? true : false) : false;
  const toggleSidebar = () => {
    setValue(`${!isSidebarCollapsed}`);
  };

  const activeLayout = issueFilters?.displayFilters?.layout;

  const handleLayoutChange = useCallback(
    (layout: TIssueLayouts) => {
      if (!workspaceSlug || !projectId) return;
      updateFilters(workspaceSlug, projectId, EIssueFilterType.DISPLAY_FILTERS, { layout: layout }, moduleId);
    },
    [workspaceSlug, projectId, moduleId, updateFilters]
  );

  const handleFiltersUpdate = useCallback(
    (key: keyof IIssueFilterOptions, value: string | string[]) => {
      if (!workspaceSlug || !projectId) return;
      const newValues = issueFilters?.filters?.[key] ?? [];

      if (Array.isArray(value)) {
        value.forEach((val) => {
          if (!newValues.includes(val)) newValues.push(val);
        });
      } else {
        if (issueFilters?.filters?.[key]?.includes(value)) newValues.splice(newValues.indexOf(value), 1);
        else newValues.push(value);
      }

      updateFilters(workspaceSlug, projectId, EIssueFilterType.FILTERS, { [key]: newValues }, moduleId);
    },
    [workspaceSlug, projectId, moduleId, issueFilters, updateFilters]
  );

  const handleDisplayFilters = useCallback(
    (updatedDisplayFilter: Partial<IIssueDisplayFilterOptions>) => {
      if (!workspaceSlug || !projectId) return;
      updateFilters(workspaceSlug, projectId, EIssueFilterType.DISPLAY_FILTERS, updatedDisplayFilter, moduleId);
    },
    [workspaceSlug, projectId, moduleId, updateFilters]
  );

  const handleDisplayProperties = useCallback(
    (property: Partial<IIssueDisplayProperties>) => {
      if (!workspaceSlug || !projectId) return;
      updateFilters(workspaceSlug, projectId, EIssueFilterType.DISPLAY_PROPERTIES, property, moduleId);
    },
    [workspaceSlug, projectId, moduleId, updateFilters]
  );

  // derived values
  const moduleDetails = moduleId ? getModuleById(moduleId.toString()) : undefined;
  const canUserCreateIssue =
    currentProjectRole && [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER].includes(currentProjectRole);

  return (
    <>
      <ProjectAnalyticsModal
        isOpen={analyticsModal}
        onClose={() => setAnalyticsModal(false)}
        moduleDetails={moduleDetails ?? undefined}
      />
      <div className="relative z-10 items-center gap-x-2 gap-y-4">
        <div className="flex justify-between border-b border-custom-border-200 bg-custom-sidebar-background-100 p-4">
          <div className="flex items-center gap-2">
            <SidebarHamburgerToggle />
            <Breadcrumbs onBack={router.back}>
              <Breadcrumbs.BreadcrumbItem
                type="text"
                link={
                  <span>
                    <span className="hidden md:block">
                      <BreadcrumbLink
                        label={currentProjectDetails?.name ?? "Project"}
                        href={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/issues`}
                        icon={
                          currentProjectDetails?.emoji ? (
                            renderEmoji(currentProjectDetails.emoji)
                          ) : currentProjectDetails?.icon_prop ? (
                            renderEmoji(currentProjectDetails.icon_prop)
                          ) : (
                            <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded bg-gray-700 uppercase text-white">
                              {currentProjectDetails?.name.charAt(0)}
                            </span>
                          )
                        }
                      />
                    </span>
                    <Link href={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/issues`} className="block md:hidden pl-2 text-custom-text-300">...</Link>
                  </span>
                }
              />
              <Breadcrumbs.BreadcrumbItem
                type="text"
                link={
                  <BreadcrumbLink
                    href={`/${workspaceSlug}/projects/${projectId}/modules`}
                    label="Modules"
                    icon={<DiceIcon className="h-4 w-4 text-custom-text-300" />}
                  />
                }
              />
              <Breadcrumbs.BreadcrumbItem
                type="component"
                component={
                  <CustomMenu
                    label={
                      <>
                        <DiceIcon className="h-3 w-3" />
                        <div className="w-auto max-w-[70px] sm:max-w-[200px] inline-block truncate line-clamp-1 overflow-hidden whitespace-nowrap">
                          {moduleDetails?.name && moduleDetails.name}
                        </div>
                      </>
                    }
                    className="ml-1.5 flex-shrink-0"
                    placement="bottom-start"
                  >
                    {projectModuleIds?.map((moduleId) => (
                      <ModuleDropdownOption key={moduleId} moduleId={moduleId} />
                    ))}
                  </CustomMenu>
                }
              />
            </Breadcrumbs>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex gap-2">
              <LayoutSelection
                layouts={["list", "kanban", "calendar", "spreadsheet", "gantt_chart"]}
                onChange={(layout) => handleLayoutChange(layout)}
                selectedLayout={activeLayout}
              />
              <FiltersDropdown title="Filters" placement="bottom-end">
                <FilterSelection
                  filters={issueFilters?.filters ?? {}}
                  handleFiltersUpdate={handleFiltersUpdate}
                  layoutDisplayFiltersOptions={
                    activeLayout ? ISSUE_DISPLAY_FILTERS_BY_LAYOUT.issues[activeLayout] : undefined
                  }
                  labels={projectLabels}
                  memberIds={projectMemberIds ?? undefined}
                  states={projectStates}
                />
              </FiltersDropdown>
              <FiltersDropdown title="Display" placement="bottom-end">
                <DisplayFiltersSelection
                  layoutDisplayFiltersOptions={
                    activeLayout ? ISSUE_DISPLAY_FILTERS_BY_LAYOUT.issues[activeLayout] : undefined
                  }
                  displayFilters={issueFilters?.displayFilters ?? {}}
                  handleDisplayFiltersUpdate={handleDisplayFilters}
                  displayProperties={issueFilters?.displayProperties ?? {}}
                  handleDisplayPropertiesUpdate={handleDisplayProperties}
                />
              </FiltersDropdown>
            </div>

            {canUserCreateIssue && (
              <>
                <Button className="hidden md:block" onClick={() => setAnalyticsModal(true)} variant="neutral-primary" size="sm">
                  Analytics
                </Button>
                <Button
                  className="hidden sm:flex"
                  onClick={() => {
                    setTrackElement("Module issues page");
                    toggleCreateIssueModal(true, EIssuesStoreType.MODULE);
                  }}
                  size="sm"
                  prependIcon={<Plus />}
                >
                  Add Issue
                </Button>
              </>
            )}
            <button
              type="button"
              className="grid h-7 w-7 place-items-center rounded p-1 outline-none hover:bg-custom-sidebar-background-80"
              onClick={toggleSidebar}
            >
              <ArrowRight className={`h-4 w-4 duration-300 hidden md:block ${isSidebarCollapsed ? "-rotate-180" : ""}`} />
              <PanelRight className={cn("w-4 h-4 block md:hidden", !isSidebarCollapsed ? "text-[#3E63DD]" : "text-custom-text-200")} />
            </button>
          </div>
        </div>
        <ModuleMobileHeader />
      </div>
    </>
  );
});
