const ora = require("ora");

const Block = require("./block");
const Transaction = require("./transaction");

class Blockchain {
	//static instance;
	constructor({ difficulty, miningReward }) {
		this.chain = [this.createGenesisBlock()];
		this.difficulty = difficulty || 2;
		this.pendingTransactions = [];
		this.miningReward = miningReward || 100;

		Blockchain.instance = this;
	}

	/**
	 * @returns {Block}
	 */
	createGenesisBlock() {
		const block = new Block(Date.parse("2019-01-01"), [], "0");
		block.index = 0;
		return Object.freeze(block);
	}

	/**
	 * Returns the latest block on our chain. Useful when you want to create a
	 * new Block and you need the hash of the previous Block.
	 *
	 * @returns {Block[]}
	 */
	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	addBlock(block){
		this.pendingTransactions=this.removePendingTransactions(block);
		// do extra checks
		this.chain.push(Object.freeze(block));
	}

	replace(newBlocks) {
		if (this.isChainValid(newBlocks) && newBlocks.length >= this.chain.length) {
			console.log(
				"Received blockchain is valid. Replacing current blockchain with received blockchain"
			);
			this.chain = newBlocks;
			return true;
		} else {
			console.log("Received blockchain invalid");
			return false;
		}
	}

	/**
	 * Takes all the pending transactions, puts them in a Block and starts the
	 * mining process. It also adds a transaction to send the mining reward to
	 * the given address.
	 *
	 * @param {string} miningRewardAddress
	 */
	minePendingTransactions(miningRewardAddress, transactionsChoosen=this.pendingTransactions) {
		if(!this.isChainValid()){
			console.log('Chain is not valid');
			return null;
		}
		if(!miningRewardAddress){
			console.log('No reward address set');
			return null;
		}
		const spinner = ora({ text: "Mining new block" }).start();
		const rewardTx = new Transaction(
			null,
			miningRewardAddress,
			this.miningReward
		);
		transactionsChoosen.push(rewardTx);

		let block = new Block(
			Date.now(),
			transactionsChoosen,
			this.getLatestBlock().hash
		);
		if(!block.hasValidTransactions()){
			throw new Error('Transactions are not valid');
		}
		
		block.mineBlock(this.difficulty);

		spinner.succeed("Block successfully mined with hash: " + block.hash);

		block.index = this.chain.length;
		this.chain.push(Object.freeze(block));

		this.pendingTransactions=this.removePendingTransactions(block);
	
	}

	removePendingTransactions(block){
		let removedPendingTransactions=this.pendingTransactions;
		block.transactions.forEach(transaction=>{
			removedPendingTransactions=removedPendingTransactions.filter(tx=>tx.signature!==transaction.signature);
		});
		return removedPendingTransactions;
	}


	/**
	 * Add a new transaction to the list of pending transactions (to be added
	 * next time the mining process starts). This verifies that the given
	 * transaction is properly signed.
	 *
	 * @param {Transaction} transaction
	 */
	addTransaction(transaction) {
		if (!transaction.fromAddress || !transaction.toAddress) {
			throw new Error("Transaction must include from and to address");
		}

		// Verify the transactiion
		if (!transaction.isValid()) {
			throw new Error("Cannot add invalid transaction to chain");
		}

		const signatureExists = this.pendingTransactions.find(tx=>tx.signature === transaction.signature);
		if(signatureExists){
			throw new Error("Signature already exists, prevet dubble spending");
		}

		if(this.getBalanceOfWallet(transaction.fromAddress) < transaction.amount){
			throw new Error("From address has not enough balance");
		}

		if(this.pendingTransactions && this.pendingTransactions.length>0){
			const totalAmountPendingTransactions=this.pendingTransactions.reduce((previousValue,pendingTransaction)=>{
				if(pendingTransaction.fromAddress===transaction.fromAddress){
					return previousValue+pendingTransaction.amount;
				}
			},0);
			if(totalAmountPendingTransactions >= transaction.amount){
				throw new Error("From address has not enough balance from pending transactions");
			}
		}

		this.pendingTransactions.push(transaction);
	}

	/**
	 * Returns the balance of a given wallet address.
	 *
	 * @param {string} address
	 * @returns {number} The balance of the wallet
	 */
	getBalanceOfWallet(address) {
		let balance = 0;

		for (const block of this.chain) {
			for (const trans of block.transactions) {
				if (trans.fromAddress === address) {
					balance -= trans.amount;
				}

				if (trans.toAddress === address) {
					balance += trans.amount;
				}
			}
		}

		return balance;
	}

	/**
	 * Returns a list of all transactions that happened
	 * to and from the given wallet address.
	 *
	 * @param  {string} address
	 * @return {Transaction[]}
	 */
	getAllTransactionsOfWallet(address) {
		const txs = [];

		for (const block of this.chain) {
			for (const tx of block.transactions) {
				if (tx.fromAddress === address || tx.toAddress === address) {
					txs.push(tx);
				}
			}
		}

		return txs;
	}

	/**
	 * Loops over all the blocks in the chain and verify if they are properly
	 * linked together and nobody has tampered with the hashes. By checking
	 * the blocks it also verifies the (signed) transactions inside of them.
	 *
	 * @returns {boolean}
	 */
	isChainValid(chain = this.chain) {
		// Check if the Genesis block hasn't been tampered with by comparing
		// the output of createGenesisBlock with the first block on our chain
		const realGenesis = JSON.stringify(this.createGenesisBlock());

		if (realGenesis !== JSON.stringify(chain[0])) {
			return false;
		}

		// Check the remaining blocks on the chain to see if there hashes and
		// signatures are correct
		for (let i = 1; i < chain.length; i++) {
			const currentBlock = new Block().addData(chain[i]);
			const previousBlock = new Block().addData(chain[i - 1]);

			if (!currentBlock.hasValidTransactions()) {
				return false;
			}

			if (currentBlock.hash !== currentBlock.calculateHash()) {
				return false;
			}

			if (currentBlock.previousHash !== previousBlock.calculateHash()) {
				return false;
			}
		}

		return true;
	}
}

module.exports = Blockchain;
