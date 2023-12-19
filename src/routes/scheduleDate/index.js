/* eslint-disable no-unused-vars */

// add scheduling code here
// when DATE changes, ADD X days and update DEPENDENT DATE
// inputs: original date, add/subtract, number of days, output column
// components: custom field for add/subtract, action to execute

import express from "express";
import { Logger } from "@mondaycom/apps-sdk";
import { authorizeRequest, logRequest } from "../../middleware.js";
import { getColumnValue, changeColumnValue } from "../../services/monday-api-service.js";
const router = express.Router();

const logTag = "DateSchedulerFeature"
const logger = new Logger(logTag);

router.post("/execute_action", authorizeRequest, logRequest, async (req, res) => {
    try {
        const { shortLivedToken } = req.session;
        const { itemId, boardId, inputColumn, outputColumn, numberOfDays, scheduler_type } = req.body.payload.inputFields;
        // do something
        const inputDateString = await getColumnValue(shortLivedToken, itemId, inputColumn); // this is a JSON string
        const inputDate = JSON.parse(inputDateString)
        logger.info(`Input date is - ${inputDate}`);
        let outputDate;
        if (scheduler_type.value === 'add') {
            outputDate = new Date(inputDate.date);
            outputDate.setDate(outputDate.getDate() + numberOfDays);
        } else {
            outputDate = new Date(inputDate.date);
            outputDate.setDate(outputDate.getDate() - numberOfDays);
        }
        const outputDateForApi = JSON.stringify({date: outputDate.toISOString().substring(0,10)})
        const result = await changeColumnValue(shortLivedToken, boardId, itemId, outputColumn, outputDateForApi);
        logger.info(`Output date is ${outputDate.toISOString().substring(0,10)} & result is ${JSON.stringify(result)}`);
        res.status(200).send();
    } catch (error) {
        logger.error(error);
        res.status(500).send({message: "Internal server error"})
    }
})

router.post("/get_scheduler_types", authorizeRequest, logRequest, (req, res) => {
    const SCHEDULER_TYPES = [ 
        {title: "Add", value: "add"},
        {title: "Subtract", value: "subtract"}
    ]
    try {
        return res.status(200).send(SCHEDULER_TYPES);
    } catch(err) {
        logger.error(err);
        return res.status(500).send({'message': 'Internal server error'});
    }
})

export default router;