import { describe, expect, test } from "vitest";

import { retryAsyncAction } from ".";

describe(`${retryAsyncAction.name}`, () => {
  test("should return result of action if it is not rejected", async () => {
    const result = await retryAsyncAction(() => Promise.resolve(true), {
      timeouts: [],
      stopWhen: () => true,
    });

    expect(result).toBe(true);
  });

  test("should return fallback if action is rejected and retryOnReject is false", async () => {
    const result = await retryAsyncAction(() => Promise.reject(), {
      timeouts: [],
      stopWhen: () => true,
      retryOnReject: false,
      fallback: false,
    });

    expect(result).toBe(false);
  });

  test("should retry action if it is rejected and retryOnReject is true", async () => {
    const result = await retryAsyncAction(() => Promise.reject(), {
      timeouts: [0],
      stopWhen: () => true,
      retryOnReject: true,
    });

    expect(result).toBe(undefined);
  });

  test("should return fallback if action is rejected and retryOnReject is true and all retries are exhausted", async () => {
    const result = await retryAsyncAction(() => Promise.reject(), {
      timeouts: [0],
      stopWhen: () => true,
      retryOnReject: true,
      fallback: false,
    });

    expect(result).toBe(false);
  });

  test("should run action valid number of times", async () => {
    let count = 0;

    await retryAsyncAction(
      () => {
        count++;
        return Promise.reject();
      },
      {
        timeouts: [0, 0, 0],
        stopWhen: () => false,
        retryOnReject: true,
      }
    );

    expect(count).toBe(4);
  });

  test("should stop retrying if stopWhen returns true", async () => {
    let count = 0;

    await retryAsyncAction(
      () => {
        count++;
        return Promise.resolve(count);
      },
      {
        timeouts: [0, 0, 0],
        stopWhen: () => count === 2,
        retryOnReject: true,
      }
    );

    expect(count).toBe(2);
  });

  test("should stop retrying if stopWhen returns true even if action is rejected", async () => {
    let count = 0;

    await retryAsyncAction(
      () => {
        count++;
        return Promise.reject();
      },
      {
        timeouts: [0, 0, 0],
        stopWhen: () => count === 2,
        retryOnReject: true,
      }
    );

    expect(count).toBe(2);
  });

  test("should return fallback if action is rejected and stopWhen returns true", async () => {
    const result = await retryAsyncAction(() => Promise.reject(), {
      timeouts: [0, 0, 0],
      stopWhen: () => true,
      retryOnReject: true,
      fallback: false,
    });

    expect(result).toBe(false);
  });

  test("should return fallback if action is rejected and stopWhen returns true even if retryOnReject is false", async () => {
    const result = await retryAsyncAction(() => Promise.reject(), {
      timeouts: [0, 0, 0],
      stopWhen: () => true,
      retryOnReject: false,
      fallback: false,
    });

    expect(result).toBe(false);
  });

  test("should return fallback if action is rejected and stopWhen returns true even if retryOnReject is true", async () => {
    const result = await retryAsyncAction(() => Promise.reject(), {
      timeouts: [0, 0, 0],
      stopWhen: () => true,
      retryOnReject: true,
      fallback: false,
    });

    expect(result).toBe(false);
  });

  test("should return fallback if action is rejected and stopWhen returns true even if retryOnReject is true and all retries are exhausted", async () => {
    const result = await retryAsyncAction(() => Promise.reject(), {
      stopWhen: () => true,
      timeouts: [0, 0, 0],
      retryOnReject: true,
      fallback: false,
    });

    expect(result).toBe(false);
  });

  test("should return valid number of action calls in stopWhen", async () => {
    let count = 0;

    await retryAsyncAction(
      () => {
        count++;
        return Promise.reject();
      },
      {
        timeouts: [0, 0, 0],
        stopWhen: ({ actionCallNumber }) => actionCallNumber === 2,
        retryOnReject: true,
      }
    );

    expect(count).toBe(2);
  });
});
