"use client";

import { useState } from "react";
import { DeleteUserDialog } from "./delete-user-dialog";
import { Button } from "@/components/ui/button";
import { authClient, signOut, useSession } from "@/lib/auth/auth-client";
import ProfileSettingsForm from "./profile-settings-form";
import { FirstTimeUserNotice } from "@/components/shared/first-time-user-notice";
import { deleteUserPendingAction } from "@/lib/data/user/profile/profile-data-actions";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    signOut();
  };

  const [isFirstTimeUser, setIsFirstTimeUser] = useState(
    user?.pendingActions?.includes("firstLogin") ?? false
  );

  const handleNoticeDismiss = async () => {
    await deleteUserPendingAction("firstLogin");
    const pendingActions = user?.pendingActions?.filter(
      (action) => action !== "firstLogin"
    );
    await authClient.updateUser({
      pendingActions,
    });
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
