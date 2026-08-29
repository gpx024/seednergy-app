const quietTimePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function isValidQuietTime(value: string): boolean {
  return quietTimePattern.test(value);
}

export function validateQuietHours(start: string, end: string): void {
  if (!isValidQuietTime(start) || !isValidQuietTime(end)) {
    throw new Error("Quiet hours must use 24-hour HH:MM times, for example 21:00 and 08:00.");
  }
  if (start === end) throw new Error("Quiet hours must have different start and end times.");
}
