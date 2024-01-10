export type RetryParams<T, E = unknown> = {
  /** When to stop retries */
  stopWhen: (
    actionResult: {
      /** Current number of action call */
      actionCallNumber: number;
    } & ({ status: "fullfilled"; data: T } | { status: "rejected"; error: E })
  ) => boolean;
  /** Timeouts between retries */
  timeouts?: number[];
  /**
   * Whether to retry on reject
   * @default true
   */
  retryOnReject?: boolean;
  /** Fallback value which returns when action was rejected */
  fallback?: T;
};

async function* createRetryGenerator<T>(action: () => Promise<T>, timeouts: number[] = []) {
  yield action;

  for (const time of timeouts) {
    // Ignore timeout if it is 0
    yield time === 0
      ? action
      : await new Promise<() => Promise<T>>((resolve) => {
          setTimeout(() => resolve(action), time);
        });
  }
}

export const retryAsyncAction = async <T, E = unknown>(
  action: () => Promise<T>,
  { timeouts, stopWhen, retryOnReject = true, fallback }: RetryParams<T, E>
) => {
  let data = fallback;
  let actionCallNumber = 0;

  for await (const nextAction of createRetryGenerator(action, timeouts)) {
    try {
      actionCallNumber++;
      data = await nextAction();

      if (stopWhen?.({ status: "fullfilled", data, actionCallNumber })) return data;
    } catch (error) {
      if (!retryOnReject || stopWhen?.({ status: "rejected", error: error as E, actionCallNumber })) return fallback;
      else continue;
    }
  }

  return data;
};
