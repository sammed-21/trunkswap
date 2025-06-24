import React from "react";
import { BreadcrumbComponent } from "./BreadcrumbComponent";
import { SelectionHeading } from "./SelectionHeading";
import { TabChooseTokenLiquidity } from "./TabChooseTokenLiquidity";

type Props = {};

export const MainCreateComponent = (props: Props) => {
  return (
    <div className="w-full flex flex-col gap-8 relative">
      <BreadcrumbComponent />
      <SelectionHeading />
      <TabChooseTokenLiquidity />
    </div>
  );
};
