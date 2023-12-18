/* eslint-disable no-unused-vars */

// add geocoding code here
// when LOCATION changes, update COLUMN with mailing address
// inputs: output column, item ID, board ID
// components: action to execute, google auth token

import express from "express";
import { Logger } from "@mondaycom/apps-sdk";
import { authorizeRequest, logRequest } from "../../middleware.js";
import { getColumnValue, changeColumnValue } from "../../services/monday-api-service.js";
const router = express.Router();

const logTag = "AddressGeocoder"
const logger = new Logger(logTag);

router.post("/execute_action", authorizeRequest, logRequest, async (req, res) => {
    try {
        const { shortLivedToken } = req.session;
        const { inputColumnId, itemId, boardId, outputColumnId } = req.body.payload.inputFields;
        // get lat/long from monday api
        const locationColumnResponse = await getColumnValue(shortLivedToken, itemId, inputColumnId);
        const locationColumnResponseJSON = JSON.parse(locationColumnResponse)
        if (!locationColumnResponseJSON) {
            return res.status(200).send();
        }
        const latLongString = locationColumnResponseJSON.lat.concat(',', locationColumnResponseJSON.lng);
        // translate lat/long to address
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latLongString}&key=${process.env.GOOGLE_API_KEY}`
        const geocodingResponse = await fetch(geocodeUrl);
        const responseJson = await geocodingResponse.json();
        logger.info({message: 'calling Google Maps URL', geocodeUrl, response: responseJson});

        // send lat/long to monday column
        const outputAddressForApi = JSON.stringify(responseJson.results[0].formatted_address);
        const result = await changeColumnValue(shortLivedToken, boardId, itemId, outputColumnId, outputAddressForApi);
        logger.info(JSON.stringify(result));

        return res.status(200).send(result);
    } catch (error) {
        logger.error(error);
        res.status(500).send({message: "Internal server error"})
    }
})


export default router;