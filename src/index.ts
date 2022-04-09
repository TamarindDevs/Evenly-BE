import express from "express";
import { cpus } from "os";
import cluster from "cluster";
import cors from "cors";
import "express-async-errors";

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
  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("Hello world");
  });

  app.listen(3000, () => {
    console.info(`Worker ${process.pid} started`);
  });
}
