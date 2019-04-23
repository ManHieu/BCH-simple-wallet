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

const SEND_ADDR = info.cashAddress
const SEND_MNEMONIC = info.mnemonic
const PASSWORD = info.password
// console.log(SEND_ADDR + '\n' + SEND_MNEMONIC)

async function collect() {
    try {
        if (NETWORK === 'mainnet')
            var transactionBuilder = new BITBOX.TransactionBuilder()
        else
            var transactionBuilder = new BITBOX.TransactionBuilder("testnet")

        let sendAmount = 0
        const inputs = []
        const utxo = await BITBOX.Address.utxo(SEND_ADDR)

        // console.log(utxo)

        for (let i = 0; i < utxo.utxos.length; i++) {
            const cutxo = utxo.utxos[i]
            // console.log(cutxo)

            inputs.push(cutxo)
            sendAmount += cutxo.satoshis

            transactionBuilder.addInput(cutxo.txid, cutxo.vout)
        }

        let byteCount = BITBOX.BitcoinCash.getByteCount(
            { P2PKH: inputs.length },
            { P2PKH: 1 }
        )
        // console.log(`byteCount: ${byteCount}`)
        let feePerByte = 1.0
        let txFee = Math.ceil(feePerByte * byteCount)
        // console.log(`txFee: ${txFee}`)

        if (sendAmount - txFee < 0) {
            console.log(`Bạn không đủ coin để trả phí`)
            return
        }

        transactionBuilder.addOutput(SEND_ADDR, sendAmount - txFee)

        const change = addrFromMnemonic(SEND_MNEMONIC, PASSWORD)
        const keyPair = BITBOX.HDNode.toKeyPair(change)

        let redeemScript
        inputs.forEach((input, index) => {
            transactionBuilder.sign(
                index,
                keyPair,
                redeemScript,
                transactionBuilder.hashTypes.SIGHASH_ALL,
                input.satoshis
            )
        })

        const tx = transactionBuilder.build()
        // console.log(tx)
        const hex = tx.toHex()

        let sendRawTransaction = await BITBOX.RawTransactions.sendRawTransaction([hex])
        console.log('Transaction ID:' + sendRawTransaction)
    } catch (error) {

        console.log(error)
    }
}
// collect()
function addrFromMnemonic(mnemonic, password) {

    const rootSeed = BITBOX.Mnemonic.toSeed(mnemonic, password)
    const masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, "testnet")
    const account = BITBOX.HDNode.derivePath(masterHDNode, "m/44'/145'/0'")
    const change = BITBOX.HDNode.derivePath(account, "0/0")
    // console.log(BITBOX.HDNode.toCashAddress(change))
    return change
}
module.exports = addrFromMnemonic
module.exports = collect