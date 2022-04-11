import config from "@config/config";
import Logger from "@helpers/logger";
import mongoose from "mongoose";

export default function connect() {
  mongoose
    .connect(config.url, { keepAlive: true, keepAliveInitialDelay: 300000 })
    .catch((err) => Logger.error(err));

  mongoose.connection.once("open", () => {
    Logger.info("MongoDB database connection established successfully");
  });
}
