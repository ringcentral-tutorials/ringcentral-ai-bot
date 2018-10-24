# rc-ai-bot
ringcentral ai bot POC.

## Prerequisites
- nodejs >= 10.9
- Get a aws account, create aws_access_key_id and aws_secret_access_key, put it in `~/.aws/credentials`, like this:
```bash
[default]
aws_access_key_id = <your aws_access_key_id>
aws_secret_access_key = <your aws_secret_access_key>
```
refer to https://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html
- register google cloud account and set payment method, download your credential json

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

## deploy to aws lamda
## make sure you edit dist/serverless.yml for proper name and required env
# # ringcentral apps

# ## bots
# RINGCENTRAL_BOT_CLIENT_ID:
# RINGCENTRAL_BOT_CLIENT_SECRET:

# ## user
# RINGCENTRAL_USER_CLIENT_ID:
# RINGCENTRAL_USER_CLIENT_SECRET:

# ## common
# RINGCENTRAL_SERVER:https://platform.devtest.ringcentral.com
# RINGCENTRAL_BOT_SERVER:https://xxx.ngrok.io

# ## for google cloud api crendential path
# GOOGLE_APPLICATION_CREDENTIALS: path-to-your-google-credential.json

# then run this cmd to deploy to aws lamda
npm run deploy

## update function
npm run update

## update without build
npm run u

```