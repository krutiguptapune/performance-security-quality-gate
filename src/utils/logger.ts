export type LogEntry = {
  level: "info" | "warn" | "error";
  message: string;
  method: string;
  url: string;
  status?: number;
  durationMs?: number;
  correlationId: string;
  attempt: number;
};

export function logRequest(entry: LogEntry): void {
  const logData = {
    timestamp: new Date().toISOString(),
    ...entry
  };

  console.log(JSON.stringify(logData));
}