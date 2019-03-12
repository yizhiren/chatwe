let log4js = require('log4js')
let deepcopy = require('deepcopy')
let rp = require('request-promise')
let Config = require('./config')
let fs = require('fs')

let logger = log4js.getLogger('chatwe')

let emojiRegex = /<span class="emoji emoji(.{1,10})"><\/span>/g

function emojiFormatter (d, k) {
  if (!d[k]) {
    return ''
  }

  let _emojiDebugger = function (d, k) {
    var s = d[k].replace(/<span class="emoji emoji1f450"><\/span>{0,1}/g,
      '<span class="emoji emoji1f450"></span>') // fix missing bug

    s = s.replace(emojiRegex, function (s0, s1) {
      return '<span class="emoji emoji' +
                ({
                  '1f63c': '1f601',
                  '1f639': '1f602',
                  '1f63a': '1f603',
                  '1f4ab': '1f616',
                  '1f64d': '1f614',
                  '1f63b': '1f60d',
                  '1f63d': '1f618',
                  '1f64e': '1f621',
                  '1f63f': '1f622'
                }[s1] || s1) +
                '"></span>'
    })
    return s
  }

  d[k] = _emojiDebugger(d, k)
  d[k] = d[k].replace(emojiRegex, function (s0, s1) {
    if (s1.length === 6) {
      return String.fromCodePoint('0x' + s1.substr(0, 2)) + String.fromCodePoint('0x' + s1.substr(2))
    } else if (s1.length === 10) {
      return String.fromCodePoint('0x' + s1.substr(0, 5)) + String.fromCodePoint('0x' + s1.substr(5))
    } else {
      return String.fromCodePoint('0x' + s1)
    }
  })

  return d[k]
}
exports.emojiFormatter = emojiFormatter

function clearScreen () {
  process.stdout.write('\x1Bc')
  // '\033c'
  // Octal literals are not allowed in strict mode.
}
exports.clearScreen = clearScreen

function searchDictList (l, key, value) {
  for (let idx in l) {
    if (value === l[idx][key]) {
      return idx
    }
  }
  return -1
}
exports.searchDictList = searchDictList

function checkFile (fileDir) {
  let stat = fs.statSync(fileDir)
  return stat && stat.isFile()
}
exports.checkFile = checkFile

function printLine (msg, oneLine = false) {
  if (oneLine) {
    process.stdout.write(' ' * 40 + '\r')
  } else {
    process.stdout.write('\n')
  }
  process.stdout.write(msg, 'utf8')
}
exports.printLine = printLine

async function testConnect (retryTime = 5) {
  for (var i = 0; i < retryTime; i++) {
    await rp(Config.BASE_URL)
      .then(function (htmlString) {
        return true
      })
      .catch(function (err) {
        if (i === retryTime - 1) {
          logger.error(err)
          return false
        }
      })
  }
}
exports.testConnect = testConnect

function contactDeepCopy (core, contact) {
  return deepcopy(contact)
}
exports.contactDeepCopy = contactDeepCopy

function getImagePostfix (data) {
  data = data.substr(0, 20)

  if (data.indexOf('GIF') >= 0) {
    return 'gif'
  } else if (data.indexOf('PNG') >= 0) {
    return 'png'
  } else if (data.indexOf('JFIF') >= 0) {
    return 'jpg'
  }
  return ''
}
exports.getImagePostfix = getImagePostfix
