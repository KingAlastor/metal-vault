import { useDeleteEventMutation } from "./hooks/use-delete-event-mutation";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Event } from "./event-types";

type DeleteEventDialogProps = {
  event: Event;
  open: boolean;
  onClose: () => void;
};

export function DeleteEventDialog({
  event,
  open,
  onClose,
}: DeleteEventDialogProps) {
  const mutation = useDeleteEventMutation();

  function handleOnOpenChange(open: boolean) {
    if (!open || !mutation.isPending) {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOnOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete event?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this event?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate(event.id, { onSuccess: onClose })}
            disabled={mutation.isPending}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
