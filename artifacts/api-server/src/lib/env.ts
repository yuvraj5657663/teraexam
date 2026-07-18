/**
 * Centralised environment variable validation.
 * Call `validateEnv()` once at startup — throws if any required variable is missing.
 */

export interface AppEnv {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  SESSION_SECRET: string;
  ALLOWED_ORIGINS: string[];
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  LOG_LEVEL: string;
}

function requireString(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function optionalString(name: string): string | undefined {
  const value = process.env[name];
  return value?.trim() || undefined;
}

function requirePort(): number {
  const raw = process.env["PORT"];
  if (!raw) {
    throw new Error("Missing required environment variable: PORT");
  }
  const port = Number(raw);
  if (Number.isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT value: "${raw}". Must be a number between 1 and 65535.`);
  }
  return port;
}

function parseAllowedOrigins(): string[] {
  const raw = process.env["ALLOWED_ORIGINS"];
  if (!raw || raw.trim() === "") {
    // Default to same-origin only in production, allow all in dev
    return process.env["NODE_ENV"] === "production" ? [] : ["*"];
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function validateEnv(): AppEnv {
  const port = requirePort();
  const dbUrl = requireString("DATABASE_URL");
  const jwtSecret = requireString("JWT_SECRET");
  const sessionSecret = requireString("SESSION_SECRET");

  // Warn about weak secrets in production
  const nodeEnv = process.env["NODE_ENV"] ?? "development";
  if (nodeEnv === "production") {
    if (jwtSecret.length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters in production.");
    }
    if (sessionSecret.length < 32) {
      throw new Error("SESSION_SECRET must be at least 32 characters in production.");
    }
  }

  return {
    PORT: port,
    NODE_ENV: nodeEnv,
    DATABASE_URL: dbUrl,
    JWT_SECRET: jwtSecret,
    SESSION_SECRET: sessionSecret,
    ALLOWED_ORIGINS: parseAllowedOrigins(),
    CLOUDINARY_CLOUD_NAME: optionalString("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: optionalString("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: optionalString("CLOUDINARY_API_SECRET"),
    LOG_LEVEL: optionalString("LOG_LEVEL") ?? "info",
  };
}
