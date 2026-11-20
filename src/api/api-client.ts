import { randomUUID } from "node:crypto";
import { logRequest, type LogEntry } from "../utils/logger.js";

type ApiClientOptions = {
  baseUrl: string;
  maxRetries?: number;
  baseDelayMs?: number;
  fetchImpl?: typeof fetch;
  logger?: (entry: LogEntry) => void;
  sleep?: (ms: number) => Promise<void>;
  createCorrelationId?: () => string;
};

export type ApiResponse<T> = {
  data: T;
  status: number;
  correlationId: string;
};

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public responseBody: string
  ) {
    super(`HTTP request failed with status ${status}`);
    this.name = "ApiClientError";
  }
}

export class ApiClient {
  private baseUrl: string;
  private maxRetries: number;
  private baseDelayMs: number;
  private fetchImpl: typeof fetch;
  private logger: (entry: LogEntry) => void;
  private sleep: (ms: number) => Promise<void>;
  private createCorrelationId: () => string;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.endsWith("/")
      ? options.baseUrl
      : `${options.baseUrl}/`;

    this.maxRetries = options.maxRetries ?? 2;
    this.baseDelayMs = options.baseDelayMs ?? 300;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.logger = options.logger ?? logRequest;

    this.sleep = options.sleep ?? (
      (ms) => new Promise(resolve => setTimeout(resolve, ms))
    );

    this.createCorrelationId =
      options.createCorrelationId ?? randomUUID;
  }

  async request<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<ApiResponse<T>> {

    const method = (init.method ?? "GET").toUpperCase();

    const url = new URL(
      path.replace(/^\/+/, ""),
      this.baseUrl
    ).toString();

    const correlationId = this.createCorrelationId();

    const headers = new Headers(init.headers);
    headers.set("X-Correlation-ID", correlationId);

    for (
      let attempt = 0;
      attempt <= this.maxRetries;
      attempt++
    ) {

      const startTime = Date.now();

      const response = await this.fetchImpl(url, {
        ...init,
        method,
        headers
      });

      const durationMs = Date.now() - startTime;

      const logData = {
        method,
        url,
        status: response.status,
        durationMs,
        correlationId,
        attempt: attempt + 1
      };

      if (
        response.status >= 500 &&
        response.status < 600 &&
        attempt < this.maxRetries
      ) {
        this.logger({
          ...logData,
          level: "warn",
          message: "Server error. Retrying request."
        });

        await this.sleep(
          this.baseDelayMs * 2 ** attempt
        );

        continue;
      }

      this.logger({
        ...logData,
        level: response.ok ? "info" : "error",
        message: "HTTP request completed"
      });

      const responseBody = await response.text();

      if (!response.ok) {
        throw new ApiClientError(
          response.status,
          responseBody
        );
      }

      let data: T;

      try {
        data = responseBody
          ? JSON.parse(responseBody) as T
          : null as T;
      } catch {
        data = responseBody as T;
      }

      return {
        data,
        status: response.status,
        correlationId
      };
    }

    throw new Error("Request failed without a response.");
  }
}