let log4js = require('log4js');
let logger = log4js.getLogger('chatwe')
let Config = require('./config')
let url = require('url');
let cheerio = require('cheerio')
let util = require('./utils')
let unesacpetext = require('unescape');

async function reply_to(userName, content) {
	logger.debug('reply_to()')
	localTime = Date.now()

	var options = {
	    uri: this.loginInfo['url'] + '/webwxsendmsg',
    	body : {
	        'BaseRequest': this.loginInfo['BaseRequest'],
	        'Msg': {
	            'Type': 1,
	            'Content': content,
	            'FromUserName': this.get_myname(),
	            'ToUserName': userName,
	            'LocalID': localTime * 10,
	            'ClientMsgId': localTime * 10,
	            },
	        'Scene': 0, 
	    },
    	json: true,
    	method: 'POST'
	}

	logger.debug('reply, option :', options)
	self=this

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('reply resp :', resp)
	    	issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret == 0
	    	logger.debug('reply issucc :', issucc)
	    	return issucc
	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return false
	    });
}

async function reply(msg, content) {
	logger.debug('reply()')
	localTime = Date.now()

	var options = {
	    uri: this.loginInfo['url'] + '/webwxsendmsg',
    	body : {
	        'BaseRequest': this.loginInfo['BaseRequest'],
	        'Msg': {
	            'Type': msg.Type,
	            'Content': content,
	            'FromUserName': msg.To.UserName,
	            'ToUserName': msg.From.UserName,
	            'LocalID': localTime * 10,
	            'ClientMsgId': localTime * 10,
	            },
	        'Scene': 0, 
	    },
    	json: true,
    	method: 'POST'
	}

	logger.debug('reply, option :', options)
	self=this

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('reply resp :', resp)
	    	issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret == 0
	    	logger.debug('reply issucc :', issucc)
	    	return issucc
	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return false
	    });
}

function get_showname(user) {
	let showname = user.RemarkName
	if(showname==''){
		showname = user.NickName
	}

	return showname
}


module.exports.Register =  function(core) {
	core.reply = reply
	core.reply_to = reply_to
	core.get_showname = get_showname
}

