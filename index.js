let Core = require('./core')
let log4js = require('log4js');
let utils = require('./utils')
let logger = log4js.getLogger('chatwe')
var logsystem = require('./logsystem')

var core = new Core()
logsystem.set_logging('debug')

isEnabled = true

core.registerMessageHandler(1,async function(msg){
	fromUser = msg.From
	toUser = msg.To
	content = msg.Content


	if('filehelper'==toUser.UserName){
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
			replyContent = `[托管中]${this.get_showname(fromUser)}您好,已经收到您的消息，我马上跑着去通知${this.get_mynickname()}，建议您急事直接打电话15858178942.`
		}

		let issucc = await this.reply_to('filehelper',replyContent)
		console.log('Reply ' + (issucc?'OK':'FAIL'))
		return issucc
	}

	if(!isEnabled){
		return true
	}

	if(msg.FromType != 'friend'){
		return true
	}

	await this.reply_file(msg, 'resource/1.gif')
	replyContent = `[托管中]${this.get_showname(fromUser)}您好,已经收到您的消息，我马上跑着去通知${this.get_mynickname()}，建议您急事直接打电话15858178942.`
	let issucc = await this.reply(msg,replyContent)
	console.log('Reply ' + (issucc?'OK':'FAIL'))
	return issucc


})


async function main() {
	utils.clear_screen()
	await core.login()
	logger.debug('Core :', core)
	logger.info('Is Logined :', core.isLogined)
}

main()
