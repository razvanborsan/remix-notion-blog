import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

// this object contains classes for each notion badge color
const badgeVariantsClasses = {
  default:
    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  blue: "border-transparent bg-notion-blue-50 text-notion-blue-100 hover:bg-blue-200 cursor-pointer",
  "blue-active":
    "border-transparent bg-blue-200 text-notion-blue-100 cursor-pointer",
  brown:
    "border-transparent bg-notion-brown-50 text-notion-brown-100 hover:bg-brown-200 cursor-pointer",
  "brown-active":
    "border-transparent bg-brown-200 text-notion-brown-100 cursor-pointer",
  gray: "border-transparent bg-notion-gray-50 text-notion-gray-100 hover:bg-gray-200 cursor-pointer",
  "gray-active":
    "border-transparent bg-gray-200 text-notion-gray-100 cursor-pointer",
  green:
    "border-transparent bg-notion-green-50 text-notion-green-100 hover:bg-green-200 cursor-pointer",
  "green-active":
    "border-transparent bg-green-200 text-notion-green-100 cursor-pointer",
  orange:
    "border-transparent bg-notion-orange-50 text-notion-orange-100 hover:bg-orange-200 cursor-pointer",
  "orange-active":
    "border-transparent bg-orange-200 text-notion-orange-100 cursor-pointer",
  pink: "border-transparent bg-notion-pink-50 text-notion-pink-100 hover:bg-pink-200 cursor-pointer",
  "pink-active":
    "border-transparent bg-pink-200 text-notion-pink-100 cursor-pointer",
  purple:
    "border-transparent bg-notion-purple-50 text-notion-purple-100 hover:bg-purple-200 cursor-pointer",
  "purple-active":
    "border-transparent bg-purple-200 text-notion-purple-100 cursor-pointer",
  red: "border-transparent bg-notion-red-50 text-notion-red-100 hover:bg-red-200 cursor-pointer",
  "red-active":
    "border-transparent bg-red-200 text-notion-red-100 cursor-pointer",
  yellow:
    "border-transparent bg-notion-yellow-50 text-notion-yellow-100 hover:bg-yellow-200 cursor-pointer",
  "yellow-active":
    "border-transparent bg-yellow-200 text-notion-yellow-100 cursor-pointer",
};

export type BadgeVariant = keyof typeof badgeVariantsClasses;

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: badgeVariantsClasses,
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
