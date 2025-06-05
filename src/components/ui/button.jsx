import React from 'react';
import { cn } from '../../lib/utils';
import { Slot } from '@radix-ui/react-slot';

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  asChild = false,
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : "button";
  
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-gray-800 text-white hover:bg-gray-700": variant === "default",
          "bg-transparent hover:bg-gray-700": variant === "ghost",
          "h-9 px-4": size === "default",
          "h-8 px-3 text-sm": size === "sm",
          "h-9 w-9": size === "icon",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button }; 