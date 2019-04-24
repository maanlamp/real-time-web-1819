const PORT = process.env.PORT || 1337;
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const compression = require("compression");
const routes = require("./routes.js");
const static = express.static;
const playerDB = new Array();
const bulletDB = new Array();

app
	.set("view engine", "ejs")
	.use(compression())
	.use(static("static"))
	.get("/", routes.home);

function log (msg) {
	if (process.env.PORT) return;
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	process.stdout.write(msg);
};

function inflect (str, count) {
	return (count === 1)
		? str
		: str + "s";
}

io.on("connection", socket => {
	socket.on("try register", newPlayer => {
		if (playerDB.find(player => player.name === newPlayer.name))
			return socket.emit("invalid name", newPlayer.name);
		playerDB.push(newPlayer);
		socket.emit("registered", Object.assign(newPlayer, {id: socket.id}));
		io.sockets.emit("announce joined", newPlayer.name);
		log(`${playerDB.length} ${inflect("player", playerDB.length)} online.`);
	});

	socket.on("upload player", uploadedPlayer => {
		const index = playerDB.findIndex(player => player.name === uploadedPlayer.name);
		playerDB.splice(index, 1, uploadedPlayer); //replace old player;
	});

	socket.on("request others", uploadedPlayer => {
		if (!uploadedPlayer) uploadedPlayer = {};
		socket.emit("update others", playerDB.filter(player => player.name !== uploadedPlayer.name));
	})

	socket.on("upload bullets", bullets => {
		bulletDB.length = 0;
		bulletDB.push(...bullets);
		socket.broadcast.emit("download bullets", bulletDB);
	});

	socket.on("disconnect", () => {
		const index = playerDB.findIndex(player => player.id === socket.id);
		if (index === -1) return;
		const player = playerDB.splice(index, 1)[0];
		io.sockets.emit("announce left", player.name);
		log(`${playerDB.length} ${inflect("player", playerDB.length)} online.`);
	});

	socket.on("broadcast hit", (shooter, reciever) => {
		io.sockets.emit("hit", shooter, reciever);
	});

	socket.on("kick", name => {
		Object.values(io.sockets).forEach(([id, socket]) => {
			socket.disconnect();
		});
	});
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}.`));