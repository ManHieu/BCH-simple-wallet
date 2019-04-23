// config
const NETWORK = 'testnet'
const BITBOXSDK = require('bitbox-sdk')
let BITBOX
if (NETWORK === 'mainnet')
    BITBOX = new BITBOXSDK({ restURL: `https://rest.bitcoin.com/v2/` })
else BITBOX = new BITBOXSDK({ restURL: `https://trest.bitcoin.com/v2/` })

try {
    var info = require(`./wallet.json`)
    // console.log(info)
} catch (error) {
    console.log(error)
    process.exit(0)
}

async function getBalance() {
    try {
      const balance = await BITBOX.Address.details(info.cashAddress)
      console.log(`BCH Balance :`)
      console.log(balance)
    } catch (err) {
      console.error(`Error : `, err)
      throw err
    }
  }
  getBalance()