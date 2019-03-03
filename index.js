let Core = require('./core')
let log4js = require('log4js');
let utils = require('./utils')
let logger = log4js.getLogger('chatwe')
var logsystem = require('./logsystem')

var core = new Core()
logsystem.set_logging('debug')

isEnabled = true

core.registerPictureHandler(async function(msg){
	let resp = await msg.Download()
	console.log('Download Pic ' + msg.Content, resp)
	if(isEnabled && msg.FromType == 'friend'){
		await this.reply(msg,'[已接收]')
	}

})

core.registerVideoHandler(async function(msg){
	let resp = await msg.Download()
	console.log('Download Video ' + msg.Content, resp)
	if(isEnabled && msg.FromType == 'friend'){
		await this.reply(msg,'[已接收]')
	}
	
})

core.registerVoiceHandler(async function(msg){
	let resp = await msg.Download()
	console.log('Download Vioce ' + msg.Content, resp)
	if(isEnabled && msg.FromType == 'friend'){
		await this.reply(msg,'[已接收]')
	}
})

async function handlerControl(msg) {
	fromUser = msg.From
	toUser = msg.To
	content = msg.Content

	let replyContent = "[DONE]"
	if(content == '关闭'){
		isEnabled = false
	} else if (content == '打开') {
		isEnabled = true
	} else if (content == '1') {
		await this.reply_file_to('filehelper', 'resource/1.gif')
	} else if (content == '2') {
		await this.reply_file_to('filehelper', 'resource/2.mov')
	} else if (content == '3') {
		await this.reply_file_to('filehelper', 'resource/3.png')
	} else if (content == '4') {
		await this.reply_file_to('filehelper', 'resource/4.json')
	} else {
		await this.reply_file_to('filehelper', 'resource/1.gif')
		replyContent = `[托管中]${fromUser.NickName}您好,${this.get_mynickname()}正在赶来，急事请电话15858178942.`
	}

	let issucc = await this.reply(msg,replyContent)
	console.log('Reply ' + (issucc?'OK':'FAIL'))
	return issucc
}

function delayRevoke(userName, msgResp) {
	console.log('delayRevoke,', userName, msgResp)
	self = this
	setTimeout(async function(){
		console.log('execute delayRevoke,', userName, msgResp)
		resp = await self.revoke(userName, msgResp)
		console.log('Revoke ' + (resp?'OK':'FAIL'))
	},10000)
}

core.registerTextHandler(async function(msg){
	fromUser = msg.From
	toUser = msg.To
	content = msg.Content


	if('filehelper'==fromUser.UserName){
		return await handlerControl.call(this, msg)
	}

	if(!isEnabled){
		return true
	}

	if (msg.FromType == 'friend') {
		let respGif = await this.reply_file(msg, 'resource/1.gif')
		replyContent = `[消息将自动撤回]${fromUser.NickName}您好,${this.get_mynickname()}正在赶来，急事请电话15858178942.`
		let resp = await this.reply(msg,replyContent)
		console.log('Reply ' + (resp?'OK':'FAIL'))
		if(resp) {
			delayRevoke.call(this, fromUser.UserName, respGif)
			delayRevoke.call(this, fromUser.UserName, resp)
		}
		return resp
	}

	if (msg.FromType == 'chatroom' && msg.IsAtMe){
		userInRoom = msg.ChatRoomUser
		let respGif = await this.reply_file(msg, 'resource/1.gif')
		replyContent = `[消息将自动撤回]${userInRoom.NickName}您好,${this.get_mynickname()}正在赶来，急事请电话15858178942.`
		let resp = await this.reply(msg,replyContent)
		console.log('Reply ' + (resp?'OK':'FAIL'))
		if(resp) {
			delayRevoke.call(this, fromUser.UserName, respGif)
			delayRevoke.call(this, fromUser.UserName, resp)
		}

		return resp
	}

	if (msg.FromType == 'self') {
		console.log('I Sent:', msg)
		return true
	}



})


async function main() {
	utils.clear_screen()
	await core.login()
	logger.debug('Core :', core)
	logger.info('Is Logined :', core.isLogined)
}

main()
