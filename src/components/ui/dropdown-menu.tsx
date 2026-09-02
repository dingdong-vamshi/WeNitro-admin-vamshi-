"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { DropdownMenu as RadixDropdownMenu } from "@radix-ui/themes";

// Root, Trigger, Sub ─ pass through Radix Themes components
const DropdownMenu = RadixDropdownMenu.Root;
// Use raw primitive for Trigger so callers can use asChild
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuSub = RadixDropdownMenu.Sub;

// Group and Portal have no Radix Themes equivalent; keep the raw primitives
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

// Styled content / items from Radix Themes
const DropdownMenuContent = RadixDropdownMenu.Content;
const DropdownMenuItem = RadixDropdownMenu.Item;
const DropdownMenuLabel = RadixDropdownMenu.Label;
const DropdownMenuSeparator = RadixDropdownMenu.Separator;
const DropdownMenuCheckboxItem = RadixDropdownMenu.CheckboxItem;
const DropdownMenuRadioGroup = RadixDropdownMenu.RadioGroup;
const DropdownMenuRadioItem = RadixDropdownMenu.RadioItem;
const DropdownMenuSubTrigger = RadixDropdownMenu.SubTrigger;
const DropdownMenuSubContent = RadixDropdownMenu.SubContent;

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
