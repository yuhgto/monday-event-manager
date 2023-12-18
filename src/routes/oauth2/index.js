/* eslint-disable no-unused-vars */

import express from "express";
import { Logger } from "@mondaycom/apps-sdk";
import { authorizeRequest, logRequest } from "../../middleware.js";
import { getColumnValue, changeColumnValue } from "../../services/monday-api-service.js";
import { redirectToOAuthPage, exchangeCodeForToken, sendTokenRequest } from "../../services/oauth-service.js";
const router = express.Router();

const logTag = "OAuthController"
const logger = new Logger(logTag);

router.get('/start', logRequest, redirectToOAuthPage)

router.get('/redirect', logRequest, exchangeCodeForToken);

router.post('/token', logRequest, sendTokenRequest)

export default router;