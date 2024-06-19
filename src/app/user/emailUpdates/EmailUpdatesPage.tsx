"use client";

import { User } from "next-auth";

interface EmailUpdatesPageProps {
    user: User;
  }

export default function EmailUpdatesPage({user}: EmailUpdatesPageProps) {
    return (
        <p>Email updates setup</p>
    )
}