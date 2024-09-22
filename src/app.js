require('dotenv').config()

const { Aptos, NetworkToNetworkName, Network, AptosConfig, Account, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk')
const express = require('express')
const { getPackageBytesToPublish, compilePackage } = require('./util')
const app = express()
const port = 3000

const APTOS_NETWORK = NetworkToNetworkName[process.env.APTOS_NETWORK ?? Network.DEVNET]

const config = new AptosConfig({ network: APTOS_NETWORK })
const aptos = new Aptos(config);

app.get('/build', async (req, res) => {

    const adminAccount = Account.fromPrivateKey({
        privateKey: new Ed25519PrivateKey(process.env.PRIVATE_KEY)
    });

    compilePackage("contracts/", "contracts/wrapper_coin.json", [{ name: "WrapperCoin", address: adminAccount.accountAddress }])

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
    }

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(result));

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
