/**
 * Azure Function - Progress Check Timer
 *
 * Runs every hour to check user progress and send notifications.
 * Triggers the Next.js API route /api/notifications/check-progress
 */

import { AzureFunction, Context } from "@azure/functions";

const timerTrigger: AzureFunction = async function (
  context: Context,
  timer: unknown
): Promise<void> {
  const timestamp = new Date().toISOString();
  context.log(`Progress check function started at ${timestamp}`);

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  const cronSecret = process.env.CRON_SECRET;

  if (!appUrl) {
    context.log.error("APP_URL environment variable not set");
    return;
  }

  try {
    const response = await fetch(`${appUrl}/api/notifications/check-progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cronSecret && { Authorization: `Bearer ${cronSecret}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      context.log.error(`Progress check failed: ${response.status} - ${errorText}`);
      return;
    }

    const result = await response.json();
    context.log(
      `Progress check completed: ${result.notificationsQueued} notifications queued`
    );
  } catch (error) {
    context.log.error(`Progress check error: ${error}`);
  }
};

export default timerTrigger;
