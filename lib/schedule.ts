import { DayOfWeek } from "@/types";

export interface TimeSlot {
  startTime: string; // "HH:mm" 24h
  endTime: string;   // "HH:mm" 24h
}

/**
 * Get current day of week in East Africa Time (EAT, UTC+3) or local
 */
export function getCurrentDayOfWeek(date = new Date()): DayOfWeek {
  const days: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days[date.getDay()];
}

/**
 * Get tomorrow day of week
 */
export function getTomorrowDayOfWeek(date = new Date()): DayOfWeek {
  const days: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days[(date.getDay() + 1) % 7];
}

/**
 * Check if a schedule slot is currently active based on current time
 * @param dayOfWeek "MONDAY"
 * @param startTime "07:00"
 * @param endTime "10:00"
 * @param date Reference Date object (defaults to current date)
 */
export function isSlotActive(
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  date = new Date()
): boolean {
  const currentDay = getCurrentDayOfWeek(date);
  if (dayOfWeek.toUpperCase() !== currentDay) return false;

  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const startMinutes = startH * 60 + (startM || 0);
  let endMinutes = endH * 60 + (endM || 0);

  // If show crosses midnight (e.g. 22:00 to 02:00)
  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Resolve current active show and next 3-5 upcoming shows
 */
export function resolveCurrentAndUpcoming<T extends { dayOfWeek: string; startTime: string; endTime: string }>(
  schedules: T[],
  date = new Date()
): { current: T | null; upcoming: T[] } {
  const currentDay = getCurrentDayOfWeek(date);
  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  let current: T | null = null;
  const upcoming: T[] = [];

  // Filter for today's schedules sorted by start time
  const todaySchedules = schedules
    .filter((s) => s.dayOfWeek.toUpperCase() === currentDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  for (const s of todaySchedules) {
    if (isSlotActive(s.dayOfWeek, s.startTime, s.endTime, date)) {
      current = s;
    } else {
      const [startH, startM] = s.startTime.split(":").map(Number);
      const startMin = startH * 60 + (startM || 0);
      if (startMin > currentMinutes) {
        upcoming.push(s);
      }
    }
  }

  // If fewer than 3 upcoming today, pick from tomorrow
  if (upcoming.length < 3) {
    const tomorrowDay = getTomorrowDayOfWeek(date);
    const tomorrowSchedules = schedules
      .filter((s) => s.dayOfWeek.toUpperCase() === tomorrowDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (const s of tomorrowSchedules) {
      if (upcoming.length >= 5) break;
      upcoming.push(s);
    }
  }

  // Fallback if no currently active slot found: take the first show or null
  if (!current && todaySchedules.length > 0) {
    current = todaySchedules[0];
  }

  return { current, upcoming: upcoming.slice(0, 4) };
}
