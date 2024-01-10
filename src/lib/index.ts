type AsyncAction<T> = (currentActionCall: number) => Promise<T>;

export type RetryParams<T, E = unknown> = {
  /** Function called when action is fulfilled.
   *  Return true to stop retries
   */
  onResolve?: (data: T, actionCallNumber: number) => boolean;
  /**
   * Function called when action is rejected.
   * Return true to stop retries
   */
  onReject?: (error: E, actionCallNumber: number) => boolean;
  /** Timeouts between retries */
  timeouts?: Iterable<number>;
  /** Fallback value which returns when action was rejected */
  fallback?: T;
};

async function* createRetryGenerator<T>(action: AsyncAction<T>, timeouts: Iterable<number> = []) {
  yield action;

  for (const time of timeouts) {
    // Ignore timeout if it is 0
    yield time === 0
      ? action
      : await new Promise<AsyncAction<T>>((resolve) => {
          setTimeout(() => resolve(action), time);
        });
  }
}

export const retryAsyncAction = async <T, E = unknown>(
  action: AsyncAction<T>,
  { timeouts, fallback, onResolve, onReject }: RetryParams<T, E> = {}
) => {
  let actionCallNumber = 0;

  for await (const nextAction of createRetryGenerator(action, timeouts)) {
    try {
      actionCallNumber++;
      const data = await nextAction(actionCallNumber);

      if (onResolve && onResolve(data, actionCallNumber) === false) continue;
      else return data;
    } catch (error) {
      if (onReject?.(error as E, actionCallNumber)) return fallback;
      else continue;
    }
  }

  return fallback;
};
