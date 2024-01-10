# retry-async-action

A highly customizable utility to retry async actions

## Installation

`pnpm i retry-async-action`

## Usage

```ts
import { retryAsyncAction } from "retry-async-action";

const wait = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

console.log("Minimal example");
console.log(
  await retryAsyncAction(async () => {
    await wait(100);

    console.log(`This function only runs once!`);

    return "Hello world!";
  })
);

console.log("Basic example");
await retryAsyncAction(
  async () => {
    await wait(100);

    console.log(`You'll see this message 4 times: 1 initial call and 3 retries!`);

    // Simulate error
    throw new Error("Oops, something went wrong!");
  },
  {
    timeouts: [100, 200, 300],
  }
);

console.log("custom stop condition");
// Typed errors!
await retryAsyncAction<void, Error>(
  // You can access current action call number from the first argument
  async (currentActionCallNumber) => {
    await wait(100);

    if (currentActionCallNumber === 2) throw new Error("Oops, something went wrong!");
  },
  {
    timeouts: [100, 100, 100],
    // Don't stop retrying on resolve
    onResolve: () => false,
    onReject: (error) => {
      console.log(error.message);

      // Return true if you want to stop retrying
      return true;
    },
  }
);

console.log("Infinite polling example");
function* infiniteGenerator() {
  // yield timeout in ms
  while (true) yield 100;
}

await retryAsyncAction(
  async (currentActionCallNumber) => {
    await wait(100);

    console.log("Polling...");

    return currentActionCallNumber;
  },
  {
    timeouts: infiniteGenerator(),
    onResolve: (data) => {
      console.log(`Polling finished with data: ${data}`);

      // Return true if you want to stop retrying
      return data === 5;
    },
  }
);

console.log("Fallback example");
console.log(
  await retryAsyncAction(
    async () => {
      await wait(100);

      throw new Error("Oops, something went wrong!");
    },
    {
      // After 3 retries, fallback value will be returned
      timeouts: [100, 100, 100],
      fallback: "Fallback value",
    }
  )
);
```

See more examples in the test file!

## Types

```ts
declare type AsyncAction<T> = (currentActionCall: number) => Promise<T>;

export declare const retryAsyncAction: <T, E = unknown>(
  action: AsyncAction<T>,
  { timeouts, fallback, onResolve, onReject }?: RetryParams<T, E>
) => Promise<T | undefined>;

export declare type RetryParams<T, E = unknown> = {
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
```

## License

MIT
