/**
 * Time-based greeting utilities
 *
 * Provides human-friendly greetings based on the time of day.
 */

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

/**
 * Get the current time of day based on the hour.
 *
 * Time ranges:
 * - Morning: 5:00 AM - 11:59 AM
 * - Afternoon: 12:00 PM - 4:59 PM
 * - Evening: 5:00 PM - 8:59 PM
 * - Night: 9:00 PM - 4:59 AM
 */
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 17) {
    return "afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "evening";
  } else {
    return "night";
  }
}

/**
 * Get a simple greeting based on time of day.
 *
 * Examples:
 * - "Good morning"
 * - "Good afternoon"
 * - "Good evening"
 * - "Good night"
 */
export function getSimpleGreeting(date: Date = new Date()): string {
  const timeOfDay = getTimeOfDay(date);

  switch (timeOfDay) {
    case "morning":
      return "Good morning";
    case "afternoon":
      return "Good afternoon";
    case "evening":
      return "Good evening";
    case "night":
      return "Good night";
  }
}

/**
 * Get a personalized greeting with the user's name.
 *
 * Examples:
 * - "Good morning, Erik"
 * - "Good afternoon, Erik"
 */
export function getPersonalizedGreeting(
  name: string | null | undefined,
  date: Date = new Date()
): string {
  const greeting = getSimpleGreeting(date);

  if (!name || name.trim() === "") {
    return greeting;
  }

  // Get first name only
  const firstName = name.trim().split(" ")[0];

  return `${greeting}, ${firstName}`;
}

/**
 * Get a contextual greeting message for goal setting.
 * These are more conversational and encouraging.
 */
export function getGoalSettingGreeting(
  name: string | null | undefined,
  date: Date = new Date()
): { greeting: string; message: string } {
  const timeOfDay = getTimeOfDay(date);
  const firstName = name?.trim().split(" ")[0] || "";

  const greetingWithName = firstName
    ? `${getSimpleGreeting(date)}, ${firstName}`
    : getSimpleGreeting(date);

  // Contextual messages based on time of day
  const messages: Record<TimeOfDay, string[]> = {
    morning: [
      "Ready to start the day with purpose?",
      "A fresh start to set meaningful goals.",
      "Let's make today count.",
    ],
    afternoon: [
      "Taking time to focus on what matters.",
      "Perfect time to set your intentions.",
      "Let's turn your ambitions into action.",
    ],
    evening: [
      "Winding down? Let's plan ahead.",
      "Reflect and set goals for tomorrow.",
      "A quiet moment to think about what's next.",
    ],
    night: [
      "Planning while the world sleeps.",
      "Late night goal setting? Love the dedication.",
      "Dreaming big? Let's capture those goals.",
    ],
  };

  const timeMessages = messages[timeOfDay];
  const randomMessage = timeMessages[Math.floor(Math.random() * timeMessages.length)];

  return {
    greeting: greetingWithName,
    message: randomMessage,
  };
}

/**
 * Get a casual, friendly greeting variation.
 * More informal than the standard greeting.
 */
export function getCasualGreeting(
  name: string | null | undefined,
  date: Date = new Date()
): string {
  const timeOfDay = getTimeOfDay(date);
  const firstName = name?.trim().split(" ")[0] || "";

  const casualGreetings: Record<TimeOfDay, string[]> = {
    morning: ["Morning", "Hey there", "Rise and shine"],
    afternoon: ["Hey", "Hi there", "Hello"],
    evening: ["Hey", "Evening", "Hi there"],
    night: ["Hey night owl", "Burning the midnight oil", "Hey there"],
  };

  const greetings = casualGreetings[timeOfDay];
  const greeting = greetings[0]; // Use first option for consistency

  return firstName ? `${greeting}, ${firstName}` : greeting;
}

/**
 * Format the current time in a human-readable way.
 *
 * Examples:
 * - "Tuesday morning"
 * - "Friday afternoon"
 */
export function getHumanReadableTime(date: Date = new Date()): string {
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const timeOfDay = getTimeOfDay(date);

  return `${dayName} ${timeOfDay}`;
}
