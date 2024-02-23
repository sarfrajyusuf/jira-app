import { useState, FC } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { ChevronDown, Dot, XCircle } from "lucide-react";
// hooks
import { useEventTracker, useMember, useUser } from "hooks/store";
import useToast from "hooks/use-toast";
// components
import { ConfirmWorkspaceMemberRemove } from "components/workspace";
// ui
import { CustomSelect, Tooltip } from "@plane/ui";
// constants
import { EUserWorkspaceRoles, ROLE } from "constants/workspace";
import { WORKSPACE_MEMBER_lEAVE } from "constants/event-tracker";

type Props = {
  memberId: string;
};

export const WorkspaceMembersListItem: FC<Props> = observer((props) => {
  const { memberId } = props;
  // states
  const [removeMemberModal, setRemoveMemberModal] = useState(false);
  // router
  const router = useRouter();
  const { workspaceSlug } = router.query;
  // store hooks
  const {
    currentUser,
    currentUserSettings,
    membership: { currentWorkspaceRole, leaveWorkspace },
  } = useUser();
  const {
    workspace: { updateMember, removeMemberFromWorkspace, getWorkspaceMemberDetails },
  } = useMember();
  const { captureEvent } = useEventTracker();
  // toast alert
  const { setToastAlert } = useToast();
  // derived values
  const memberDetails = getWorkspaceMemberDetails(memberId);

  const handleLeaveWorkspace = async () => {
    if (!workspaceSlug || !currentUserSettings) return;

    await leaveWorkspace(workspaceSlug.toString())
      .then(() => {
        captureEvent(WORKSPACE_MEMBER_lEAVE, {
          state: "SUCCESS",
          element: "Workspace settings members page",
        });
        router.push("/profile");
      })
      .catch((err) =>
        setToastAlert({
          type: "error",
          title: "Error",
          message: err?.error || "Something went wrong. Please try again.",
        })
      );
  };

  const handleRemoveMember = async () => {
    if (!workspaceSlug || !memberDetails) return;

    await removeMemberFromWorkspace(workspaceSlug.toString(), memberDetails.member.id).catch((err) =>
      setToastAlert({
        type: "error",
        title: "Error",
        message: err?.error || "Something went wrong. Please try again.",
      })
    );
  };

  const handleRemove = async () => {
    if (memberDetails?.member.id === currentUser?.id) await handleLeaveWorkspace();
    else await handleRemoveMember();
  };

  if (!memberDetails) return null;

  // is the member current logged in user
  const isCurrentUser = memberDetails?.member.id === currentUser?.id;
  // is the current logged in user admin
  const isAdmin = currentWorkspaceRole === EUserWorkspaceRoles.ADMIN;
  // role change access-
  // 1. user cannot change their own role
  // 2. only admin or member can change role
  // 3. user cannot change role of higher role
  const hasRoleChangeAccess =
    currentWorkspaceRole &&
    !isCurrentUser &&
    [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER].includes(currentWorkspaceRole) &&
    memberDetails.role <= currentWorkspaceRole;

  return (
    <>
      <ConfirmWorkspaceMemberRemove
        isOpen={removeMemberModal}
        onClose={() => setRemoveMemberModal(false)}
        userDetails={{
          id: memberDetails.member.id,
          display_name: `${memberDetails.member.display_name}`,
        }}
        onSubmit={handleRemove}
      />
      <div className="group flex items-center justify-between px-3 py-4 hover:bg-custom-background-90">
        <div className="flex items-center gap-x-4 gap-y-2">
          {memberDetails.member.avatar && memberDetails.member.avatar.trim() !== "" ? (
            <Link href={`/${workspaceSlug}/profile/${memberDetails.member.id}`}>
              <span className="relative flex h-10 w-10 items-center justify-center rounded p-4 capitalize text-white">
                <img
                  src={memberDetails.member.avatar}
                  className="absolute left-0 top-0 h-full w-full rounded object-cover"
                  alt={memberDetails.member.display_name || memberDetails.member.email}
                />
              </span>
            </Link>
          ) : (
            <Link href={`/${workspaceSlug}/profile/${memberDetails.member.id}`}>
              <span className="relative flex h-10 w-10 items-center justify-center rounded bg-gray-700 p-4 capitalize text-white">
                {(memberDetails.member.email ?? memberDetails.member.display_name ?? "?")[0]}
              </span>
            </Link>
          )}
          <div>
            <Link href={`/${workspaceSlug}/profile/${memberDetails.member.id}`}>
              <span className="text-sm font-medium">
                {memberDetails.member.first_name} {memberDetails.member.last_name}
              </span>
            </Link>
            <div className="flex items-center">
              <p className="text-xs text-custom-text-300">{memberDetails.member.display_name}</p>
              {isAdmin && (
                <>
                  <Dot height={16} width={16} className="text-custom-text-300" />
                  <p className="text-xs text-custom-text-300">{memberDetails.member.email}</p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CustomSelect
            customButton={
              <div className="item-center flex gap-1 rounded px-2 py-0.5">
                <span
                  className={`flex items-center rounded text-xs font-medium ${
                    hasRoleChangeAccess ? "" : "text-custom-sidebar-text-400"
                  }`}
                >
                  {ROLE[memberDetails.role]}
                </span>
                {hasRoleChangeAccess && (
                  <span className="grid place-items-center">
                    <ChevronDown className="h-3 w-3" />
                  </span>
                )}
              </div>
            }
            value={memberDetails.role}
            onChange={(value: EUserWorkspaceRoles) => {
              if (!workspaceSlug || !value) return;

              updateMember(workspaceSlug.toString(), memberDetails.member.id, {
                role: value,
              }).catch(() => {
                setToastAlert({
                  type: "error",
                  title: "Error!",
                  message: "An error occurred while updating member role. Please try again.",
                });
              });
            }}
            disabled={!hasRoleChangeAccess}
            placement="bottom-end"
          >
            {Object.keys(ROLE).map((key) => {
              if (currentWorkspaceRole && currentWorkspaceRole !== 20 && currentWorkspaceRole < parseInt(key))
                return null;

              return (
                <CustomSelect.Option key={key} value={parseInt(key, 10)}>
                  <>{ROLE[parseInt(key) as keyof typeof ROLE]}</>
                </CustomSelect.Option>
              );
            })}
          </CustomSelect>
          <Tooltip
            tooltipContent={isCurrentUser ? "Leave workspace" : "Remove member"}
            disabled={!isAdmin && !isCurrentUser}
          >
            <button
              type="button"
              onClick={() => setRemoveMemberModal(true)}
              className={
                isAdmin || isCurrentUser
                  ? "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
                  : "pointer-events-none opacity-0"
              }
            >
              <XCircle className="h-3.5 w-3.5 text-red-500" strokeWidth={2} />
            </button>
          </Tooltip>
        </div>
      </div>
    </>
  );
});
