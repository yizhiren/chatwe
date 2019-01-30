let Core = require('./core')
let log4js = require('log4js');
let utils = require('./utils')
let logger = log4js.getLogger('chatwe')
var logsystem = require('./logsystem')
logsystem.set_logging({})

var core = new Core()
logsystem.set_logging('debug')
core.registerMessageHandler(1,function(msg){
	fromUser = msg.From
	toUser = msg.To
	notifyUsers = msg.NotifyUsers

	fromName = fromUser.NickName
	if(fromUser.RemarkName && ''!=fromUser.RemarkName) {
		fromName += '(' + fromUser.RemarkName + ')'
	}
	toName = toUser.NickName
	if(toUser.RemarkName && ''!=toUser.RemarkName) {
		toName += '(' + toUser.RemarkName + ')'
	}

	console.log("[%d]%s -> %s : %s", msgType, fromName, toName, content)

})


async function main() {
	utils.clear_screen()
	await core.login()
	logger.debug('Core :', core)
	logger.info('Is Logined :', core.isLogined)
}

main()
