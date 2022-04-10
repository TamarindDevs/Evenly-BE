import express, { json } from "express";
import { cpus } from "os";
import cluster from "cluster";
import cors from "cors";
import { serve, setup } from "swagger-ui-express";
import yaml from "js-yaml";
import fs from "fs";
import helmet from "helmet";
import "express-async-errors";
import "dotenv/config";
// user defined
import config from "@config/config";
import globalExceptionLayer from "@error/errorHandler";
import path from "path";

require("tsconfig-paths/register");

// Get document, or throw exception on error
let swaggerDocument: any;
try {
  swaggerDocument = yaml.load(
    fs.readFileSync(path.resolve(__dirname, "docs/swagger.yml"), "utf8"),
  );
} catch (e) {
  console.error(e);
}

const numCPUs = cpus().length;

if (cluster.isPrimary) {
  console.info(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.info(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  console.info(`Worker ${process.pid} started`);

  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(json());
  app.use("/api/v1/docs", serve, setup(swaggerDocument));

  app.use(globalExceptionLayer);
  app.listen(config.port, () => {
    console.info(`Worker ${process.pid} started on port ${config.port}`);
  });
}
