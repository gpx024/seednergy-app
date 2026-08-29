export interface AccountService {
  deleteCurrentAccount(): Promise<void>;
  exportCurrentAccount(): Promise<unknown>;
}
