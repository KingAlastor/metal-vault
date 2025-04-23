"use client";

import { useState } from "react";
import { DeleteUserDialog } from "./delete-user-dialog";
import { Button } from "@/components/ui/button";
import ProfileSettingsForm from "./profile-settings-form";
import { FirstTimeUserNotice } from "@/components/shared/first-time-user-notice";
import { useSession, useUser } from "@/lib/session/client-hooks";
import { logout } from "@/lib/session/server-actions";
import { deleteUserPendingAction, updateUserData } from "@/lib/data/user-data";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data: user } = useUser(session?.userId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    logout();
  };

  const [isFirstTimeUser, setIsFirstTimeUser] = useState(
    user?.pending_actions?.includes("firstLogin") ?? false
  );

  const handleNoticeDismiss = async () => {
    await deleteUserPendingAction("firstLogin");
    const pendingActions = user?.pending_actions?.filter(
      (action) => action !== "firstLogin"
    );
    await updateUserData({ pending_actions: pendingActions });
    setIsFirstTimeUser(false);
  };

  return (
    <main>
      <section>
        {isFirstTimeUser && (
          <FirstTimeUserNotice
            title="Welcome to Your profile!"
            description="Change your username, add your desired location and favorite genres which you can use for advanced filtering in your posts/events/releases etc feeds."
            onDismiss={handleNoticeDismiss}
          />
        )}
        <h1 className="text-3xl font-bold">Profile</h1>
        <ProfileSettingsForm />
        <div className="mt-8 pt-4 border-t">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Danger Zone
          </h2>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            type="button"
          >
            Delete Account
          </Button>
        </div>
      </section>
      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      />
    </main>
  );
}
