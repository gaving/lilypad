// Simple logger utility with log levels
type LogLevel = "error" | "warn" | "info" | "debug";

const LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === "production" ? "warn" : "info");

const levels: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = levels[LOG_LEVEL] ?? levels.info;

interface Logger {
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

const logger: Logger = {
  error: (...args: unknown[]) => {
    if (currentLevel >= levels.error) {
      console.error("[ERROR]", ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (currentLevel >= levels.warn) {
      console.warn("[WARN]", ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (currentLevel >= levels.info) {
      console.log("[INFO]", ...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (currentLevel >= levels.debug) {
      console.log("[DEBUG]", ...args);
    }
  },
};

export default logger;
