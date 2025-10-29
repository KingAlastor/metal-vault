"use server";

import { queryRunner } from "../db";
import { getSession } from "../session/server-actions";
import { logUnauthorizedAccess } from "../loggers/auth-log";

export type FeedbackData = {
  title: string;
  comment: string;
};

export async function postUserFeedback(
  data: FeedbackData
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();

  if (!session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    return {
      success: false,
      error: "User must be logged in to post feedback.",
    };
  }

  try {
    await queryRunner`
      INSERT INTO user_feedback (
        user_id,
        title,
        comment,
        created_at
      ) VALUES (
        ${session.userId},
        ${data.title},
        ${data.comment},
        NOW() AT TIME ZONE 'UTC'
      )
    `;

    return { success: true };
  } catch (error) {
    console.error("Error posting user feedback:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getUserFeedback(): Promise<
  Array<FeedbackData & { id: string; createdAt: Date }>
> {
  const session = await getSession();

  if (!session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    return [];
  }

  try {
    const feedback = await queryRunner`
      SELECT 
        id,
        title,
        comment,
        created_at as "createdAt"
      FROM user_feedback
      WHERE user_id = ${session.userId}
      ORDER BY created_at DESC
    `;

    return feedback.map((row) => ({
      id: row.id,
      title: row.title,
      comment: row.comment,
      createdAt: row.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching user feedback:", error);
    return [];
  }
}

export async function deleteUserFeedback(
  feedbackId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();

  if (!session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    return {
      success: false,
      error: "User must be logged in to delete feedback.",
    };
  }

  try {
    // Verify the feedback belongs to the user
    const feedback = await queryRunner`
      SELECT 1 FROM user_feedback
      WHERE id = ${feedbackId} AND user_id = ${session.userId}
    `;

    if (!feedback.length) {
      return { success: false, error: "Feedback not found or unauthorized." };
    }

    await queryRunner`
      DELETE FROM user_feedback
      WHERE id = ${feedbackId} AND user_id = ${session.userId}
    `;

    return { success: true };
  } catch (error) {
    console.error("Error deleting user feedback:", error);
    return { success: false, error: (error as Error).message };
  }
}
