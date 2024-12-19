"use client";

import {
  Dialog,
  DialogContent,
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

  return (
    <>
      {size.width > 640 ? (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle> Unresolved Bands</DialogTitle>
              <DrawerDescription>
                Failed to map the following bands. Please look them up manually.
              </DrawerDescription>
            </DialogHeader>
            {unresolvedBands.map((band, index) => {
              return <p key={index}>{band}</p>;
            })}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isOpen} onOpenChange={onClose}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Unresolved Bands</DrawerTitle>
              <DrawerDescription>
                Failed to map the following bands. Please look them up manually.
              </DrawerDescription>
            </DrawerHeader>
            {unresolvedBands.map((band, index) => {
              return <p key={index}>{band}</p>;
            })}
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};
