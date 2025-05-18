"use client";

import { toast } from "sonner";
import { Button } from "../ui/Button";

export function SonnerDemo() {
  return (
    <Button
      variant="primary"
      className="border-none rounded-lg bg-forground"
      style={{
        border: "none",
        borderRadius: "none",
      }}
      onClick={() =>
        toast.success("Event has been created", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          style: {
            border: "none",
            borderRadius: "0px",
            background: "var(--background)",
          },
          actionButtonStyle: {
            color: "var(--title)",
          },
          cancelButtonStyle: {
            backgroundColor: "skyblue",
          },
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
      }
    >
      Show Toast
    </Button>
  );
}
