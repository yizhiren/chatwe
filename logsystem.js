const log4js = require('log4js');


class LogSystem {
    constructor(object) {
        this.showOnCmd = true
        this.loggingFile = undefined

        this.logger = log4js.getLogger('chatwe')
        this.set_console_with_level('info')
    }

    set_console_with_level(level) {
        log4js.configure({
          appenders: {
            console: {
              type: 'console'
            }
          },
          categories: {
            default: { appenders: ['console'], level: level }
          }
        });
    }

    set_logging(loggingLevel='info',showOnCmd=true, loggingFile=undefined) {

        let appenders = {}
        let appendersName = []

        if(showOnCmd != this.showOnCmd || loggingFile != this.loggingFile) {
            if(showOnCmd) {
                appendersName.push('console')
                appenders.console = {
                  type: 'console'
                }
            }
            this.showOnCmd = showOnCmd

            if(loggingFile != undefined) {
                appendersName.push('file')
                appenders.console = {
                  type: 'file',
                  filename: loggingFile,
                  maxLogSize: 1024,
                  backups: 3
                }
            }
            this.loggingFile = loggingFile

            if (appendersName.length === 0) {
                set_console_with_level('OFF')
            } else {
                log4js.configure({
                  appenders: appenders,
                  categories: {
                    default: { appenders: appendersName, level: loggingLevel }
                  }
                }); 
            }

        }

        this.logger.level = loggingLevel
    }

}


ls = new LogSystem()

module.exports = ls


