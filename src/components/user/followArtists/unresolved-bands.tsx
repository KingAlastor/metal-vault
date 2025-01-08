"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import useWindowSize from "@/lib/hooks/get-window-size";
import React from "react";

type UnresolvedBandsProps = {
  unresolvedBands: string[];
  isOpen: boolean;
  onClose: () => void;
};

export const UnresolvedBands: React.FC<UnresolvedBandsProps> = ({
  unresolvedBands,
  isOpen,
  onClose,
}) => {
  const size = useWindowSize();

  const content = (
    <div className="overflow-y-auto max-h-[300px] w-full rounded-md border">
      <div className="p-4 space-y-2">
        {unresolvedBands.map((band, index) => (
          <React.Fragment key={index}>
            <div className="text-sm">{band}</div>
            {index < unresolvedBands.length - 1 && <Separator className="my-2" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  if (size.width > 640) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unresolved Bands</DialogTitle>
            <DialogDescription>
              Failed to map the following bands. Please look them up manually.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Unresolved Bands</DrawerTitle>
          <DrawerDescription>
            Failed to map the following bands. Please look them up manually.
          </DrawerDescription>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  );
};
