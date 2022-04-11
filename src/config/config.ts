import "dotenv/config";

export default {
  port: process.env.PORT || 5000,
  url: (process.env.ATLAS_URL as string) || "",
  sentry_dsn: (process.env.SENTRY_DSN as string) || "",
};
