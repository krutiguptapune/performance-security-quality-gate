import { describe, expect, it, vi } from "vitest";
import {
  ApiClient,
  ApiClientError
} from "../src/api/api-client.js";

describe("ApiClient", () => {

  it("retries a 500 error and succeeds", async () => {

    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response('{"success":false}', { status: 500 })
      )
      .mockResolvedValueOnce(
        new Response('{"success":true}', { status: 200 })
      );

    const sleepMock = vi.fn(
      async (_ms: number) => {}
    );

    const loggerMock = vi.fn();

    const client = new ApiClient({
      baseUrl: "https://example.com",
      maxRetries: 2,
      baseDelayMs: 300,
      fetchImpl: fetchMock,
      sleep: sleepMock,
      logger: loggerMock,
      createCorrelationId: () => "test-id"
    });

    const result = await client.request<{ success: boolean }>(
      "/booking"
    );

    expect(result.data.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.correlationId).toBe("test-id");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sleepMock).toHaveBeenCalledWith(300);
    expect(loggerMock).toHaveBeenCalledTimes(2);

    const requestOptions = fetchMock.mock.calls[0]?.[1];

    expect(
      new Headers(requestOptions?.headers)
        .get("X-Correlation-ID")
    ).toBe("test-id");
  });


  it("does not retry a 400 error", async () => {

    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValue(
        new Response("Bad Request", { status: 400 })
      );

    const sleepMock = vi.fn(
      async (_ms: number) => {}
    );

    const client = new ApiClient({
      baseUrl: "https://example.com",
      fetchImpl: fetchMock,
      sleep: sleepMock
    });

    await expect(
      client.request("/booking")
    ).rejects.toBeInstanceOf(ApiClientError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sleepMock).not.toHaveBeenCalled();
  });


  it("stops retrying after the maximum attempts", async () => {

    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValue(
        new Response("Server Error", { status: 500 })
      );

    const sleepMock = vi.fn(
      async (_ms: number) => {}
    );

    const client = new ApiClient({
      baseUrl: "https://example.com",
      maxRetries: 2,
      baseDelayMs: 300,
      fetchImpl: fetchMock,
      sleep: sleepMock
    });

    await expect(
      client.request("/booking")
    ).rejects.toThrow("HTTP request failed with status 500");

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(sleepMock).toHaveBeenNthCalledWith(1, 300);
    expect(sleepMock).toHaveBeenNthCalledWith(2, 600);
  });

});