import { describe, test, vi } from "vitest";

import { retryAsyncAction } from ".";

describe.concurrent(`${retryAsyncAction.name}`, () => {
  test("should retry action", async ({ expect }) => {
    const action = vi.fn().mockRejectedValue(new Error("Oops, something went wrong!"));

    await retryAsyncAction(action, { timeouts: [100, 200, 300] });

    expect(action).toHaveBeenCalledTimes(4);
  });

  test("should stop retrying on resolve", async ({ expect }) => {
    const action = vi.fn().mockRejectedValueOnce(new Error("Oops, something went wrong!"));

    await retryAsyncAction(action, {
      timeouts: [100, 200, 300],
      onResolve: () => true,
    });

    expect(action).toHaveBeenCalledTimes(2);
  });

  test("should stop retrying on reject", async ({ expect }) => {
    const action = vi.fn().mockRejectedValueOnce(new Error("Oops, something went wrong!"));

    await retryAsyncAction(action, {
      timeouts: [100, 200, 300],
      onReject: () => true,
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  test("should return fallback value", async ({ expect }) => {
    const action = vi.fn().mockRejectedValue(new Error("Oops, something went wrong!"));

    const fallback = "fallback";

    const result = await retryAsyncAction(action, {
      timeouts: [100, 200, 300],
      fallback,
    });

    expect(result).toBe(fallback);
  });

  test("should return data", async ({ expect }) => {
    const action = vi.fn().mockResolvedValueOnce("data");

    const result = await retryAsyncAction(action, {
      timeouts: [100, 200, 300],
    });

    expect(result).toBe("data");
  });

  test("should return data on resolve", async ({ expect }) => {
    const action = vi.fn().mockResolvedValueOnce("data");

    const result = await retryAsyncAction(action, {
      timeouts: [100, 200, 300],
      onResolve: () => true,
    });

    expect(result).toBe("data");
  });

  test("should return fallback value on reject", async ({ expect }) => {
    const action = vi.fn().mockRejectedValueOnce(new Error("Oops, something went wrong!"));

    const fallback = "fallback";

    const result = await retryAsyncAction(action, {
      timeouts: [100, 200, 300],
      onReject: () => true,
      fallback,
    });

    expect(result).toBe(fallback);
  });

  test("should return fallback value on reject", async ({ expect }) => {
    const action = vi.fn().mockRejectedValueOnce(new Error("Oops, something went wrong!"));

    const fallback = "fallback";

    const result = await retryAsyncAction(action, {
      timeouts: [100, 200, 300],
      onReject: () => true,
      fallback,
    });

    expect(result).toBe(fallback);
  });
});
