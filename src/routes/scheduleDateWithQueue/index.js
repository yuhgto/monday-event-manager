/* eslint-disable no-unused-vars */

// add scheduling code here
// when DATE changes, ADD X days and update DEPENDENT DATE
// inputs: original date, add/subtract, number of days, output column
// components: custom field for add/subtract, action to execute

import express from "express";
import { Logger, Queue } from "@mondaycom/apps-sdk";
import { authorizeRequest, logRequest } from "../../middleware.js";
const router = express.Router();

const logTag = "DateSchedulerWithQueueFeature"
const logger = new Logger(logTag);
const queue = new Queue();

// delete this when doing boilerplate
router.get("/oauth", (req, res) => {
    res.redirect("/oauth2/start");
})

router.post("/execute_action", authorizeRequest, logRequest, async (req, res) => {
    try {
        const { shortLivedToken } = req.session;
        const { itemId, boardId, inputColumn, outputColumn, numberOfDays, scheduler_type } = req.body.payload.inputFields;
        const { integrationId, recipeId } = req.body.payload;
        // Send job to queue
        const messageForQueue = JSON.stringify({
            job: 'schedule_date',
            inputs: {itemId, boardId, inputColumn, outputColumn, numberOfDays, scheduler_type},
            integrationId: integrationId
        })
        logger.info(messageForQueue);
        const messageId = queue.publishMessage(messageForQueue);
        res.status(201).send(messageId);
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