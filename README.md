# RingCentral AI Bot

RingCentral Glip voicemail AI bot POC.

## Features
Read Glip user's new voicemail, transcribe the voice to text, analyze the text with Google AI, and send the results to user authurized chat group.

## Prerequisites

- Node.js >= 8.10
- register Google cloud account and set payment method, download your credential json.
- Create a bot app in [RingCentral developer site](https://developers.ringcentral.com), with permissions: `ReadContacts ReadMessages ReadPresence Contacts ReadAccounts SMS InternalMessages ReadCallLog ReadCallRecording SubscriptionWebhook Glip`, set `OAuth Redirect URI` to `https://your-ngrok-addr.ngrok.io/bot-oauth`
- Create a browser based app in RingCentral developer site, with all permissions, set `OAuth Redirect URI` to `https://your-ngrok-addr.ngrok.io/user-oauth`.

## dev

```bash
git clone git@github.com:ringcentral-tutorials/ringcentral-ai-bot.git
# or git clone https://github.com/ringcentral-tutorials/ringcentral-ai-bot.git
cd ringcentral-ai-bot
yarn

# create config
cp .sample.env .env
# then edit .env, fill ringcentral app configs

## start local lamda server
yarn dev

## start a ngrok proxy to local port
yarn proxy
# https://xxxxxx.ngrok.io ---> http://localhost:7867
# you can check ngrok status from http://localhost:4040
```

## Build and Run in production env

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

## Test the bot
- Goto your ringcentral developer site, in bot app's bot page, click `add to glip`
- Login to https://glip-app.devtest.ringcentral.com, click bot to start the chat, just follow the bot's instructions

## Build and deploy to AWS Lambda

AWS lamda with api gate way and dynamodb would give us a flexible way to deploy bot.

- **ONLY works in linux**, AWS lamda is in linux x64, some dependencies need to be prebuilt and upload to lamda, so need the build process in linux x64, you could do it in ci or any linux server/destop env.

- Get a aws account, create aws_access_key_id and aws_secret_access_key, put it in `~/.aws/credentials`, like this:
```bash
[default]
aws_access_key_id = <your aws_access_key_id>
aws_secret_access_key = <your aws_secret_access_key>
```
refer to https://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html.


```bash
cp lamda/serverless.sample.yml lamda/serverless.yml
```
Edit `lamda/serverless.yml`, make sure you set proper name and required env
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

Deploy to aws lamda with `npm run deploy`
```bash
# make sure you have yarn, could use `npm i -g yarn to install`
# then run this cmd to deploy to aws lamda, full build, may take more time
npm run deploy

## watch lamda server log
npm run watch

## update function
npm run update

## update without build, fast update, no rebuild
npm run u
```
- Create api gateway for your lamda function, shape as `https://xxxx.execute-api.us-east-1.amazonaws.com/default/poc-your-bot-name-dev-bot/{action+}`
- Make sure your lamda function role has permission to read/write dynamodb(Set this from aws IAM roles, could simply attach `AmazonDynamoDBFullAccess` policy to lamda function's role)
- Make sure your lamda function's timeout more than 5 minutes
- Do not forget to set your ringcentral app's redirect URL to lamda's api gateway url, `https://xxxx.execute-api.us-east-1.amazonaws.com/default/poc-your-bot-name-dev-bot/bot-oauth` for bot app, `https://xxxx.execute-api.us-east-1.amazonaws.com/default/poc-your-bot-name-dev-bot/user-oauth` for user app.

## Edit tutorial
This repo also serves as a tutorial in https://ringcentral-tutorials.github.io/ringcentral-ai-bot.
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
- [@tylerlong](https://github.com/tylerlong) Wrote the core bot logic

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

