# RingCentral Voicemail AI Bot

This project contains the code and resources needed for developers to build and deploy a voicemail 
assistant bot on top of the RingCentral Glip messaging platform. The bot contained within this 
framework can, with a user's permission, monitor a user's voicemail for incoming messages, and 
then alert the user via a Glip message of a new voicemail. In addition, it can interface with 
Google's speech-to-text APIs to transcribe the incoming message and post that to the user as well. 

The bot contained within is meant to be used in conjunction with a 
[detailed tutorial](https://ringcentral-tutorials.github.io/ringcentral-ai-bot/) on building bots 
on Glip. As a result, the bot intentionally lacks some functionality that ideally developers 
would implement by completing the corresponding tutorial.

## Features

### Bot

The bot provided by this project is capable of responding to the following command:

* `monitor` - enable monitoring of the current user's voicemail messages.

When a voicemail is received, the bot will post a transcript of the voicemail to the user, along with some high-level analysis of the contents of the voicemail. 

### Future Framework

This bot is includes core bot features that are intended to be extracted to a Glip bot framework that seeks to eliminate the need to develop a lot of the mundane functions necessary to support a bot that is easily deployed, and authorized to access a user's account. Here are some of the functions this framework will provide to developers:

* Implements an OAuth flow for adding bots to a Glip organization.
* Implements an OAuth flow for prompting users to grant the bot permission to access their RingCentral account data.
* Automatically refreshes event subscriptions before they expire. 
* Provides a simple framework for developers to implement new commands and functionality. 
* Persists and manages authentication tokens for users of the bot. 

## Setup and Installation

A detailed guide for getting the bot up and running is provided in the [bot's tutorial](https://ringcentral-tutorials.github.io/ringcentral-ai-bot/). For those developers more familiar with RingCentral wishing to dive right in, the following instructions will help:

**Prerequisites**

- Node.js >= 8.10
- Yarn
- ngrok, or another publically addressable endpoint on the web to receive webhooks
- a Google API account with a [saved Google credentials file](https://cloud.google.com/docs/authentication/getting-started)

### Setup the Project

```
git clone git@github.com:ringcentral-tutorials/ringcentral-ai-bot.git
cd ringcentral-ai-bot
yarn install
```

### Create Your Proxy

If you are developing on your local machine, you may need to create a proxy/tunnel to the outside world so that your bot can receive webhooks properly. You can do this easily by executing the following command in a separate terminal:

```
cd ringcentral-ai-bot
yarn proxy
```

*Make note of the ngrok HTTPS URL for use later.*

### Create the Apps

Login to [developer.ringcentral.com](https://developer.ringcentral.com) and create two different apps using the parameters below.

#### Server/Bot App

* General Settings
  * Choose a name and description you prefer.
* App Type and Platform
  * **Application Type**: Public
  * **Platform Type**: `Server/Bot`
  * **Carrier**: *accept the default values*
* OAuth Settings
  * **Permissions Needed**: All of them (ReadContacts, ReadMessages, ReadPresence, Contacts, ReadAccounts, SMS, InternalMessages, ReadCallLog, ReadCallRecording, WebhookSubscrip\
tions, Glip)
  * **OAuth Redirect URI**: Using your ngrok HTTPS URL from above, enter in the following value:
          `https://1234abcd.ngrok.io/oauth-bot`

#### Web-based App

* General Settings
  * Choose a name and description you prefer. 
* App Type and Platform
  * **Application Type**: Public
  * **Platform Type:** `Browser-based`
  * **Carrier**: *accept the default values*
* OAuth Settings
  * **Permissions Needed**: All of them (ReadContacts, ReadMessages, ReadPresence, Contacts, ReadAccounts, SMS, InternalMessages, ReadCallLog, ReadCallRecording, WebhookSubscriptions, Glip)
  * **OAuth Redirect URI**: Using your ngrok HTTPS URL from above, enter in the following value:
    `https://1234abcd.ngrok.io/oauth-user`

### Edit Your Config File

Make a copy of the sample `.env` file. 

```
cp .sample.env .env
```

Then edit the `.env` file and populate it with the parameters unique to your install. 

### Start the Server

Finally, start the server:

```
yarn dev
```

### Test the Bot

Login to https://glip-app.devtest.ringcentral.com, find the bot by searching its name. Talk to the bot, and follow the its instructions.

## Building and Running Your Bot in Production

```bash
# install pm2 first if you wanna use pm2
yarn global add pm2
# or `npm i -g pm2`

# build
yarn build

# run production server
yarn prod-server

# use pm2
pm2 start bin/pm2.yml
```

## Building and Deploying to AWS Lambda

AWS Lambda with API Gateway and DynamoDB would give us a flexible way to deploy the bot.

*Be aware that AWS Lambda **ONLY works in linux** on an x64 architecture. Therefore, some dependencies will need to be prebuilt and uploaded to Lambda on a linux x64 instance. You could do this in ci or any linux server/destop env.*

Get an AWS account, create `aws_access_key_id` and `aws_secret_access_key` and place them in `~/.aws/credentials`, like this:

```bash
[default]
aws_access_key_id = <your aws_access_key_id>
aws_secret_access_key = <your aws_secret_access_key>
```

For more information, refer to https://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html

```bash
cp lamda/serverless.sample.yml lamda/serverless.yml
```

Edit `lamda/serverless.yml`, and make sure you set the proper name and required env.

```yml
# you can define service wide environment variables here
  environment:
    NODE_ENV: production
    # ringcentral apps

    ## bots
    RINGCENTRAL_BOT_CLIENT_ID:
    RINGCENTRAL_BOT_CLIENT_SECRET:

    ## user
    RINGCENTRAL_USER_CLIENT_ID:
    RINGCENTRAL_USER_CLIENT_SECRET:

    ## common
    RINGCENTRAL_SERVER: https://platform.devtest.ringcentral.com
    RINGCENTRAL_BOT_SERVER: https://xxxx.execute-api.us-east-1.amazonaws.com/default/poc-your-bot-name-dev-bot

    ## for google cloud api crendential path
    GOOGLE_APPLICATION_CREDENTIALS: path/to/google-credential.json

    # db
    DB_TYPE: dynamodb
    DYNAMODB_TABLE_PREFIX: rc_ai_bot1
    DYNAMODB_REGION: us-east-1

```

Deploy to AWS Lambda with `npm run deploy`

```bash
# make sure you have yarn, could use `npm i -g yarn to install`
# then run this cmd to deploy to AWS Lambda, full build, may take more time
npm run deploy

## watch Lambda server log
npm run watch

## update function
npm run update

## update without build, fast update, no rebuild
npm run u
```

- Create API Gateway for your Lambda function, shape as `https://xxxx.execute-api.us-east-1.amazonaws.com/default/poc-your-bot-name-dev-bot/{action+}`
- Make sure your Lambda function role has permission to read/write dynamodb(Set this from AWS IAM roles, could simply attach `AmazonDynamoDBFullAccess` policy to Lambda function's role)
- Make sure your Lambda function's timeout more than 5 minutes
- Do not forget to set your RingCentral app's redirect URL to Lambda's API Gateway URL, `https://xxxx.execute-api.us-east-1.amazonaws.com/default/poc-your-bot-name-dev-bot/bot-oauth` for bot app, `https://xxxx.execute-api.us-east-1.amazonaws.com/default/poc-your-bot-name-dev-bot/user-oauth` for user app.

## Editing This Tutorial

This repo also serves as a tutorial that can be viewed online at https://ringcentral-tutorials.github.io/ringcentral-ai-bot. If you would like to contribute to the documentation effort, clone this repository and run the documentation server locally via the following commands:

```
# install deps
yarn

# start local docs server
yarn docs
```

Then visit http://localhost:8888 to check the tutorial

You can edit `docs/tutorial/index.jade`, docs will auto update `docs/index.html`, refresh http://localhost:8888 to see the change.

## Credits

- The concept of this bot is designed by [@grokify](https://github.com/grokify)
- [@tylerlong](https://github.com/tylerlong) wrote the token management logic
- [@zxdong262](https://github.com/zxdong262) implemented everything else
- [@byrnereese](https://github.com/byrnereese) contributed to the documentation effort

## Documents & Reference

- https://developer.ringcentral.com/legacy-api-reference/index.html#!#Overview.html
- https://ringcentral-api-docs.readthedocs.io/en/latest/glip_bots/
- https://github.com/grokify/ringcentral-polling-and-syncing
- https://github.com/ringcentral/ringcentral-js
- https://github.com/tylerlong/ringcentral-js-concise
- https://github.com/grokify/groupbot
- https://github.com/tylerlong/subx
- https://github.com/zxdong262/audio-analysis-service (Voice transcript/analysis related external service)

## License

MIT

## Copyright

(c) 2018 RingCentral, Inc. 
