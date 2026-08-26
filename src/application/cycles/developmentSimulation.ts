const millisecondsPerDay = 86_400_000;

export function startedAtForSimulatedCycleDay(targetDay: number, now = new Date()): string {
  if (!Number.isInteger(targetDay) || targetDay < 1) throw new Error("A simulated cycle day must be a positive whole number.");
  if (Number.isNaN(now.getTime())) throw new Error("A simulation requires a valid current date.");
  return new Date(now.getTime() - (targetDay - 1) * millisecondsPerDay).toISOString();
}
