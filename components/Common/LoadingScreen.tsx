import Image from "next/image";
import React from "react";
import Gif from "@/public/trunkswap.gif";
type Props = {};

export const LoadingScreen = (props: Props) => {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center mx-auto">
      <Image
        src={Gif}
        width={100}
        height={100}
        className="object-cover w-fit h-fit"
        alt="gif"
      />
    </div>
  );
};
