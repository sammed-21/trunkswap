import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaCircleExclamation } from "react-icons/fa6";
type Props = {
  content?: string;
};

export const ToolTipComponent = ({ content }: Props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <FaCircleExclamation />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-base">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
