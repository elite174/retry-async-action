type AsyncAction<T> = (currentActionCall: number) => Promise<T>;

export type RetryParams<T, E = unknown> = {
  /**
   * Function called when action is fulfilled.
   * Return true to stop retries
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

async function* createRetryGenerator(timeouts: Iterable<number> = []) {
  let iteration = 0;

  yield iteration++;

  for (const time of timeouts) {
    // Ignore timeout if it is 0
    yield time === 0
      ? iteration++
      : await new Promise<number>((resolve) => {
          setTimeout(() => resolve(iteration++), time);
        });
  }
}

export const retryAsyncAction = async <T, E = unknown>(
  action: AsyncAction<T>,
  { timeouts, fallback, onResolve, onReject }: RetryParams<T, E> = {}
) => {
  for await (const actionCallNumber of createRetryGenerator(timeouts)) {
    try {
      const data = await action(actionCallNumber);

      if (onResolve?.(data, actionCallNumber) === false) continue;
      else return data;
    } catch (error) {
      if (onReject?.(error as E, actionCallNumber)) return fallback;
      else continue;
    }
  }

  return fallback;
};
