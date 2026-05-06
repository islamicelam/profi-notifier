export const IDEMPOTENCY_STORE = Symbol('IDEMPOTENCY_STORE');

export interface IdempotencyStore {
  /**
   * Atomically marks an eventId as processed.
   * Returns true if the eventId was new, false if it was already seen.
   */
  markIfNotSeen(eventId: string): Promise<boolean>;
}
