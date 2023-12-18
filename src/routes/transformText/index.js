import express from "express";
import { Logger } from "@mondaycom/apps-sdk";

import { authorizeRequest } from "../../middleware.js";
import {
  changeColumnValue,
  getColumnValue,
} from "../../services/monday-api-service.js";
import { transformText } from "../../services/transformation-service.js";

const router = express.Router();
const logTag = "TransformTextFeature";
const logger = new Logger(logTag);

const TO_UPPER_CASE = "TO_UPPER_CASE";
const TO_LOWER_CASE = "TO_LOWER_CASE";

router.post("/monday/execute_action", authorizeRequest, async (req, res) => {
  logger.info(
    JSON.stringify({
      message: "New request received",
      path: "/transformText/monday/execute_action",
      body: req.body,
      headers: req.headers,
    })
  );
  const { shortLivedToken } = req.session;
  const { payload } = req.body;

  try {
    const { inputFields } = payload;
    const {
      boardId,
      itemId,
      sourceColumnId,
      targetColumnId,
      transformationType,
    } = inputFields;

    const text = await getColumnValue(shortLivedToken, itemId, sourceColumnId);
    if (!text) {
      return res.status(200).send({});
    }
    const transformedText = transformText(
      text,
      transformationType ? transformationType.value : "TO_UPPER_CASE"
    );

    await changeColumnValue(
      shortLivedToken,
      boardId,
      itemId,
      targetColumnId,
      transformedText
    );

    return res.status(200).send({});
  } catch (err) {
    logger.error(err);
    return res.status(500).send({ message: "internal server error" });
  }
});

router.post("/monday/get_remote_list_options", authorizeRequest, async (req, res) => {
  const TRANSFORMATION_TYPES = [
    { title: "to upper case", value: TO_UPPER_CASE },
    { title: "to lower case", value: TO_LOWER_CASE },
  ];
  try {
    return res.status(200).send(TRANSFORMATION_TYPES);
  } catch (err) {
    logger.error(err);
    return res.status(500).send({ message: "internal server error" });
  }
});
export default router;
