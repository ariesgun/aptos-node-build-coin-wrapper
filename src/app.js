require('dotenv').config()

const { Aptos, NetworkToNetworkName, Network, AptosConfig, Account, Ed25519PrivateKey, createObjectAddress, Serializer } = require('@aptos-labs/ts-sdk')
const cors = require("cors");
const express = require('express')
const { getPackageBytesToPublish, compilePackage } = require('./util')
const app = express()
const port = 3000

const APTOS_NETWORK = NetworkToNetworkName[process.env.APTOS_NETWORK ?? Network.DEVNET]

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))

const config = new AptosConfig({ network: APTOS_NETWORK })
const aptos = new Aptos(config);

app.get('/build', async (req, res) => {

    const adminAccount = Account.fromPrivateKey({
        privateKey: new Ed25519PrivateKey(process.env.PRIVATE_KEY)
    });

    const accountInfo = await aptos.getAccountInfo({ accountAddress: adminAccount.accountAddress })
    const nextSequence = parseInt(accountInfo.sequence_number) + 1

    const serializer = new Serializer();
    serializer.serializeStr("aptos_framework::object_code_deployment")
    serializer.serializeU64(nextSequence)

    let objectAddress = createObjectAddress(adminAccount.accountAddress, serializer.toUint8Array());
    console.log("Object", objectAddress.toString());

    compilePackage("contracts/", "contracts/wrapper_coin.json", [
        { name: "WrapperCoin", address: objectAddress },
        { name: "fa_metadata", address: req.query.fa_metadata }
    ])

    const { metadataBytes, byteCode } = getPackageBytesToPublish("./contracts/wrapper_coin.json")

    console.log("\n===Publishing WrapperCoin package===");

    console.log("\n===Checking modules onchain===");
    const accountModules = await aptos.getAccountInfo({
        accountAddress: adminAccount.accountAddress,
    });
    console.log(accountModules)

    const result = {
        metadata: metadataBytes,
        byteCode: byteCode,
        objectAddress: objectAddress.toString()
    }

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(result));

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
