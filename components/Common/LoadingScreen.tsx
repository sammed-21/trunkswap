import Image from "next/image";
import React from "react";
import Gif from "@/public/trunkswap.gif";
type Props = {};

export const LoadingScreen = (props: Props) => {
  return (
    <div className="w-full flex-col min-h-[400px]  flex items-center justify-center mx-auto">
      <Image
        src={Gif}
        width={50}
        height={50}
        className="object-cover w-[90px] h-fit"
        alt="gif"
      />

      <h1 className="text-title"> loading....</h1>
    </div>
  );
};
