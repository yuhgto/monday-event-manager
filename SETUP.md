# How to build this app from scratch

# Set up the template

## Create an app

Create an app in monday

## Clone this repo

Clone the repo from Github. Use the development branch if you're following along with the training. 

Add secrets to your .env file

Run `npm run dev`

## Add the quickstart workflow feature

Create a new workflow/integration template using the quickstart guide

Rename feature "Transform text with monday code"

Go to the `Hosting` section of your app and connect it to the `/transformText` route

## Add it to a board and test it

Open a board

Add two text columns (if they aren't there already)

Open the integrations center and add your feature.

## Deploy the thing

Install and init the monday CLI if not done already. 

Add your app's version ID to the `package.json` file

Deploy the app to monday code – `npm run deploy`

> If doing this manually, you need to run `mapps code:push -i <app_version_id>`

## Add environment variables to your deployment

Copy your app ID from the basic info section

Open the .env file (with your variables already populated)

For each variable, use `mapps code:env` to add it to your deployment

```
mapps code:env -m set -k <KEY> -v <VALUE>
```

# Add the date scheduler integration feature

## Start your local dev server again

Run `npm run dev`

Add your local tunnel URL to the **Hosting** section

## Add a start from scratch workflow feature

Add a new feature to the app you started in part 1

## Add the scheduler custom field & action block

Custom field - Check out the "remote_options" route in the `src/routes/scheduleDate/index.js` file to see what name to make each field

Action block - Check out "execute_action" route in the `src/routes/scheduleDate/index.js` file to see which input and output fields you need

## Test the app on a board

Make sure the board has 2 date columns on it

## Deploy the app

`npm run deploy`

# Use a queue to handle sudden increases in load

## Open the /scheduleDateWithQueue routes

These routes are the same as the original date_scheduler routes. 

## Edit 'execute_action' route

Build logic to add message to queue on action run.

The message will hit the `/mndy-queue` route.

Build out the `/mndy-queue` route: validate message secret then run the action. 

Since you cannot guarantee the shortLivedToken is valid, replace it with a personal token (for now). 

# Implement OAuth and store API tokens in the secure storage

## Open OAuth routes

## Follow OAuth process through network requests

## Pass user ID and account ID through state param

## Verify state is signed correctly

## Store token using unique key