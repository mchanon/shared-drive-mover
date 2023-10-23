import type { Page } from "@playwright/test";

/* eslint-disable @typescript-eslint/no-empty-function */

declare global {
  interface Window {
    _endpointStubs: Record<string, Array<EndpointStub>>;
  }
}

declare function _logEndpointCall(
  name: string,
  params: Array<google.script.Parameter>,
): void;

type Run = google.script.PublicEndpoints & google.script.RunnerFunctions;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SuccessHandlerType = (value?: any, object?: any) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FailureHandlerType = (error: Error, object?: any) => void;

type EndpointStub =
  | { status: "failure"; delay?: number; value: Error }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { status: "success"; delay?: number; value: any };

export async function setup(
  page: Page,
): Promise<(endpoint: string) => Array<Array<google.script.Parameter>>> {
  const calls: Record<string, Array<Array<google.script.Parameter>>> = {};

  await page.exposeFunction(
    "_logEndpointCall",
    (name: string, params: Array<google.script.Parameter>) => {
      if (!(name in calls)) {
        calls[name] = [];
      }
      calls[name].push(params);
    },
  );

  await page.evaluate(() => {
    window._endpointStubs = {} as Record<string, Array<EndpointStub>>;

    function endpointFn(
      successHandler: SuccessHandlerType,
      failureHandler: FailureHandlerType,
    ): Record<string, () => void> {
      const stubbedEndpoints: Record<string, () => void> = {};
      for (const key in window._endpointStubs) {
        stubbedEndpoints[key] = (
          ...args: Array<google.script.Parameter>
        ): void => {
          _logEndpointCall(key, args);
          const stub = window._endpointStubs[key].shift()!;
          setTimeout(() => {
            if (stub.status === "success") {
              successHandler(stub.value);
            } else {
              failureHandler(stub.value);
            }
          }, stub.delay ?? 0);
        };
      }
      return stubbedEndpoints;
    }

    const run: google.script.RunnerFunctions = {
      withFailureHandler: (failureHandler: FailureHandlerType): Run =>
        ({
          withSuccessHandler: (
            successHandler: SuccessHandlerType,
          ): Record<string, () => void> =>
            endpointFn(successHandler, failureHandler),
        }) as Run,
      withSuccessHandler: (successHandler: SuccessHandlerType): Run =>
        ({
          withFailureHandler: (
            failureHandler: FailureHandlerType,
          ): Record<string, () => void> =>
            endpointFn(successHandler, failureHandler),
        }) as Run,
      withUserObject: (): Run => ({}) as Run,
    };

    window.google = {
      script: {
        history: {
          push: (): void => {},
          replace: (): void => {},
          setChangeHandler: (): void => {},
        },
        host: {
          close: (): void => {},
          setHeight: (): void => {},
          setWidth: (): void => {},
          origin: "",
          editor: {
            focus: (): void => {},
          },
        },
        run: run as Run,
        url: {
          getLocation: (): void => {},
        },
      },
    };
  });

  return (endpoint: string) => calls[endpoint];
}