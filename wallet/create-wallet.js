/* 
* Tạo một HD-wallet 
*/
// config
const NETWORK = 'testnet'
const BITBOXSDK = require('bitbox-sdk')
let BITBOX
if (NETWORK === 'mainnet')
    BITBOX = new BITBOXSDK({ restURL: `https://rest.bitcoin.com/v2/` })
else BITBOX = new BITBOXSDK({ restURL: `https://trest.bitcoin.com/v2/` })

let strOut = ''
const objOut = {}

// Tạo mnemonic
const radomBytes = BITBOX.Crypto.randomBytes(32)
const mnemonic = BITBOX.Mnemonic.fromEntropy(radomBytes)

console.log(`128 bit Mnemonic:\n${mnemonic}`)
strOut += `128 bit Mnemonic:\n${mnemonic} \n\n `
objOut.mnemonic = mnemonic
console.log(objOut)

// Tạo root seed
var password = "M.Hieu"
objOut.password = password

const rootSeed = BITBOX.Mnemonic.toSeed(mnemonic, password)

// Tạo HD-masterNode
let masterHDNode
if (NETWORK === `mainnet`)
    masterHDNode = BITBOX.HDNode.fromSeed(rootSeed)
else masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, "testnet")

// Tạo account
console.log(`Account: "m/44'/145'/0'"`)
strOut += `Account: m/44'/145'/0'\n`

const childNode = BITBOX.HDNode.derivePath(masterHDNode, "m/44'/145'/0'/0/0")
const cashAddr = BITBOX.HDNode.toCashAddress(childNode)
const legacyAddr = BITBOX.HDNode.toLegacyAddress(childNode)

objOut.cashAddress = cashAddr
objOut.legacyAddress = legacyAddr
console.log(`m/44'/145'/0'/0/0:` + cashAddr)
strOut += `m/44'/145'/0'/0/0: ${cashAddr}\n`

// Ghi lại thông tin ra file wallet.txt và file wallet.json

const fs = require('fs')
fs.writeFile('wallet.txt',strOut, function(err){
    if (err) return console.error(err)
    else console.log('Ghi file wallet.txt thành công')
})
fs.writeFile('wallet.json', JSON.stringify(objOut, null, 2), function(err){
    if (err) return console.error(err)
    else console.log('Ghi file wallet.json thành công')
})