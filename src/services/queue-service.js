/* eslint-disable no-unused-vars */
import { Logger, Queue } from "@mondaycom/apps-sdk";
import { getColumnValue, changeColumnValue } from "./monday-api-service.js";

const queue = new Queue();
const logTag = "QueueService";
const logger = new Logger(logTag);

export const produceMessage = async (message) => {
    logger.info(`produce message received ${message}`);
    const messageId = await queue.publishMessage(message);
    logger.info(`Message ${messageId} published.`);
    return messageId;
}

export const readQueueMessage = async ({ body, query }) => {
    const mondayToken = process.env.MONDAY_API_KEY;
    logger.info({message: 'queue message recieved', data: {body, query}})
    const messageSecret = query.secret;
    const { job } = body;

    // TODO: read queue message and do relevant job
};
