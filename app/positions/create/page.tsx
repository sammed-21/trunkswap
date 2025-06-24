import { MainCreateComponent } from "@/components/Positions/Create/MainCreateComponent";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <div className="w-full relative h-full  py-10 px-4 gap-4 flex flex-col items-start  justify-center max-w-4xl   mx-auto">
      <MainCreateComponent />
    </div>
  );
};

export default page;
