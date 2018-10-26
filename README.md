# rc-ai-bot
Ringcentral glip voicemail AI bot POC.

## Features
Read glip user's new voicemail, trancript the voice to text, and analysis the text, send results to user authurized chat group.

## Prerequisites
- nodejs >= 8.10
- Get a aws account, create aws_access_key_id and aws_secret_access_key, put it in `~/.aws/credentials`, like this:
```bash
[default]
aws_access_key_id = <your aws_access_key_id>
aws_secret_access_key = <your aws_secret_access_key>
```
refer to https://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html.
- register google cloud account and set payment method, download your credential json.
- Create a bot app in ringcentral developer site, with permissions: `ReadContacts ReadMessages ReadPresence Contacts ReadAccounts SMS InternalMessages ReadCallLog ReadCallRecording SubscriptionWebhook Glip`, set `OAuth Redirect URI` to `https://your-ngrok-addr.ngrok.io/bot-oauth`
- Create a browser based app in ringcentral developer site, with all permissions, set `OAuth Redirect URI` to `https://your-ngrok-addr.ngrok.io/user-oauth`.

## dev
```bash
git clone git@github.com:zxdong262/rc-ai-bot.git
cd rc-ai-bot
npm i

# create config
cp .sample.env .env
# then edit .env, fill ringcentral app configs

## start local lamda server
npm run dev

## start a ngrok proxy to local port
npm run ngrok
# https://xxxxxx.ngrok.io ---> http://localhost:7867
# you can check ngrok status from http://localhost:4040
```

## Build and deploy to aws lamda
- Create a bucket in aws s3 console, and upload `bin/database.json` to it, so you can set proper env in `.env` and `dist/serverless.yml`, read https://serverless.com/framework/docs/providers/aws/guide/serverless.yml/ for more about `serverless.yml`.

```bash
# create serverless.yml
cp dist/serverless.sample.yml dist/serverless.yml
```
edit `dist/serverless.yml`, make sure you set proper name and required env
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
    RINGCENTRAL_SERVER:https://platform.devtest.ringcentral.com
    RINGCENTRAL_BOT_SERVER:https://xxx.ngrok.io

    ## for google cloud api crendential path
    GOOGLE_APPLICATION_CREDENTIALS:

    ## S3
    AWS_S3_BUCKET: your-created-s3-bucket-name
    AWS_S3_KEY: database.json
```

```bash
# make sure you have yarn, couild use `npm i -g yarn to install`
# then run this cmd to deploy to aws lamda, full build, may take more time
# this only works in linux x64(the same as aws lamda), you could do this with ci server or any linux server
npm run deploy

## watch lamda server log
npm run watch

## update function
npm run update

## update without build, fast update, no rebuild
npm run u
```

### Extral deploy steps
To make it work in aws lamda, need extra setting in your lamda console

- Create api gateway for your lamda function, shape as `https://xxxx.execute-api.us-east-1.amazonaws.com/default/poc-your-bot-name-dev-bot/{action+}`
- Make sure your lamda function role has permission to read/write S3(Set this from aws IAM roles, could simply attach AmazonS3FullAccess policy to lamda function's role)
- Make sure your lamda function's timeout more than 3 minutes

## Test the bot
- Goto your ringcentral developer site, in bot app's bot page, click add to glip
- Login to https://glip-app.devtest.ringcentral.com, click bot to start the chat, just follow the bot's instructions

## License
MIT

