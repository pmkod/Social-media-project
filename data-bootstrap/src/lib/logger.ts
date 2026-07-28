type LogLevel = "info" | "success" | "warn" | "error";

const styles: Record<LogLevel, string> = {
  info: "\x1b[34m", // blue
  success: "\x1b[32m", // green
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
};

const reset = "\x1b[0m";

const log = (level: LogLevel, message: string) => {
  const timestamp = new Date().toISOString();
  console.log(`${styles[level]}[${level.toUpperCase()}]${reset} ${timestamp} - ${message}`);
};

const logger = {
  info: (message: string) => log("info", message),
  success: (message: string) => log("success", message),
  warn: (message: string) => log("warn", message),
  error: (message: string) => log("error", message),
};

export { logger };
