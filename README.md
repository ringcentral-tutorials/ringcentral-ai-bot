# rc-ai-bot
ringcentral ai bot POC.

## Prerequisites
- latest Chrome browser
- nodejs >= 10.9
- Get a aws account, create aws_access_key_id and aws_secret_access_key, put it in `~/.aws/credentials`, like this:
```bash
[default]
aws_access_key_id = <your aws_access_key_id>
aws_secret_access_key = <your aws_secret_access_key>
```
refer to https://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html

## dev
```bash
git clone git@github.com:zxdong262/rc-ai-bot.git
cd rc-ai-bot
npm i

# create config
cp config.sample.js config.js
# then edit config.js, fill ringcentral app configs

## start local lamda server
npm run dev

## start a ngrok proxy to local port
npm run ngrok
# https://xxxxxx.ngrok.io ---> http://localhost:7867

## deploy to aws lamda
## make sure you edit dist/serverless.yml for proper name and required env

# botAppConfig_clientID: botAppConfig.clientID
# botAppConfig_clientSecret: botAppConfig.clientSecret
# botAppConfig_APIServerURL: botAppConfig.APIServerURL
# botAppConfig_botServerURI: botAppConfig.botServerURI
# userAppConfig_clientID: userAppConfig.clientID
# userAppConfig_clientSecret: userAppConfig.clientSecret
# userAppConfig_APIServerURL: userAppConfig.APIServerURL
# userAppConfig_botServerURI: userAppConfig.botServerURI

# then run this cmd to deploy to aws lamda
npm run deploy

## update function
npm run update

## update without build
npm run u

```