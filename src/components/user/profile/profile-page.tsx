"use client";

import { useState } from "react";
import { DeleteUserDialog } from "./delete-user-dialog";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import ProfileSettingsForm from "./profile-settings-form";
import { FirstTimeUserNotice } from "@/components/shared/first-time-user-notice";
import { User } from "next-auth";
import { deleteUserPendingAction } from "@/lib/data/user/profile/profile-data-actions";

interface ProfilePageProps {
  user: User;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    signOut({ callbackUrl: "/" });
  };

  const [isFirstTimeUser, setIsFirstTimeUser] = useState(user.pendingActions.includes("firstLogin"));

  const handleNoticeDismiss = async () => {
    await deleteUserPendingAction("firstLogin");
    console.log("Notice dismissed");
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
        <ProfileSettingsForm user={user} />
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
