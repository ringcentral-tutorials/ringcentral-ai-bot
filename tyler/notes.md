When start a private chat with the bot:

```
{ uuid: '9116208311595402090',
  event: '/restapi/v1.0/glip/posts',
  timestamp: '2018-10-23T13:39:38.774Z',
  subscriptionId: '7bc1a697-6ae4-4916-9ef3-4ded87ed2753',
  ownerId: '250224004',
  body:
   { id: '183517186',
     name: null,
     description: null,
     type: 'PrivateChat',
     status: 'Active',
     members: [ '230919004', '250224004' ],
     isPublic: null,
     creationTime: '2018-10-23T13:39:37.027Z',
     lastModifiedTime: '2018-10-23T13:39:37.027Z',
     eventType: 'GroupJoined' } }
```


When user post a message to bot:

```
{ uuid: '1929368435839363243',
  event: '/restapi/v1.0/glip/posts',
  timestamp: '2018-10-23T14:09:32.352Z',
  subscriptionId: 'feecc076-8031-48af-8e94-a4764d195809',
  ownerId: '250224004',
  body:
   { id: '1965285380',
     groupId: '183517186',
     type: 'TextMessage',
     text: 'really?',
     creatorId: '230919004',
     addedPersonIds: null,
     creationTime: '2018-10-23T14:09:30.796Z',
     lastModifiedTime: '2018-10-23T14:09:30.796Z',
     attachments: null,
     activity: null,
     title: null,
     iconUri: null,
     iconEmoji: null,
     mentions: null,
     eventType: 'PostAdded' } }
```



Auto refrensh webhook: https://github.com/embbnux/botbuilder-glip/blob/master/src/glip.ts#L158
