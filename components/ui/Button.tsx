import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "hover:bg-secondary border-border border-[1px] text-white bg-primary rounded-none",
        white:
          "bg-white text-black border-textprimary font-semibold text-xl w-fit",
        Blue: "text-primary-light-blue bg-primary",
        Pink: "bg-primary-pink text-primary-light-pink",
        Primary: "bg-primary text-primary",
        default:
          "bg-primary hover:bg-primary-500 rounded-none text-primary-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-none px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
type ButtonProps = {
  className?: string;
  variant: any;
  size?: any;
  asChild?: boolean;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          `${!props.disabled ? "cursor-pointer" : "cursor-not-allowed"}`,
          buttonVariants({ variant, size, className })
        )}
        ref={ref}
        {...props}
      >
        <div className="flex items-center justify-center">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {props.children}
        </div>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
