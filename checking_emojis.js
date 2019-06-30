const emojis = require('emoji.json')
const fetch = require('node-fetch');
var fs = require('file-system');

//console.log(emoji[2])
//console.log(emoji[2]["codes"])
//console.log(emoji.length)
// Psuedocode
// For each emoji in emojs
//   check if https://static.xx.fbcdn.net/images/emoji.php/v9/teb/1.5/128/<emoji-code>.png exists (i.e. doesn't 404)
// list emojis that exist

/** EmojiStaticConfig, EmojiConfig */
var defaultSize = 32;// 64 does not work, 128 only works for emojis from Unicode 10
var pixelRatio = 3;// values of 1, 1.5, 2 and 3 are working, possibly others as well, but not 2.5
var schemaAuth = "https:\/\/www\.facebook\.com\/images\/emoji\.php\/v9"; // the digit at the end does not seem to matter much, FB uses `7` or `8` or '9'
var fileExt = ".png";
var checksumBase = 317426846;
var supportedSizes = {
    "16": "DP16",
    "18": "DP18",
    "20": "DP20",
    "24": "DP24",
    "28": "DP28",
    "30": "DP30",
    "32": "DP32",
    "64": "DP64",
    "128": "DP128"
};
var types = {
FBEMOJI: "f",
FB_EMOJI_EXTENDED: "e",
MESSENGER: "z",
UNICODE: "u",
TESTING: "t"
}

/**
 * Facebook emoji URL checksum
 * @param string codepoints = "{single-digit pixel ratio}/"
 *                          + "{decimal pixel width/height}/"
 *                          + "{lowercase hexadecimal Unicode positions, separated by underscores}.png"
 *                          = `\d/\d{2,3}/[a-f\d_]+\.png` (lax RX)
 *                          = `[12]/(16|18|20|24|28|30|32|64|128)/[a-f\d]{4,5}(_[a-f\d]{4,5})*\.png` (stricter RX)
 * @param int base = 317426846 (default)
 * @returns string of 2 hexadecimal digits
 */
function checksum(path, base) { /* i(k, l) */
    path = unescape(encodeURIComponent(path));
    /** `unescape()`: `&amp;` → `&`, `&lt;` → `<`, `&gt;` → `>`, `&quot;` → `"`, `&#x27;` → `'` */
    for (var pos = 0; pos < path.length; pos++) {
        base = (base << 5) - base + path.charCodeAt(pos);
        base &= 4294967295;
    }
    return (base & 255).toString(16);
}

function getURL(codepoints, size, type) { /* j(k, l, m) */
    size in supportedSizes || defaultSize;
    var path = pixelRatio + '/' + size + '/' + codepoints + fileExt;
    var check = checksum(path, checksumBase);
    return schemaAuth + '/' + type + check + '/' + path;
}
function getMessengerURL(codepoints, size) { /* k(l, m) */
    return getURL(codepoints, size, types.MESSENGER);
}
function getFBEmojiURL(codepoints) { /* k(l) */
    var size = arguments.length <= 1 || arguments[1] === undefined ? defaultSize : arguments[1];
    return getURL(codepoints, size, types.FBEMOJI);
}
function getFBEmojiExtendedURL(codepoints) { /* k(l) */
    var size = arguments.length <= 1 || arguments[1] === undefined ? defaultSize : arguments[1];
    return getURL(codepoints, size, types.FB_EMOJI_EXTENDED);
}
function getMessengerTestingURL(codepoints) { /* k(l) */
    var size = arguments.length <= 1 || arguments[1] === undefined ? defaultSize : arguments[1];
    return getURL(codepoints, size, types.TESTING);
}

function checkURLStatus(getFn, emoji) {
    var url = getFn(emoji.codes.toLowerCase(), 128);
    fetch(url)
    .then(function(response) {
          console.log(url + ": " + response.status + " " + emoji.char + " " + emoji.name);
          var str = url + "," + response.status + "," + emoji.char + "," + emoji.name + "\n";
          writeStream.write(str);
          });
}

var writeStream = fs.createWriteStream('messenger-emojis-t.csv');

var i = 0;
const max_i = emojis.length;
var timer = setInterval(function() {
                       if(i < max_i){
                        if(!emojis[i].codes.includes(" ")) {
                        checkURLStatus(getMessengerTestingURL, emojis[i]);
                        }
                       } else {
                        clearInterval(timer);
                        writeStream.end();
                      }
                        i++;
                }, 10);
          
