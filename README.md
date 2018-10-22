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
```
git clone git@github.com:zxdong262/rc-ai-bot.git
cd rc-ai-bot
npm i

## start local lamda server
npm run dev

## deploy to aws lamda
npm run deploy

## update function
npm run update

## update without build
npm run u

```