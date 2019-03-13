# chatwe

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Build Status](https://travis-ci.org/yizhiren/chatwe.svg?branch=master)](https://travis-ci.org/yizhiren/chatwe)        
this is a personal wechat client sdk. using the protocol of web wechat.

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

[2019-03-14T00:57:33.157] [INFO] chatwe - Please press confirm on your phone.
[2019-03-14T00:57:34.272] [INFO] chatwe - Please press confirm on your phone.
[2019-03-14T00:57:35.394] [INFO] chatwe - Please press confirm on your phone.

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
 - × Register Other Document File Message
 - × Register Map Message
 - √ Register Chatroom Message
 - √ Reply Text Message
 - √ Reply Image Message
 - √ Reply Video Message
 - × Reply Voice Message
 - √ Reply Other Document File
 - √ Reply ChatRoom Message
 - × Attach Session Status(Open/Close) in Message
 - × Create ChatRoom
 - × Manage Chatroom Member(add/delete)
 - × 50%+ UT Coverage
 - × Plugin Support(AI/Robot plugin)

## License
MIT

## Documentation
 > TODO
