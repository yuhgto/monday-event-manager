/* eslint-disable no-unused-vars */

import { Logger } from "@mondaycom/apps-sdk";
const logTag = "OAuthService"
const logger = new Logger(logTag);

const AUTHORIZATION_URL = "https://auth.monday.com/oauth2/authorize";
const TOKEN_URL = "https://auth.monday.com/oauth2/token";

export const redirectToOAuthPage = async (req, res) => {
  // generate state string
  const state = "12345";
  const CLIENT_ID = process.env.MONDAY_CLIENT_ID;
  const CLIENT_SECRET = process.env.MONDAY_CLIENT_SECRET;

  // redirect to oauth URL with client ID
  res.redirect(AUTHORIZATION_URL + `?client_id=${CLIENT_ID}&state=${state}`);
};

export const sendTokenRequest = async (req, res) => {
  // get auth code from body
  const { code } = req.body;
  const CLIENT_ID = process.env.MONDAY_CLIENT_ID;
  const CLIENT_SECRET = process.env.MONDAY_CLIENT_SECRET;
  const REDIRECT_URI = process.env.MNDY_SERVER_ADDRESS + '/oauth2/redirect'

  // make a POST to the token endpoint
  const tokenUrlWithParams = TOKEN_URL + `?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${REDIRECT_URI}&code=${code}`
  const tokenResponse = await fetch(tokenUrlWithParams, {
    method: 'POST'
  })

  // store token
  logger.info({message: 'fetching token from monday', url: tokenUrlWithParams, response: tokenResponse});
  res.status(200).send(tokenResponse);
};

export const exchangeCodeForToken = async (req, res) => {
    // get code from query params
    const { code } = req.query;
    const SERVER_URL = process.env.MNDY_SERVER_ADDRESS;

    logger.info({message: 'token endpoint hit', code: code});

    // send code to /token endpoint
    const tokenResponse = await fetch(`${SERVER_URL}/oauth2/token`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code
        })
    })
    
    res.status(200).send();
}
