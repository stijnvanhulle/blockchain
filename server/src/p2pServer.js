const WebSocket = require("ws");
const { Blockchain } = require("./blockchain");

let PEERS = [];
const IP = `ws://${process.env.CURRENT_PEER}`;
const sockets = [];
const MessageType = {
	QUERY_LATEST: 0,
	QUERY_ALL: 1,
	RESPONSE_BLOCKCHAIN: 2,
	RESPONSE_PENDING_TRANSACTIONS: 3,
	SET_PEER: 4,
	UPDATE_PEERS: 5,
};

const getLatestBlock = () => Blockchain.instance.getLatestBlock();
const getPendingTransactions = () => Blockchain.instance.pendingTransactions;

const queryChainLengthMsg = () => ({ type: MessageType.QUERY_LATEST });
const setPeer = ip => ({ type: MessageType.SET_PEER, data: ip });
const updateWithNewPeers = peers => ({
	type: MessageType.UPDATE_PEERS,
	data: peers
});
const queryAllMsg = () => ({ type: MessageType.QUERY_ALL });

const write = (ws, message) => ws.send(JSON.stringify(message));
const broadcast = message => sockets.forEach(socket => write(socket, message));

const responseAllBlocks = () => ({
	type: MessageType.RESPONSE_BLOCKCHAIN,
	data: JSON.stringify(Blockchain.instance.chain)
});
const responseLatestBlockchain = () => ({
	type: MessageType.RESPONSE_BLOCKCHAIN,
	data: JSON.stringify([getLatestBlock()])
});
const responsePendingTransactions= () => ({
	type: MessageType.RESPONSE_PENDING_TRANSACTIONS,
	data: JSON.stringify(getPendingTransactions())
});

const handlePendingsTransactionsResponse=(data)=>{
	Blockchain.instance.pendingTransactions=JSON.parse(data);;
}
const handleBlockchainResponse = data => {
	const receivedBlocks = JSON.parse(data).sort((b1, b2) => b1.index - b2.index);
	const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
	const latestBlockHeld = getLatestBlock();
	if (latestBlockReceived.index > latestBlockHeld.index) {
		console.log(
			"blockchain possibly behind. We got: " +
				latestBlockHeld.index +
				" Peer got: " +
				latestBlockReceived.index
		);
		if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
			console.log("We can append the received block to our chain");
			if(Blockchain.instance.isChainValid()){
				Blockchain.instance.addBlock(latestBlockReceived)
				broadcast(responseLatestBlockchain());
			}else{
				const isValidReplaced = Blockchain.instance.replace(receivedBlocks);
				console.log({isValidReplaced});
			}
			
		} else if (receivedBlocks.length === 1) {
			console.log("We have to query the chain from our peer");
			broadcast(queryAllMsg());
		} else {
			console.log("Received blockchain is longer than current blockchain");
			const isValidReplaced = Blockchain.instance.replace(receivedBlocks);
			if (isValidReplaced) {
				broadcast(responseLatestBlockchain());
			}
		}
	} else {
		console.log(
			"received blockchain is not longer than current blockchain. Do nothing"
		);
	}
};

const initErrorHandler = ws => {
	const closeConnection = ws => {
		console.log("connection failed to peer: " + ws.url);
		sockets.splice(sockets.indexOf(ws), 1);
		process.exit(0);
	};
	ws.on("close", () => closeConnection(ws));
	ws.on("error", () => closeConnection(ws));
};

const initConnection = ws => {
	sockets.push(ws);
	initMessageHandler(ws);
	initErrorHandler(ws);
	write(ws, setPeer(IP));
	write(ws, queryChainLengthMsg());
};

const initMessageHandler = ws => {
	ws.on("message", message => {
		const { type, data } = JSON.parse(message);
		console.log("Received message" + JSON.stringify(type));
		switch (type) {
			case MessageType.QUERY_LATEST:
				write(ws, responseLatestBlockchain());
				break;
			case MessageType.QUERY_ALL:
				write(ws, responseAllBlocks());
				break;
			case MessageType.RESPONSE_BLOCKCHAIN:
				handleBlockchainResponse(data);
				broadcast(responsePendingTransactions());
				break;
			case MessageType.RESPONSE_PENDING_TRANSACTIONS:
				handlePendingsTransactionsResponse(data);
				break;
			case MessageType.SET_PEER:
				// update redis with new peer
				// redis client update
				//update to other ws with all available peers
				if (PEERS.find(item => item != data)) {
					PEERS.push(data);
				}
				PEERS = [...new Set(PEERS.map(item => item))];
				console.log("Current peer", PEERS);
				broadcast(updateWithNewPeers(PEERS));
				break;

			case MessageType.UPDATE_PEERS:
				// update redis with all peers
				PEERS = [...PEERS, ...data];

				console.log("updated peers", PEERS);
				break;
		}
	});
};

const startp2pServer = port => {
	return new Promise((resolve, reject) => {
		const server = new WebSocket.Server({ port });
		server.on("connection", ws => initConnection(ws));
		console.log("Listening websocket p2p port on: " + port);
		resolve(server);
	});
};

const connectToPeers = peers => {
	PEERS = [...PEERS, ...peers];

	PEERS.filter(item => item !== IP).forEach(peer => {
		var ws = new WebSocket(peer);
		ws.on("open", () => initConnection(ws));
		ws.on("error", (err) => {
			console.log("connection failed",err);
			
		});
	});
};

module.exports.startp2pServer = startp2pServer;
module.exports.connectToPeers = connectToPeers;
module.exports.getPeers=()=>PEERS;
module.exports.broadCastAll = () => {
	broadcast(responseLatestBlockchain())
	
};
module.exports.syncPendingTransactions=()=>{
	broadcast(responsePendingTransactions())
}