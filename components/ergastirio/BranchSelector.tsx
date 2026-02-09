"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { IStoreInfo } from "@/lib/ergastirio-interfaces";
import { BranchInfo } from "./BranchInfo";

interface BranchSelectorProps {
  currentBranch: IStoreInfo | undefined;
  clientData: { data: IStoreInfo[] } | undefined;
  isPending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBranchChange: (branch: IStoreInfo) => void;
  showOnMobile?: boolean;
}

export function ErgastirioBranchSelector({
  currentBranch,
  clientData,
  isPending,
  open,
  onOpenChange,
  onBranchChange,
  showOnMobile = false,
}: BranchSelectorProps) {
  if (!currentBranch) return null;

  const shouldShow = showOnMobile ? "block" : "hidden md:block";

  return (
    <div className={`${shouldShow} min-w-0`}>
      <div className="min-w-0">
        {clientData?.data.length === 1 || !clientData ? (
          <Button
            variant="ghost"
            className="min-w-0 cursor-default px-2 sm:px-3 py-2 sm:py-3 text-slate-700"
          >
            <BranchInfo
              branch={currentBranch}
              showLabel
              className="w-[170px] sm:w-60"
            />
          </Button>
        ) : (
          <DropdownMenu open={open} onOpenChange={onOpenChange}>
            <DropdownMenuContent
              align="end"
              className="w-72 bg-app-card border-slate-200"
            >
              <DropdownMenuLabel className="text-slate-700">
                Επιλογή καταστήματος
              </DropdownMenuLabel>
              {clientData?.data.map((branch) => {
                const isActive = branch.BRANCH === currentBranch.BRANCH;
                return (
                  <DropdownMenuItem
                    disabled={isActive || isPending}
                    key={branch.BRANCH}
                    onClick={() => onBranchChange(branch)}
                    className="cursor-pointer text-slate-900"
                  >
                    <BranchInfo branch={branch} />
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="min-w-0 px-2 sm:px-3 py-2 sm:py-3 flex items-center gap-2 text-slate-700"
              >
                <BranchInfo
                  branch={currentBranch}
                  showLabel
                  className="w-[170px] sm:w-60"
                />
                <ChevronDown className="h-4 w-4 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
