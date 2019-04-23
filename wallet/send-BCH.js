const NETWORK = 'testnet'
const BITBOXSDK = require('bitbox-sdk')
const collector = require('./collect-utxo')

console.log(collector)

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

/**
 * gửi cho người khác
 * @param {*} receiveAddr: địa chỉ nhận 
 * @param {*} amount : số shatoshi muốn gửi 
 */
async function sendBch(receiveAddr, amount) {
    try {
        if (NETWORK === 'mainnet')
            var transactionBuilder = new BITBOX.TransactionBuilder()
        else
            var transactionBuilder = new BITBOX.TransactionBuilder("testnet")
        const balance = await getBCHBalance(SEND_ADDR)
        console.log(`Số dư của địa chỉ: ${SEND_ADDR} là ${balance} BCH.`)

        if (balance <= 0.0) {
            console.log('Địa chỉ có số dư bằng 0')
            process.exit(0)
        }

        const utxo = await BITBOX.Address.utxo(SEND_ADDR)
        const uutxo = utxo.utxos[0]

        const originalAmount = uutxo.satoshis
        const vout = uutxo.vout
        const txid = uutxo.txid
        const satoshisToSend = amount
        let feePerByte = 1.0

        transactionBuilder.addInput(txid, vout)

        const byteCount = BITBOX.BitcoinCash.getByteCount(
            { P2PKH: 1 },
            { P2PKH: 2 }
        )

        let txFee = Math.ceil(feePerByte * byteCount)
        const excess = originalAmount - satoshisToSend - txFee

        transactionBuilder.addOutput(SEND_ADDR, excess)
        transactionBuilder.addOutput(receiveAddr, satoshisToSend)

        const change = addrFromMnemonic(SEND_MNEMONIC, PASSWORD)
        const keyPair = BITBOX.HDNode.toKeyPair(change)

        let redeemScript
        transactionBuilder.sign(
            0,
            keyPair,
            redeemScript,
            transactionBuilder.hashTypes.SIGHASH_ALL,
            originalAmount
        )

        const tx = transactionBuilder.build()
        // console.log(tx)
        const hex = tx.toHex()

        let sendRawTransaction = await BITBOX.RawTransactions.sendRawTransaction([hex])
        console.log('Transaction ID:' + sendRawTransaction)
    } catch (error) {
        console.log(error)
    }
}

async function getBCHBalance(addr) {
    try {
        const result = await BITBOX.Address.details(addr)

        const bchBalance = result

        return bchBalance.balance
    } catch (err) {
        console.error(`Error in getBCHBalance: `, err)
        console.log(`addr: ${addr}`)
        throw err
    }
}

function addrFromMnemonic(mnemonic, password) {

    const rootSeed = BITBOX.Mnemonic.toSeed(mnemonic, password)
    const masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, "testnet")
    const account = BITBOX.HDNode.derivePath(masterHDNode, "m/44'/145'/0'")
    const change = BITBOX.HDNode.derivePath(account, "0/0")
    // console.log(BITBOX.HDNode.toCashAddress(change))
    return change
}
// sendBch('bchtest:pq7mwz272zc44rtw9qdcak55l82rrtu38gekt9zpmt', 50)