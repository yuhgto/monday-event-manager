import express from "express";
import { Logger } from "@mondaycom/apps-sdk";
import dotenv from "dotenv";
dotenv.config();

import transformTextFeature from "./src/actions/transformText/index.js";
import dateSchedulerFeature from "./src/actions/scheduleDate/index.js";
import getAddressFeature from "./src/actions/getAddress/index.js";
import { getSecret, isDevelopmentEnv, getEnv } from "./src/helpers.js";
import { readQueueMessage, produceMessage } from "./src/services/queue-service.js";

const logTag = "ExpressServer";
const PORT = "PORT";
const SERVICE_TAG_URL = "SERVICE_TAG_URL";

const logger = new Logger(logTag);
const currentPort = getSecret(PORT); // Port must be 8080 to work with monday code
const currentUrl = getSecret(SERVICE_TAG_URL);

const app = express();
app.use(express.json());
app.use('/transform_text', transformTextFeature);
app.use('/date_scheduler', dateSchedulerFeature);
app.use('/get_address', getAddressFeature);

app.get("/", (req, res) => {
  res.status(200).send({ message: "healthy" });
});


app.post(
    "/produce",
    async (req, res) => {
        try {
            const { body } = req;
            const message = JSON.stringify(body);
            const messageId = await produceMessage(message);
            return res.status(200).send({ messageId });
        } catch (err) {
            logger.error(JSON.stringify(err));
            return res.status(500).send({ message: "internal server error" });
        }
    }
);

app.post(
    "/mndy-queue",
    async (req, res) => {
        try {
            const { body, query } = req;
            readQueueMessage({ body, query });
            return res.status(200).send({}); // return 200 to ACK the queue message
        } catch (err) {
            logger.error(err.error);
            return res.status(500).send({ message: "internal server error" });
        }
    }
);

app.listen(currentPort, () => {
  if (isDevelopmentEnv()) {
    logger.info(`app running locally on port ${currentPort}`);
  } else {
    logger.info(
      `up and running listening on port:${currentPort}`,
      "server_runner",
      {
        env: getEnv(),
        port: currentPort,
        url: `https://${currentUrl}`,
      }
    );
  }
});
