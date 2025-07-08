"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  SheetTrigger
} from "@/components/ui/sheet"
import { ReactNode } from "react"

interface DashboardSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  trigger?: ReactNode
  footer?: ReactNode
  side?: "left" | "right" | "top" | "bottom"
  size?: "sm" | "md" | "lg" | "xl"
}

export default function DashboardSheet(props: DashboardSheetProps) {
  const {
    open,
    onOpenChange,
    title,
    description,
    children,
    trigger,
    footer,
    side = "right",
    size = "md"
  } = props;
  // Map size prop to width classes
  let widthClass = "";
  switch (size) {
    case "sm":
      widthClass = "sm:max-w-sm w-full";
      break;
    case "md":
      widthClass = "sm:max-w-md w-full";
      break;
    case "lg":
      widthClass = "sm:max-w-lg w-full";
      break;
    case "xl":
      widthClass = "sm:max-w-xl w-full";
      break;
    default:
      widthClass = "sm:max-w-md w-full";
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side={side} className={widthClass}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="py-4">{children}</div>
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  )
}
