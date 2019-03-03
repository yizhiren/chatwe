# chatwe

this is a wechat client sdk. using the protocol of web wechat.

## installation

```bash
npm install chatwe
```


## usage

Minimalist version:
```javascript
var Wechat = require('chatwe');
var wechat = new Wechat()

wechat.register_text_handler(async function(msg){
	await this.reply(msg,'[已收到]')
})
```


## Documentation
TODO
