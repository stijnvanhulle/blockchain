const SHA256 = require("crypto-js/sha256");

const Transaction = require("./transaction");

class Block {
	/**
	 * @param {number} timestamp
	 * @param {Transaction[]} transactions
	 * @param {string} previousHash
	 */
	constructor(timestamp, transactions, previousHash = "") {
		this.previousHash = previousHash;
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.nonce = 0;
		this.hash = this.calculateHash();
	}

	addData(data) {
		const keys = Object.keys(data);
		keys.forEach(key => {
			this[key] = data[key];
		});
		return this;
	}

	/**
	 * Returns the SHA256 of this block (by processing all the data stored
	 * inside this block)
	 *
	 * @returns {string}
	 */
	calculateHash() {
		return SHA256(
			this.previousHash +
				this.timestamp +
				JSON.stringify(this.transactions) +
				this.nonce
		).toString();
	}

	/**
	 * Starts the mining process on the block. It changes the 'nonce' until the hash
	 * of the block starts with enough zeros (= difficulty)
	 *
	 * @param {number} difficulty
	 */
	mineBlock(difficulty) {
		while (
			this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
		) {
			this.nonce++;
			this.hash = this.calculateHash();
		}
	}

	/**
	 * Validates all the transactions inside this block (signature + hash) and
	 * returns true if everything checks out. False if the block is invalid.
	 *
	 * @returns {boolean}
	 */
	hasValidTransactions() {
		for (let tx of this.transactions) {
			if (!tx.isValid) {
				tx = new Transaction().addData(tx);
			}
			if (!tx.isValid()) {
				return false;
			}
		}

		return true;
	}
}

module.exports = Block;
