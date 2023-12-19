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
    if (!queue.validateMessageSecret(query.secret))  {
        logger.info("Queue message received is not valid, since secret is not matched, this message could come from an attacker.");
        throw new Error('not allowed');
    }
    logger.info("Queue message received successfully.");
    // process the queue message payload...
    if (body.job === "schedule_date") {
        const {itemId, boardId, inputColumn, outputColumn, numberOfDays, scheduler_type} = body.inputs;
        const inputDateString = await getColumnValue(mondayToken, itemId, inputColumn); // this is a JSON string
        const inputDate = JSON.parse(inputDateString)
        logger.info(`Input date is - ${JSON.stringify(inputDate)}`);
        let outputDate;
        if (scheduler_type.value === 'add') {
            outputDate = new Date(inputDate.date);
            outputDate.setDate(outputDate.getDate() + numberOfDays);
        } else {
            outputDate = new Date(inputDate.date);
            outputDate.setDate(outputDate.getDate() - numberOfDays);
        }
        const outputDateForApi = JSON.stringify({date: outputDate.toISOString().substring(0,10)})
        const result = await changeColumnValue(mondayToken, boardId, itemId, outputColumn, outputDateForApi);
        logger.info(`Output date is ${outputDate.toISOString().substring(0,10)} & result is ${JSON.stringify(result)}`);
    }
};
