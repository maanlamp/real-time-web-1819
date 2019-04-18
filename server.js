const PORT = process.env.port || 1337;
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const compression = require("compression");
const routes = require("./routes.js");
const static = express.static;
const users = new Array();

app
	.set("view engine", "ejs")
	.use(compression())
	.use(static("static"))
	.get("/", routes.home);

	
io.on("connection", socket => {
	socket.on("register", name => {
		if (users.find(user => user.name === name)) {
			socket.emit("invalid", name);
		} else {
			users.push({name, position: {}, angle: 0});
			socket.emit("registered", name);
			console.log(`Player '${name}' joined the game`);
		}
	}).on("update", player => {
		const user = users.find(user => user.name === player.name);
		if (!user) return;
		user.position = player.position;
		user.direction = player.direction;
		socket.emit("update", users);
	});
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}.`));