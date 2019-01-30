const os = require('os');


module.exports = {
	VERSION : '1.3.10',
	BASE_URL : 'https://login.weixin.qq.com',
	PUSHLOGIN_BASE_URL : 'https://wx.qq.com',
	OS : os.platform(),
	DIR : process.cwd(),
	DEFAULT_QR : 'QR.png',
	TIMEOUT : 60,
	USER_AGENT : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36'
}
