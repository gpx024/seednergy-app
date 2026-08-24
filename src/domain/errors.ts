export type CycleDomainErrorCode =
  | "CURRENT_TIME_BEFORE_START"
  | "INVALID_DATE"
  | "INVALID_STAGE_DEFINITION"
  | "INVALID_STATUS_TRANSITION"
  | "INVALID_TIMEZONE"
  | "NOT_HARVEST_READY";

export class CycleDomainError extends Error {
  readonly code: CycleDomainErrorCode;
  readonly recoverable = true;

  constructor(code: CycleDomainErrorCode, message: string) {
    super(message);
    this.name = "CycleDomainError";
    this.code = code;
  }
}
