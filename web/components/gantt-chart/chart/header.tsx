import { Expand, Shrink } from "lucide-react";
// hooks
import { useChart } from "../hooks";
// helpers
import { cn } from "helpers/common.helper";
// types
import { IGanttBlock, TGanttViews } from "../types";

type Props = {
  blocks: IGanttBlock[] | null;
  fullScreenMode: boolean;
  handleChartView: (view: TGanttViews) => void;
  handleToday: () => void;
  loaderTitle: string;
  title: string;
  toggleFullScreenMode: () => void;
};

export const GanttChartHeader: React.FC<Props> = (props) => {
  const { blocks, fullScreenMode, handleChartView, handleToday, loaderTitle, title, toggleFullScreenMode } = props;
  // chart hook
  const { currentView, allViews } = useChart();

  return (
    <div className="relative flex w-full flex-shrink-0 flex-wrap items-center gap-2 whitespace-nowrap px-2.5 py-2 z-10">
      <div className="flex items-center gap-2 text-lg font-medium">{title}</div>
      <div className="ml-auto">
        <div className="ml-auto text-sm font-medium">{blocks ? `${blocks.length} ${loaderTitle}` : "Loading..."}</div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {allViews?.map((chartView: any) => (
          <div
            key={chartView?.key}
            className={cn("cursor-pointer rounded-sm p-1 px-2 text-xs", {
              "bg-custom-background-80": currentView === chartView?.key,
              "hover:bg-custom-background-90": currentView !== chartView?.key,
            })}
            onClick={() => handleChartView(chartView?.key)}
          >
            {chartView?.title}
          </div>
        ))}
      </div>

      <button type="button" className="rounded-sm p-1 px-2 text-xs hover:bg-custom-background-80" onClick={handleToday}>
        Today
      </button>

      <button
        type="button"
        className="flex items-center justify-center rounded-sm border border-custom-border-200 p-1 transition-all hover:bg-custom-background-80"
        onClick={toggleFullScreenMode}
      >
        {fullScreenMode ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
      </button>
    </div>
  );
};
