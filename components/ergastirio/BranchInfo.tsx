import type { IStoreInfo } from "@/lib/ergastirio-interfaces";

interface BranchInfoProps {
  branch: IStoreInfo;
  showLabel?: boolean;
  className?: string;
  isActive?: boolean;
}

export function BranchInfo({
  branch,
  showLabel = false,
  className = "",
  isActive = false,
}: BranchInfoProps) {
  return (
    <div
      className={`min-w-0 flex flex-col items-start text-left ${className}`}
    >
      {showLabel && (
        <span className="text-[10px] tracking-wide text-slate-500">
          ΚΑΤΑΣΤΗΜΑ
        </span>
      )}
      <span
        className="w-full truncate text-base sm:text-lg font-medium leading-tight text-slate-900"
        title={branch.NAME}
      >
        {branch.NAME}
      </span>
      <span
        className={`w-full truncate text-[10px] ${
          isActive ? "text-white/80" : "text-slate-500"
        }`}
        title={branch.ADDRESS}
      >
        {branch.ADDRESS}, {branch.ZIP} - {branch.CITY}
      </span>
    </div>
  );
}
