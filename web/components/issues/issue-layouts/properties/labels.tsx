import { Fragment, useState } from "react";
import { observer } from "mobx-react-lite";
import { usePopper } from "react-popper";
import { Check, ChevronDown, Search, Tags } from "lucide-react";
// hooks
import { useApplication, useLabel } from "hooks/store";
import { useDropdownKeyDown } from "hooks/use-dropdown-key-down";
// components
import { Combobox } from "@headlessui/react";
import { Tooltip } from "@plane/ui";
// types
import { Placement } from "@popperjs/core";
import { IIssueLabel } from "@plane/types";

export interface IIssuePropertyLabels {
  projectId: string | null;
  value: string[];
  defaultOptions?: any;
  onChange: (data: string[]) => void;
  disabled?: boolean;
  hideDropdownArrow?: boolean;
  className?: string;
  buttonClassName?: string;
  optionsClassName?: string;
  placement?: Placement;
  maxRender?: number;
  noLabelBorder?: boolean;
  placeholderText?: string;
  onClose?: () => void;
}

export const IssuePropertyLabels: React.FC<IIssuePropertyLabels> = observer((props) => {
  const {
    projectId,
    value,
    defaultOptions = [],
    onChange,
    onClose,
    disabled,
    hideDropdownArrow = false,
    className,
    buttonClassName = "",
    optionsClassName = "",
    placement,
    maxRender = 2,
    noLabelBorder = false,
    placeholderText,
  } = props;
  // states
  const [query, setQuery] = useState("");
  // popper-js refs
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  // store hooks
  const {
    router: { workspaceSlug },
  } = useApplication();
  const { fetchProjectLabels, getProjectLabels } = useLabel();

  const storeLabels = getProjectLabels(projectId);

  const openDropDown = () => {
    if (!storeLabels && workspaceSlug && projectId) {
      setIsLoading(true);
      fetchProjectLabels(workspaceSlug, projectId).then(() => setIsLoading(false));
    }
  };

  const handleClose = () => {
    onClose && onClose();
  };

  const handleKeyDown = useDropdownKeyDown(openDropDown, handleClose, false);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: placement ?? "bottom-start",
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          padding: 12,
        },
      },
    ],
  });

  if (!value) return null;

  let projectLabels: IIssueLabel[] = defaultOptions;
  if (storeLabels && storeLabels.length > 0) projectLabels = storeLabels;

  const options = projectLabels.map((label) => ({
    value: label?.id,
    query: label?.name,
    content: (
      <div className="flex items-center justify-start gap-2 overflow-hidden">
        <span
          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
          style={{
            backgroundColor: label?.color,
          }}
        />
        <div className="line-clamp-1 inline-block truncate">{label?.name}</div>
      </div>
    ),
  }));

  const filteredOptions =
    query === "" ? options : options?.filter((option) => option.query.toLowerCase().includes(query.toLowerCase()));

  const label = (
    <div className="flex h-5 w-full flex-wrap items-center gap-2 overflow-hidden text-custom-text-200">
      {value.length > 0 ? (
        value.length <= maxRender ? (
          <>
            {projectLabels
              ?.filter((l) => value.includes(l?.id))
              .map((label) => (
                <Tooltip position="top" tooltipHeading="Labels" tooltipContent={label?.name ?? ""}>
                  <div
                    key={label?.id}
                    className={`flex overflow-hidden hover:bg-custom-background-80 ${
                      !disabled && "cursor-pointer"
                    } h-full max-w-full flex-shrink-0 items-center rounded border-[0.5px] border-custom-border-300 px-2.5 py-1 text-xs`}
                  >
                    <div className="flex max-w-full items-center gap-1.5 overflow-hidden text-custom-text-200">
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{
                          backgroundColor: label?.color ?? "#000000",
                        }}
                      />
                      <div className="line-clamp-1 inline-block w-auto max-w-[100px] truncate">{label?.name}</div>
                    </div>
                  </div>
                </Tooltip>
              ))}
          </>
        ) : (
          <div
            className={`flex h-full flex-shrink-0 items-center rounded border-[0.5px] border-custom-border-300 px-2.5 py-1 text-xs ${
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <Tooltip
              position="top"
              tooltipHeading="Labels"
              tooltipContent={projectLabels
                ?.filter((l) => value.includes(l?.id))
                .map((l) => l?.name)
                .join(", ")}
            >
              <div className="flex h-full items-center gap-1.5 text-custom-text-200">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-custom-primary" />
                {`${value.length} Labels`}
              </div>
            </Tooltip>
          </div>
        )
      ) : (
        <Tooltip position="top" tooltipHeading="Labels" tooltipContent="None">
          <div
            className={`flex h-full items-center justify-center gap-2 rounded px-2.5 py-1 text-xs hover:bg-custom-background-80 ${
              noLabelBorder ? "" : "border-[0.5px] border-custom-border-300"
            }`}
          >
            <Tags className="h-3.5 w-3.5" strokeWidth={2} />
            {placeholderText}
          </div>
        </Tooltip>
      )}
    </div>
  );

  return (
    <Combobox
      as="div"
      className={`w-auto max-w-full flex-shrink-0 text-left ${className}`}
      value={value}
      onChange={onChange}
      disabled={disabled}
      onKeyDownCapture={handleKeyDown}
      multiple
    >
      <Combobox.Button as={Fragment}>
        <button
          ref={setReferenceElement}
          type="button"
          className={`clickable flex w-full items-center justify-between gap-1 text-xs ${
            disabled
              ? "cursor-not-allowed text-custom-text-200"
              : value.length <= maxRender
              ? "cursor-pointer"
              : "cursor-pointer hover:bg-custom-background-80"
          }  ${buttonClassName}`}
          onClick={openDropDown}
        >
          {label}
          {!hideDropdownArrow && !disabled && <ChevronDown className="h-3 w-3" aria-hidden="true" />}
        </button>
      </Combobox.Button>

      <Combobox.Options className="fixed z-10">
        <div
          className={`z-10 my-1 w-48 whitespace-nowrap rounded border border-custom-border-300 bg-custom-background-100 px-2 py-2.5 text-xs shadow-custom-shadow-rg focus:outline-none ${optionsClassName}`}
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          <div className="flex w-full items-center justify-start rounded border border-custom-border-200 bg-custom-background-90 px-2">
            <Search className="h-3.5 w-3.5 text-custom-text-300" />
            <Combobox.Input
              className="w-full bg-transparent px-2 py-1 text-xs text-custom-text-200 placeholder:text-custom-text-400 focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              displayValue={(assigned: any) => assigned?.name || ""}
            />
          </div>
          <div className={`mt-2 max-h-48 space-y-1 overflow-y-scroll`}>
            {isLoading ? (
              <p className="text-center text-custom-text-200">Loading...</p>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Combobox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active, selected }) =>
                    `flex cursor-pointer select-none items-center justify-between gap-2 truncate rounded px-1 py-1.5 hover:bg-custom-background-80 ${
                      active ? "bg-custom-background-80" : ""
                    } ${selected ? "text-custom-text-100" : "text-custom-text-200"}`
                  }
                >
                  {({ selected }) => (
                    <>
                      {option.content}
                      {selected && (
                        <div className="flex-shrink-0">
                          <Check className={`h-3.5 w-3.5`} />
                        </div>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))
            ) : (
              <span className="flex items-center gap-2 p-1">
                <p className="text-left text-custom-text-200 ">No matching results</p>
              </span>
            )}
          </div>
        </div>
      </Combobox.Options>
    </Combobox>
  );
});
