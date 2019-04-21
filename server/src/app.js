const express = require("express");
const app = express.Router();

const { getAddress, generate, getMinerAddress, getKeyFromPrivate } = require("./keygenerator");
const {getPeers} =require("./p2pServer");

//blockchain
const { Blockchain, Transaction } = require("./blockchain/");
const { broadCastAll,broadCastAfterMined,syncPendingTransactions } = require("./p2pServer");

app.get("/blocks", (req, res) => res.json(Blockchain.instance.chain));
app.get("/peers", (req, res) => {
	res.json({
		peers:getPeers()
	});
});
app.post("/addPeer", (req, res) => {
	const { peer } = req.body;
	connectToPeers([peer]);
	res.send();
});

app.post("/mine", (req, res) => {
	// Mine block, every 10minutes for 1mb size of transactions
	const miningAddress=getMinerAddress();
	if(miningAddress){
		Blockchain.instance.minePendingTransactions(miningAddress, Blockchain.instance.pendingTransactions);
		broadCastAll();
		syncPendingTransactions();
		res.json(Blockchain.instance.chain);
	}else{
		res.json({error:'Cannot mine, set MINER_PRIVATE'})
	}
});

app.get("/transactions/pending", (req, res) => {
	res.json({pendingTransactions:Blockchain.instance.pendingTransactions});
});

app.post("/transactions", (req, res) => {
	const { fromPrivate, fromPublic, toPublic, amount } = req.body;

	const myWalletAddress = getAddress(fromPrivate);

	if (myWalletAddress === fromPublic) {
		try{
			const tx1 = new Transaction(fromPublic, toPublic, parseFloat(amount));
			tx1.signTransaction(getKeyFromPrivate(fromPrivate));
			Blockchain.instance.addTransaction(tx1);
			syncPendingTransactions();
			res.json({ success: true });
		}catch(err){
			console.log({err});
			res.json({ message: err.message });
		}
	
	} else {
		res.json({ success: false, message: "wrong private/public key" });
	}
});

app.post("/valid", (req, res) => {
	const isChainValid = Blockchain.instance.isChainValid();
	res.json({ isChainValid });
});

app.post("/wallet", (req, res) => {
	const { publicKey, privateKey } = generate();
	res.json({ publicKey, privateKey });
});

app.get("/wallet/:wallet", (req, res) => {
	let balance = -1;
	if (req.params.wallet) {
		balance = Blockchain.instance.getBalanceOfWallet(req.params.wallet);
	}
	res.json({ balance });
});

app.get("/miner", (req, res) => {
	let balance = -1;
	const miningAddress=getMinerAddress();
	balance = Blockchain.instance.getBalanceOfWallet(miningAddress);
	res.json({ balance, miningAddress });
});

app.get("/wallet/:wallet/transactions", (req, res) => {
	let transactions;
	if (req.params.wallet) {
		transactions = Blockchain.instance.getAllTransactionsOfWallet(
			req.params.wallet
		);
	}
	res.json({ transactions });
});

app.post("/hack", (req, res) => {
	transactions = Blockchain.instance.chain[1].transactions[0].amount = 10;
	const isChainValid = Blockchain.instance.isChainValid();
	res.json({ isChainValid });
});

app.get("/healthcheck",(req,res)=>{
	const isChainValid = Blockchain.instance.isChainValid();
	res.json({ isChainValid });
})

module.exports = app;
