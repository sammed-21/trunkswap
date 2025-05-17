import { LoadingScreen } from "@/components/Common/LoadingScreen";
import { SwapComponent } from "@/components/SwapWidgets/SwapComponent";
import { Suspense } from "react";
export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <LoadingScreen />
        </div>
      }
    >
      <div className="w-full px-4 relative h-full mx-auto py-10  gap-4 flex flex-col md:flex-row  items-start justify-center">
        <SwapComponent />
      </div>
    </Suspense>
  );
}
