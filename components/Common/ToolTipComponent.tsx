import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaCircleExclamation } from "react-icons/fa6";
type Props = {
  title?: string;
  subTitle?: string;
  content?: string;
};

export const ToolTipComponent = ({ title, subTitle, content }: Props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <FaCircleExclamation />
        </TooltipTrigger>
        <TooltipContent className="p-2">
          <div className="relative p-4  shadow-primary rounded-lg  max-w-[300px] shadow-[0_0_10px_rgba(6, 70, 231, 0.303)]  bg-gradient-to-br from-forground to-forground backdrop-blur-md  border border-white/10 ">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary">
                <FaCircleExclamation />
              </div>
              <h3 className="text-sm font-semibold text-textprimary">
                {subTitle}
              </h3>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-textprimary">{content}</p>
            </div>

            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-background/95 to-forground/95 rotate-45 border-r border-b border-white/10"></div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
