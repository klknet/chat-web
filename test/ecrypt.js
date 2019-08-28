const CryptoJS = require('crypto-js')


let key = CryptoJS.enc.Utf8.parse('A1E3K3J3O9E8N6V5')
let iv = CryptoJS.enc.Utf8.parse('1w2e3r4t5j6i7i9k')
/*
 aes加密
  */
function encrypt(word) {
  let srcs = CryptoJS.enc.Utf8.parse(word);
  let encrypted = CryptoJS.AES.encrypt(srcs, key,
    { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  return encrypted.ciphertext.toString().toUpperCase();
}
/*
aes解密
 */
function decrypt(word) {
  let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  let decrypt = CryptoJS.AES.decrypt(srcs, key,
    { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}

let word = "hello word"
cipher = encrypt(word)
console.log(cipher, cipher.length)
console.log('decrypt',decrypt(cipher))

function getParameter(id, ticket, s) {
  let p = new RegExp("(^|&)"+id+"=(?<"+id+">[^&]*)(&|$)")
  let group = s.match(p).groups
  console.log(group)
}
let s = 'userId=aaaa&ticket=bbbb'
getParameter("userId", "ticket", s)
// getParameter("ticket", s)

