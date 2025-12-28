import type { Middleware } from "@remix-run/fetch-router";

export interface LoggerOptions {
  /**
   * The format to use for log messages. Defaults to `[%date] %method %path %status %contentLength`.
   *
   * Available tokens:
   * - %date: Apache/nginx log format date
   * - %dateISO: ISO format date
   * - %method: Request method
   * - %path: Request path
   * - %status: Response status code
   * - %contentLength: Response Content-Length
   * - %duration: Request duration in ms
   */
  format?: string;
  /**
   * The function to use to log messages. Defaults to `console.log`.
   */
  log?: (message: string) => void;
  /**
   * Whether to log the request body. Defaults to false.
   */
  logBody?: boolean;
}

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatApacheDate(date: Date): string {
  let day = String(date.getDate()).padStart(2, "0");
  let month = months[date.getMonth()];
  let year = date.getFullYear();
  let hours = String(date.getHours()).padStart(2, "0");
  let minutes = String(date.getMinutes()).padStart(2, "0");
  let seconds = String(date.getSeconds()).padStart(2, "0");

  let timezoneOffset = date.getTimezoneOffset();
  let sign = timezoneOffset <= 0 ? "+" : "-";
  let offsetHours = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(
    2,
    "0"
  );
  let offsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(2, "0");
  let timezone = `${sign}${offsetHours}${offsetMinutes}`;

  return `${day}/${month}/${year}:${hours}:${minutes}:${seconds} ${timezone}`;
}

export function logger(options: LoggerOptions = {}): Middleware {
  const {
    format = "[%date] %method %path %status %contentLength %durationms",
    log = console.log,
    logBody = false,
  } = options;

  return async ({ request, url }, next) => {
    let start = new Date();
    let body: string | null = null;

    if (logBody && request.method !== "GET" && request.method !== "HEAD") {
      try {
        const clone = request.clone();
        body = await clone.text();
      } catch (e) {
        // Ignore body read errors
      }
    }

    let response = await next();
    let end = new Date();

    let tokens: Record<string, () => string> = {
      date: () => formatApacheDate(start),
      dateISO: () => start.toISOString(),
      method: () => request.method,
      path: () => url.pathname + url.search,
      status: () => String(response.status),
      contentLength: () => response.headers.get("Content-Length") ?? "-",
      duration: () => String(end.getTime() - start.getTime()),
    };

    let message = format.replace(/%(\w+)/g, (_, key) => tokens[key]?.() ?? "-");

    if (body) {
      message += `\nBody: ${body}`;
    }

    log(message);

    return response;
  };
}
