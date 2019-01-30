let rp = require('request-promise');
let Config = require('./config')
let FileCookieStore = require('tough-cookie-filestore-fix');
let fs = require('fs')
let Login = require('./login')

let instNum = 0
class Core{

    init(){
        this.isLogined = false
        this.isLogging = false
        this.loginInfo = {}

        this.uuid = ''
        this.memberList = []
        this.mpList = []
        this.chatroomList = []
        this.subscribeList = []

        this.init_memberList = []
        this.init_mpList = []
        this.init_chatroomList = []
        this.init_subscribeList = []

        this.msgList = []
    }

    constructor(){
        this.init()

        this.cookieFile = 'cookie/wxcookie' + instNum + '.json'
        fs.readFileSync(this.cookieFile,{flag:'a+'})
        this.cookieStore = new FileCookieStore(this.cookieFile)
        this.cookieJar = rp.jar(this.cookieStore)
        this.s = rp.defaults({
        	jar: this.cookieJar,
        	headers: {
		        'User-Agent': Config.USER_AGENT
		    }
        })
        Login.Register(this)

        instNum ++
    }

}

module.exports = Core


