import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { deleteUser } from "@/lib/data/user-data";

type DeleteUserDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function DeleteUserDialog({ open, onClose }: DeleteUserDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await deleteUser();
      onClose();
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}