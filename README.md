# rc-ai-bot
Ringcentral glip voicemail AI bot POC.

## Features
Read glip user's new voicemail, trancript the voice to text, and analysis the text with google AI, send results to user authurized chat group.

## Prerequisites
- nodejs >= 8.10
- register google cloud account and set payment method, download your credential json.
- Create a bot app in ringcentral developer site, with permissions: `ReadContacts ReadMessages ReadPresence Contacts ReadAccounts SMS InternalMessages ReadCallLog ReadCallRecording SubscriptionWebhook Glip`, set `OAuth Redirect URI` to `https://your-ngrok-addr.ngrok.io/bot-oauth`
- Create a browser based app in ringcentral developer site, with all permissions, set `OAuth Redirect URI` to `https://your-ngrok-addr.ngrok.io/user-oauth`.

## dev
```bash
git clone git@github.com:zxdong262/rc-ai-bot.git
# or
cd rc-ai-bot
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
- Goto your ringcentral developer site, in bot app's bot page, click add to glip
- Login to https://glip-app.devtest.ringcentral.com, click bot to start the chat, just follow the bot's instructions

## Build and deploy to aws lamda
https://github.com/zxdong262/rc-ai-bot/wiki/Build-and-deploy-to-aws-lamda

## License
MIT

