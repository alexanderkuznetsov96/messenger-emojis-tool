var emoji = require('emoji.json')
console.log(emoji[2])
console.log(emoji[2]["codes"])

// Psuedocode
// For each emoji in emojs
//   check if https://static.xx.fbcdn.net/images/emoji.php/v9/teb/1.5/128/<emoji-code>.png exists (i.e. doesn't 404)
// list emojis that exist
