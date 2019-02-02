let Core = require('./core')
let log4js = require('log4js');
let utils = require('./utils')
let logger = log4js.getLogger('chatwe')
var logsystem = require('./logsystem')
logsystem.set_logging({})

var core = new Core()
logsystem.set_logging('debug')

isEnabled = true

core.registerMessageHandler(1,async function(msg){
	fromUser = msg.From
	toUser = msg.To
	content = msg.Content

	if(msg.FromType != 'friend'){
		return true
	}


	if('filehelper'==toUser.UserName){
		let replyContent = "[DONE]"
		if(content == '关闭'){
			isEnabled = false
		} else if (content == '打开') {
			isEnabled = true
		} else {
			replyContent = `[托管中]${this.get_showname(toUser)}您好,${this.get_myNickName()}已经收到您的消息，请您稍等，不要拉黑，不要焦虑，马上回复您，建议您急事直接打电话15858178942.`
		}

		let issucc = await this.reply_to('filehelper',replyContent)
		console.log('Reply ' + (issucc?'OK':'FAIL'))
		return issucc
	}

	if(!isEnabled){
		return true
	}

	replyContent = `[托管中]${this.get_showname(fromUser)}您好,${this.get_myNickName()}已经收到您的消息，请您稍等，不要拉黑，不要焦虑，马上回复您，建议您急事直接打电话15858178942.`
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
