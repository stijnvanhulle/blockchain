const EC = require("elliptic").ec;

// You can use any elliptic curve you want
const ec = new EC("secp256k1");

// Generate a new key pair and convert them to hex-strings


module.exports = {
	generate: () => {
		const key = ec.genKeyPair();
		const publicKey = key.getPublic("hex");
		const privateKey = key.getPrivate("hex");
		// Print the keys to the console
		console.log();
		console.log(
			"Your public key (also your wallet address, freely shareable)\n",
			publicKey
		);

		console.log();
		console.log(
			"Your private key (keep this secret! To sign transactions)\n",
			privateKey
		);
		return { publicKey, privateKey };
	},
	getAddress: priv => {
		const myKey = ec.keyFromPrivate(priv);

		// From that we can calculate your public key (which doubles as your wallet address)
		const myWalletAddress = myKey.getPublic("hex");
		return myWalletAddress;
	},
	getKeyFromPrivate:fromPrivate=>{
		return ec.keyFromPrivate(fromPrivate);
	},
	getMinerAddress: () => {
		//NOT CORRECT implementation
		if(process.env.MINER_PRIVATE){
			const myKey = ec.keyFromPrivate(process.env.MINER_PRIVATE);

			// From that we can calculate your public key (which doubles as your wallet address)
			return myKey.getPublic("hex");
		}

		console.log('Cannot mine, set MINER_PRIVATE');
	
	}
};
