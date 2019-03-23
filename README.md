# chatwe - Simple Wechat Client

[![npm package](https://nodei.co/npm/chatwe.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/chatwe/)     
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Dependency Status](https://img.shields.io/david/yizhiren/chatwe.svg?style=flat-square)](https://david-dm.org/yizhiren/chatwe)
[![Build Status](https://travis-ci.org/yizhiren/chatwe.svg?branch=master)](https://travis-ci.org/yizhiren/chatwe)
[![Coverage Status](https://coveralls.io/repos/github/yizhiren/chatwe/badge.svg)](https://coveralls.io/github/yizhiren/chatwe)     

this is a personal wechat client. using the protocol of web wechat.

## what can this do
you can use this to :
 - auto manage wechat friend;
 - auto manage chatroom message;
 - auto reply specified message;
 - made personal wechat a talking robot;
 - use personal wechat a controller to control other machine;

## installation

```bash
npm install chatwe
```


## usage

Minimalist version:
```javascript
var Wechat = require('chatwe');
var wechat = new Wechat()

wechat.registerTextHandler(async function(msg){
	await this.reply(msg,'[received]')
}).login()
```

what you need is execute it and scan qrcode in the console
```
➜  chatwegithub ✗ node demo
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▄▀ ▀ █▄█ ▀█▄▄█ ▄▄▄▄▄ █
█ █   █ █   █▀▄▀▀▀▀ ▄▀█ █   █ █
█ █▄▄▄█ █▄█▀ ▄▄▄▄▄▀▀ ██ █▄▄▄█ █
█▄▄▄▄▄▄▄█▄█ █ █▄▀ ▀▄▀▄█▄▄▄▄▄▄▄█
█ ▄▄▄▀█▄█ █ ▄    ▀▄ ▀█ ▀▀ ▄▄█ █
█▀▀▄ ▄▀▄ ▀  ▄▄ ▀█ █▀█ ▄▄█▀█▄▄▀█
█▄ █▄ ▀▄▀  ▄▀ ▄▄▄▀▄█ █▄▀██▄ ▀▀█
██ ▄██▀▄█▀▄▀ ██ ▀█▄▄▄▄ ▀  █▄ ▄█
█▄ ▄▄▀ ▄▀ ▀▄█▄▄ █▄▀▄▄  █ ▄ ▀ ██
█▄█▀ ▄▄▄▄█▀ ▀██▄ █▀▀█▀▀▀▄▀█ ███
██▄▄█▄█▄▄ ▀ ██▀▀█  ▀▀ ▄▄▄   ▀▀█
█ ▄▄▄▄▄ ██▀ ▀▀▀▀█ █ ▄ █▄█  █▄██
█ █   █ █▀▀█ █▀▀▄ ▄█▀  ▄  ▀▄▄ █
█ █▄▄▄█ █  ▄█ ▀▄█▀█ ▄ ██▄▀▀▄▀▄█
█▄▄▄▄▄▄▄█▄██▄███▄███▄▄▄██▄██▄██

Please press confirm on your phone.
Please press confirm on your phone.
Please press confirm on your phone.

```

## RoadMap
 - √ Login Process
 - √ Register Text Message
 - √ Register Image Message
 - √ Register Video Message
 - √ Register Voice Message
 - √ Register New Friend Message
 - √ Register User Card Message
 - √ Register Sys Message
 - √ Register Other Document File Message
 - √ Register Map Message
 - √ Register Chatroom Message
 - √ Register Status Message
 - √ Reply Text Message
 - √ Reply Image Message
 - √ Reply Video Message
 - √ Reply Other Document File
 - √ Reply ChatRoom Message
 - √ Revoke Message
 - √ 50%+ UT Coverage
 - × Reply Voice Message                 `[not supported by web wechat]`
 - × Create ChatRoom                     `[not supported by web wechat]`
 - × Manage Chatroom Member(add/delete)  `[not supported by web wechat]`
 - × Plugin Support(AI/Robot plugin)

## License
MIT


## API Usage

 - registerTextHandler
```
wechat.registerTextHandler(async function (msg) {
  console.log(msg)
})
```

 - registerMapHandler
```
wechat.registerMapHandler(async function (msg) {
  await msg.Download() // saved filename is msg.Content
  console.log(msg)
})
```

 - registerImageHandler
```
wechat.registerImageHandler(async function (msg) {
  await msg.Download() // saved filename is msg.Content
  console.log(msg)
})
```

 - registerVoiceHandler
```
wechat.registerVoiceHandler(async function (msg) {
  await msg.Download() // saved filename is msg.Content
  console.log(msg)
})
```

 - registerVideoHandler
```
wechat.registerVideoHandler(async function (msg) {
  await msg.Download() // saved filename is msg.Content
  console.log(msg)
})
```

 - registerFileHandler
```
wechat.registerFileHandler(async function (msg) {
  await msg.Download() // saved filename is msg.Content
  console.log(msg)
})
```

 - registerSysHandler
```
wechat.registerSysHandler(async function (msg) {
  console.log(msg)
})
```

 - registerFriendHandler
```
wechat.registerFriendHandler(async function (msg) {
  console.log(msg)
})
```

 - registerCardHandler
```
wechat.registerCardHandler(async function (msg) {
  console.log(msg)
})
```

 - registerStatusHandler
```
wechat.registerStatusHandler(async function (msg) {
  console.log(msg)
})
```

 - registerRecallHandler
```
wechat.registerRecallHandler(async function (msg) {
  console.log(msg)
})
```

 - registerNoteHandler
```
wechat.registerNoteHandler(async function (msg) {
  console.log(msg)
})
```

 - reply
```
wechat.registerTextHandler(async function (msg) {
  await this.reply(msg,'[received]')
})
```

 - replyTo
```
wechat.registerTextHandler(async function (msg) {
  await this.replyTo('filehelper','[received]')
})
```

 - replyFile
```
wechat.registerTextHandler(async function (msg) {
  await this.replyFile(msg,'./abcd.txt')
})
```

 - replyFileTo
```
wechat.registerTextHandler(async function (msg) {
  await this.replyFileTo('filehelper','./abcd.gif')
})
```

## Documentation
 > TODO
