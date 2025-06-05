import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 h-full w-full border-r bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out",
        side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        className
      )}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose }; 