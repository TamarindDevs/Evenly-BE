/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/order */
/* eslint-disable import/first */
require("tsconfig-paths/register");

import express, { json } from "express";
import cors from "cors";
import { serve, setup } from "swagger-ui-express";
import yaml from "js-yaml";
import helmet from "helmet";
import { cpus } from "os";
import cluster from "cluster";
import fs from "fs";
import path from "path";
import "express-async-errors";
import "dotenv/config";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
// user defined
import config from "@config/config";
import globalExceptionLayer from "@error/errorHandler";
import connect from "@db/db";
import logger from "@helpers/logger";
import morganMiddleware from "@middlewares/morgan.middleware";

const app = express();
// connect db
connect();
// sentry init
Sentry.init({
  dsn: config.sentry_dsn,
  attachStacktrace: true,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({
      // to trace all requests to the default router
      app,
    }),
  ],
  tracesSampleRate: 1.0,
});

// Get document, or throw exception on error
let swaggerDocument: any;
try {
  swaggerDocument = yaml.load(
    fs.readFileSync(path.resolve(__dirname, "docs/swagger.yml"), "utf8"),
  );
} catch (e) {
  logger.error(e);
}

const numCPUs = cpus().length;

if (cluster.isPrimary) {
  logger.info(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    logger.info(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  logger.info(`Worker ${process.pid} started`);

  // The sentry request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
  app.use(helmet());
  app.use(cors());
  app.use(json());
  app.use(morganMiddleware);
  app.use("/api/v1/docs", serve, setup(swaggerDocument));

  // The sentry error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);
  app.use(globalExceptionLayer);
  app.listen(config.port, () => {
    logger.info(`Worker ${process.pid} started on port ${config.port}`);
  });
}
