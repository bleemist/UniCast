import { DayOfWeek } from "@/types";

export interface TimeSlot {
  startTime: string; // "HH:mm" 24h
  endTime: string;   // "HH:mm" 24h
}

export const STATION_TIMEZONE = "Africa/Kampala";

/**
 * Get current time parts in Africa/Kampala timezone (EAT, UTC+3)
 */
export function getKampalaTime(date = new Date()): {
  dayOfWeek: DayOfWeek;
  hours: number;
  minutes: number;
  totalMinutes: number;
} {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: STATION_TIMEZONE,
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const weekday = (parts.find((p) => p.type === "weekday")?.value?.toUpperCase() ||
      "MONDAY") as DayOfWeek;
    let hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    // In some Node versions hour12: false can return 24 for midnight
    if (hour === 24) hour = 0;
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);

    return {
      dayOfWeek: weekday,
      hours: hour,
      minutes: minute,
      totalMinutes: hour * 60 + minute,
    };
  } catch (error) {
    // Fallback if Intl fails
    const days: DayOfWeek[] = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const utcHours = date.getUTCHours() + 3; // EAT is UTC+3
    const hours = (utcHours % 24 + 24) % 24;
    const dayShift = Math.floor(utcHours / 24);
    const dayIndex = (date.getUTCDay() + dayShift + 7) % 7;
    return {
      dayOfWeek: days[dayIndex],
      hours,
      minutes: date.getUTCMinutes(),
      totalMinutes: hours * 60 + date.getUTCMinutes(),
    };
  }
}

export function getCurrentDayOfWeek(date = new Date()): DayOfWeek {
  return getKampalaTime(date).dayOfWeek;
}

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
  const currentDay = getCurrentDayOfWeek(date);
  const currentIndex = days.indexOf(currentDay);
  return days[(currentIndex + 1) % 7];
}

/**
 * Check if a schedule slot is currently active based on Africa/Kampala time
 */
export function isSlotActive(
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  date = new Date()
): boolean {
  const kampala = getKampalaTime(date);
  if (dayOfWeek.toUpperCase() !== kampala.dayOfWeek) return false;

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const startMinutes = startH * 60 + (startM || 0);
  let endMinutes = endH * 60 + (endM || 0);

  // If show crosses midnight (e.g. 22:00 to 02:00)
  if (endMinutes < startMinutes) {
    return kampala.totalMinutes >= startMinutes || kampala.totalMinutes < endMinutes;
  }

  return kampala.totalMinutes >= startMinutes && kampala.totalMinutes < endMinutes;
}

/**
 * Resolve current active show and next 3-5 upcoming shows in Africa/Kampala timezone
 */
export function resolveCurrentAndUpcoming<
  T extends { dayOfWeek: string; startTime: string; endTime: string }
>(
  schedules: T[],
  date = new Date()
): { current: T | null; upcoming: T[] } {
  const kampala = getKampalaTime(date);
  let current: T | null = null;
  const upcoming: T[] = [];

  // Filter for today's schedules in Africa/Kampala
  const todaySchedules = schedules
    .filter((s) => s.dayOfWeek.toUpperCase() === kampala.dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  for (const s of todaySchedules) {
    if (isSlotActive(s.dayOfWeek, s.startTime, s.endTime, date)) {
      current = s;
    } else {
      const [startH, startM] = s.startTime.split(":").map(Number);
      const startMin = startH * 60 + (startM || 0);
      if (startMin > kampala.totalMinutes) {
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
