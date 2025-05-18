import { LoadingScreen } from "@/components/Common/LoadingScreen";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="flex w-full items-center justify-center mx-auto h-screen ">
      <LoadingScreen title="Loading TrunkSwap..." />;
    </div>
  );
}
