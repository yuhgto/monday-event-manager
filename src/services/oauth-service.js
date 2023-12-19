/* eslint-disable no-unused-vars */

import { Logger, SecureStorage } from "@mondaycom/apps-sdk";
import jwt from "jsonwebtoken";
const logTag = "OAuthService";
const logger = new Logger(logTag);

const AUTHORIZATION_URL = "https://auth.monday.com/oauth2/authorize";
const MONDAY_TOKEN_URL = "https://auth.monday.com/oauth2/token";

export const redirectToOAuthPage = async (req, res) => {
  try {
    const CLIENT_ID = process.env.MONDAY_CLIENT_ID;
    const CLIENT_SECRET = process.env.MONDAY_CLIENT_SECRET;
    const SIGNING_SECRET = process.env.MONDAY_SIGNING_SECRET;

    const authHeader = req.query.authorization;
    const authHeaderPayload = jwt.decode(authHeader);
    const { accountId, userId, boardId, backToUrl } = authHeaderPayload;
    logger.info({ msg: "auth header", authHeaderPayload });

    // generate state as JWT
    const statePayload = {
      accountId,
      userId,
      boardId,
      backToUrl,
    };
    const state = jwt.sign(statePayload, SIGNING_SECRET);

    // redirect to oauth URL with client ID
    res.redirect(
      AUTHORIZATION_URL +
        `?client_id=${CLIENT_ID}&state=${state}&redirect_uri=${
          process.env.MNDY_SERVER_ADDRESS + "/oauth2/redirect"
        }`
    );
  } catch (err) {
    logger.error(err);
    res.status(500).send();
  }
};

export const sendCodeToAppBackend = async (req, res) => {
  try {
    // get code from query params
    const { code, state } = req.query;
    const statePayload = jwt.decode(state);
    const { backToUrl } = statePayload;
    const SERVER_URL = process.env.MNDY_SERVER_ADDRESS;

    logger.info({ message: "token endpoint hit", code: code });

    // send code to internal /token endpoint
    const tokenResponse = await fetch(`${SERVER_URL}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        state,
      }),
    });

    const tokenResponseJson = await tokenResponse.json();

    logger.info({
      message: `got token response from internal endpoint`,
      res: JSON.stringify(tokenResponseJson),
      backToUrl
    });

    if (tokenResponse.ok) {
      res.redirect(backToUrl);
    }
  } catch (err) {
    logger.error(err);
    res.status(500).send();
  }
};

export const sendTokenRequest = async (req, res) => {
  try {
    const secureStorage = new SecureStorage();
    // get auth code from body
    const { code, state } = req.body;
    const CLIENT_ID = process.env.MONDAY_CLIENT_ID;
    const CLIENT_SECRET = process.env.MONDAY_CLIENT_SECRET;
    const REDIRECT_URI = process.env.MNDY_SERVER_ADDRESS + "/oauth2/redirect";

    // make a POST to the token endpoint
    const urlParams = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    });
    const tokenUrlWithParams = MONDAY_TOKEN_URL + "?" + urlParams.toString();

    const tokenResponse = await fetch(tokenUrlWithParams, {
      method: "POST",
    });
    const resJson = await tokenResponse.json();

    logger.info({
      message: "tried to fetch token from monday",
      url: tokenUrlWithParams,
      ok: tokenResponse.ok,
      json: resJson,
    });

    if (!tokenResponse.ok) {
      throw new Error();
    }

    // store token
    const statePayload = jwt.decode(state);
    const { accountId, userId } = statePayload;
    const storageKey = `account:${accountId}:user:${userId}`;
    const result = await secureStorage.set(storageKey, resJson);
    logger.info({
      msg: "stored key in db",
      data: { storageKey, value: resJson, result },
    });
    if (result) {
      // send success back
      res.status(200).send({ message: "Access token received and stored" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send();
  }
};
