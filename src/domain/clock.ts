import { CycleDomainError } from "./errors";

export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class TestClock implements Clock {
  private currentTime: Date;

  constructor(initialTime: Date | string) {
    this.currentTime = toValidDate(initialTime);
  }

  now(): Date {
    return new Date(this.currentTime.getTime());
  }

  set(time: Date | string): void {
    this.currentTime = toValidDate(time);
  }

  advanceHours(hours: number): void {
    this.currentTime = new Date(this.currentTime.getTime() + hours * 60 * 60 * 1000);
  }

  advanceDays(days: number): void {
    this.advanceHours(days * 24);
  }
}

function toValidDate(value: Date | string): Date {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new CycleDomainError("INVALID_DATE", "The clock requires a valid date.");
  }
  return date;
}
