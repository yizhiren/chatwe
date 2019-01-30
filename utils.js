let log4js = require('log4js');
let child_process = require('child_process');
let deepcopy = require('deepcopy');
let rp = require('request-promise');
let Config = require('./config')

let logger = log4js.getLogger('chatwe')

let emojiRegex = /<span class="emoji emoji(.{1,10})"><\/span>/g

function emoji_formatter(d, k){
    if(!d[k]){
        return ""
    }

    let _emoji_debugger = function(d,k) {
        s = d[k].replace(/<span class="emoji emoji1f450"><\/span>{0,1}/g,
            '<span class="emoji emoji1f450"></span>') // fix missing bug

        s = s.replace(emojiRegex, function(s0, s1){
            return '<span class="emoji emoji'
                + ({
                    '1f63c': '1f601', '1f639': '1f602', '1f63a': '1f603',
                    '1f4ab': '1f616', '1f64d': '1f614', '1f63b': '1f60d',
                    '1f63d': '1f618', '1f64e': '1f621', '1f63f': '1f622'
                  }[s1] || s1)
                + '"></span>'
        })
        return s
    }

    d[k] = _emoji_debugger(d, k)
    d[k] = d[k].replace(emojiRegex,function(s0,s1){
        if (s1.length == 6) {
            return String.fromCodePoint('0x'+s1.substr(0,2)) + String.fromCodePoint('0x'+s1.substr(2))
        }else if(s1.length == 10) {
            return String.fromCodePoint('0x'+s1.substr(0,5)) + String.fromCodePoint('0x'+s1.substr(5))
        } else {
            return String.fromCodePoint('0x'+s1)
        }
    })

    return d[k]
}
exports.emoji_formatter = emoji_formatter

function clear_screen() {
    process.stdout.write('\033c');
}
exports.clear_screen = clear_screen

function search_dict_list(l, key, value) {
    for (let idx in l) {
        if(value == l[idx][key]) {
            return idx
        }
    }
    return -1
}
exports.search_dict_list = search_dict_list


function check_file(fileDir){
    let stat = fs.statSync(fileDir)
    return stat && stat.isFile()
}
exports.check_file = check_file


function print_line(msg, oneLine = false){
    if(oneLine){
        process.stdout.write(' '*40 + '\r')
    }else{
        process.stdout.write('\n')
    }
    process.stdout.write(msg,'utf8')
}
exports.print_line = print_line


async function test_connect(retryTime=5) {
    for(var i=0;i<retryTime;i++){
        await rp(Config.BASE_URL)
        .then(function (htmlString) {
            return true
        })
        .catch(function (err) {
            if(i == retryTime-1){
                logger.error(err)
                return false
            }
        });
    }
}
exports.test_connect = test_connect



function contact_deep_copy(core, contact){
    return deepcopy(contact)
}
exports.contact_deep_copy = contact_deep_copy
        

function get_image_postfix(data){
    data = data.substr(0,20)

    if(data.indexOf('GIF') >= 0){
        return 'gif'
    } else if(data.indexOf('PNG') >= 0){
        return 'png'
    } else if(data.indexOf('JFIF') >= 0){
        return 'jpg'
    }
    return ''
}
exports.get_image_postfix = get_image_postfix


