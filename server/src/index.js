const express = require("express");
const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");
const uniqid = require("uniqid");

const { Blockchain } = require("./blockchain");
const app = require("./app");
const { startp2pServer, connectToPeers } = require("./p2pServer");

dotenv.config();
require("./utils/prototypes");

// -- OPTIONS --
const port = process.env.HTTP_PORT || 3000;
const p2p_port = process.env.P2P_PORT || 5000;
const initialPeers = process.env.PEERS ? process.env.PEERS.split(",") : [];
const whitelist = process.env.CORS_WHITELIST
	? process.env.CORS_WHITELIST.split(",")
	: [];
const minimal = process.env.minimal || true;

const corsOptions = {
	origin: function(origin, callback) {
		if (
			whitelist.indexOf(origin) !== -1 ||
			whitelist.indexOf("http://localhost") !== -1
		) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	}
};

// -- SETUP --
const server = express();

// -- SERVER SETTINGS GLOBAL --
server.use(cors(corsOptions));
server.use(express.json({ limit: "50mb" }));
server.use(express.urlencoded({ limit: "50mb", extended: true }));
server.use(
	session({
		saveUninitialized: true,
		resave: true,
		secret: process.env.SESSION_SECRET || uniqid(),
		cookie: { maxAge: 60000 }
	})
);

// -- SERVER USES FOR API,... --
if (!minimal) {
	server.use("/static", express.static("public"));
}

server.get("/healthcheck", (req, res, next) => {
	res.json({ success: true });
});
server.use("/blockchain", app);

const startServer = () => {
	return new Promise((resolve, reject) => {
		server.listen(port, () => {
			console.log("------------------------------------");
			console.log("Environment: ", process.env.NODE_ENV);
			console.log(`Serving at http://localhost:${port}`);

			resolve(true);
		});
	});
};

// -- START SERVER --
global.blockchain = new Blockchain({ difficulty: 4, miningReward: 100 });
startServer()
	.then(() => {
		return startp2pServer(p2p_port);
	
	})
	.then(() => {
		return connectToPeers(initialPeers);
	})
	.then(() => {
		console.log("------------------------------------");
		//require('./main');
	})
	.catch(err => {
		console.log(err);
	});
