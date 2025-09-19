"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
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

  const handleDownloadListClick = () => {
    // Convert array to text content
    const textContent = unresolvedBands.join("\n");

    // Create a Blob with the text content
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });

    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = url;
    link.download = "unresolved-bands.txt";

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the temporary URL
    URL.revokeObjectURL(url);
  };

  const content = (
    <div className="overflow-y-auto max-h-[300px] w-full rounded-md border">
      <div className="p-4 space-y-2">
        {unresolvedBands.map((band, index) => (
          <React.Fragment key={index}>
            <div className="text-sm">{band}</div>
            {index < unresolvedBands.length - 1 && (
              <Separator className="my-2" />
            )}
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
              Failed to map the following bands due to multiple or no matches.
              Please look them up manually.
            </DialogDescription>
          </DialogHeader>
          {content}
          <DialogFooter>
            <Button onClick={handleDownloadListClick}>
              <p>Download unresolved bands list</p>
            </Button>
          </DialogFooter>
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
            Failed to map the following bands due to multiple or no matches.
            Please look them up manually.
          </DrawerDescription>
        </DrawerHeader>
        {content}
        <DrawerFooter>
          <Button onClick={handleDownloadListClick}>
            <p>Download unresolved bands list</p>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
