import type { Event } from "./events";

const storageKey = "fic-nit-silchar-events";

export function loadLocalEvents(feedEvents: Event[]): Event[] {
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    window.localStorage.setItem(storageKey, JSON.stringify(feedEvents));
    return feedEvents;
  }

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed) || parsed.some((event) => !isStoredEvent(event))) {
    throw new Error("Saved event data is invalid. Clear this browser's FIC event manager storage and try again.");
  }
  return parsed;
}

export function saveLocalEvents(events: Event[]): void {
  window.localStorage.setItem(storageKey, JSON.stringify(events));
}

function isStoredEvent(event: unknown): event is Event {
  if (!event || typeof event !== "object") {
    return false;
  }
  const value = event as Record<string, unknown>;
  return (
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.category === "string" &&
    typeof value.date === "string" &&
    typeof value.dateLabel === "string" &&
    typeof value.time === "string" &&
    typeof value.venue === "string" &&
    typeof value.image === "string" &&
    typeof value.googleFormEmbedUrl === "string" &&
    typeof value.registrationDeadline === "string" &&
    (value.registrationStatus === "open" || value.registrationStatus === "closed") &&
    (value.accent === "lime" || value.accent === "cream" || value.accent === "orange")
  );
}
