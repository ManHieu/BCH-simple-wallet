const NETWORK = 'testnet'
const BITBOXSDK = require('bitbox-sdk')

if (NETWORK === 'mainnet')
    BITBOX = new BITBOXSDK({ restURL: `https://rest.bitcoin.com/v2/` })
else BITBOX = new BITBOXSDK({ restURL: `https://trest.bitcoin.com/v2/` })

let socket = new BITBOX.Socket({callback: () => {console.log('connected')}, restURL: 'https://trest.bitcoin.com/v2/'})
  socket.listen('transactions', (message) => {
    console.log(message)
  })