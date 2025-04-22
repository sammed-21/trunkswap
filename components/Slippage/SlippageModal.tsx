import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaGear } from "react-icons/fa6";
import { SlippageTolerance } from "./SlippageTolerance";

type Props = {};

export const SlippageModal = (props: Props) => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <FaGear />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuContent>
            <div className="p-2 rounded-xl ">
              <SlippageTolerance />
              <div>deadline</div>
            </div>
          </DropdownMenuContent>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
