# rc-ai-bot
ringcentral ai bot POC.

## Prerequisites
- nodejs >= 8.10
- Get a aws account, create aws_access_key_id and aws_secret_access_key, put it in `~/.aws/credentials`, like this:
```bash
[default]
aws_access_key_id = <your aws_access_key_id>
aws_secret_access_key = <your aws_secret_access_key>
```
refer to https://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html
- Create you need create a bucket in aws s3 console, and upload a `database.json` with content `{}`, so you can set proper env in `.env` and `dist/serverless.yml`
```
- register google cloud account and set payment method, download your credential json

## dev
```bash
git clone git@github.com:zxdong262/rc-ai-bot.git
cd rc-ai-bot
npm i

# create config
cp .sample.env .env
# then edit .env, fill ringcentral app configs

# create empty database key
cp dist/database.json database.json

## start local lamda server
npm run dev

## start a ngrok proxy to local port
npm run ngrok
# https://xxxxxx.ngrok.io ---> http://localhost:7867
# you can check ngrok status from http://localhost:4040
```

## Build and deploy to aws lamda
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
npm run deploy


## watch lamda server log
npm run watch

## update function
npm run update

## update without build, fast update, no rebuild
npm run u
```

