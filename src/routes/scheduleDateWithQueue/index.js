/* eslint-disable no-unused-vars */

// add scheduling code here
// when DATE changes, ADD X days and update DEPENDENT DATE
// inputs: original date, add/subtract, number of days, output column
// components: custom field for add/subtract, action to execute

import express from "express";
import { Logger, Queue, SecureStorage } from "@mondaycom/apps-sdk";
import { authorizeRequest, logRequest } from "../../middleware.js";
import jwt from "jsonwebtoken";
const router = express.Router();

const logTag = "DateSchedulerWithQueueFeature";
const logger = new Logger(logTag);
const queue = new Queue();
const secureStorage = new SecureStorage();

router.get("/oauth2", async (req, res) => {
  const query = req.query;
  const tokenPayload = jwt.decode(req.query.token);
  const { accountId, userId, backToUrl } = tokenPayload;

  // check if you have a token already
  const storageResponse = await secureStorage.get(
    `account:${accountId}:user:${userId}`
  );
  if (storageResponse === null) {
    logger.info({
      msg: "Could not find access token. Beginning auth flow.",
      query,
    });
    const params = new URLSearchParams({ authorization: req.query.token });
    res.redirect("/oauth2/start?" + params.toString());
  } else {
    logger.info({ msg: "API token found", storageResponse });
    res.redirect(backToUrl);
  }
});

router.post(
  "/execute_action",
  authorizeRequest,
  logRequest,
  async (req, res) => {
    try {
      const { shortLivedToken } = req.session;
      const {
        itemId,
        boardId,
        inputColumn,
        outputColumn,
        numberOfDays,
        scheduler_type,
      } = req.body.payload.inputFields;
      const { integrationId, recipeId } = req.body.payload;
      // Send job to queue
      const messageForQueue = JSON.stringify({
        job: "schedule_date",
        inputs: {
          itemId,
          boardId,
          inputColumn,
          outputColumn,
          numberOfDays,
          scheduler_type,
        },
        integrationId: integrationId,
      });
      logger.info(messageForQueue);
      const messageId = queue.publishMessage(messageForQueue);
      res.status(201).send(messageId);
    } catch (error) {
      logger.error(error);
      res.status(500).send({ message: "Internal server error" });
    }
  }
);

router.post(
  "/get_scheduler_types",
  authorizeRequest,
  logRequest,
  (req, res) => {
    const SCHEDULER_TYPES = [
      { title: "Add", value: "add" },
      { title: "Subtract", value: "subtract" },
    ];
    try {
      return res.status(200).send(SCHEDULER_TYPES);
    } catch (err) {
      logger.error(err);
      return res.status(500).send({ message: "Internal server error" });
    }
  }
);

export default router;
