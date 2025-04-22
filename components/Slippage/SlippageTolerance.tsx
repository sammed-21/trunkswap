import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {};

export const SlippageTolerance = (props: Props) => {
  return (
    <div className="max-w-md   ">
      <Tabs defaultValue="account" className="w-fit">
        <TabsList className="">
          <TabsTrigger value="account">0.1%</TabsTrigger>
          <TabsTrigger value="password">0.3%</TabsTrigger>
          <TabsTrigger value="password">0.5%</TabsTrigger>
          <TabsTrigger value="password">1%</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
