"use strict";

import { fpsFromDeltatime } from "./modules/Frames.js";
import Canvas from "./modules/Canvas.js";
import Game from "./modules/Game.js";
import keybinds from "/data/keybinds.js";
import Player from "./modules/Player.js";
import Vector2 from "./modules/Vector2.js";
import Bullet from "./modules/Bullet.js";

const socket = io();
const game = new Game();
console.log(game);
window.game = game;

void async function createMainView () {
	const room = {width: 1900, height: 960};
	const canvas = new Canvas(room);
	document.body.prepend(canvas.element);
	game
		.bindkeys(keybinds)
		.set("viewport", canvas)
		.set("room", room)
		.set("others", new Array())
		.set("bullets", new Array())
		.set("max speed", 10)
		.set("acceleration", 10)
		.set("sprites", Array.from(document.querySelectorAll(".sprites img")))
		.enter("viewport")
			.clear()
			.style(`
				fill: black;
				image-smoothing: true high;
				text-align: center`);

		//DEBUG
		game.get("viewport").__CTX.font = "18px sans-serif";
		game.get("viewport").__CTX.strokeStyle = "lime";
		game.get("viewport").__CTX.textAlign = "center";
}();

const radToDeg = Math.PI / 180;
const sprites = game.get("sprites");
const ctx = game.get("viewport").__CTX;
function draw (player, outline = false) {
	if (!player) return;
	ctx.save();
	ctx.translate(player.position.x, player.position.y);
	if (outline) {
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(0, 0, Math.max(sprites[player.sprite].width, sprites[player.sprite].height) / 2, 0, Math.PI * 2);
		ctx.stroke();
		ctx.lineWidth = 1;
	}
	ctx.fillStyle = "lime";
	ctx.fillText(player.name, 0, sprites[player.sprite].height/2 + 24);
	ctx.rotate(player.direction * radToDeg);
	ctx.drawImage(sprites[player.sprite], -sprites[player.sprite].width/2, -sprites[player.sprite].height/2);
	ctx.restore();

	ctx.save();
	ctx.translate(player.position.x, player.position.y + sprites[player.sprite].height/2 + 40);
	ctx.fillStyle = "gray";
	ctx.fillRect(-50, 0, 100, 5);
	ctx.fillStyle = "red";
	ctx.fillRect(-50, 0, 100 * player.health / 1000, 5);
	ctx.restore();
}

let fwd = false;
let bwd = false;
let lft = false;
let rgt = false;
let spd = 0;
const frc = 0; //SET TO HIGHER FOR FRICTION, BUT THERES NO FRICTION IN SPACE!!
window.addEventListener("keydown", event => {
	switch (event.key.toLowerCase()) {
		case "w": {return fwd = true};
		case "a": {return lft = true};
		case "s": {return bwd = true};
		case "d": {return rgt = true};
	}
});
window.addEventListener("keyup", event => {
	switch (event.key.toLowerCase()) {
		case "w": {return fwd = false};
		case "a": {return lft = false};
		case "s": {return bwd = false};
		case "d": {return rgt = false};
	}
});
window.addEventListener("keyup", event => {
	const player = game.get("player");
	if ((!player) || event.key !== " ") return;
	game.add("bullets", new Bullet(player, bulletSprite));
	socket.emit("upload bullets", game.get("bullets"));
});

const bulletSprite = sprites.find(sprite => sprite.classList.contains("bullet"));
function updateBullet (bullet, deltatime) {
	bullet.position = Vector2.from(bullet.position).add(Vector2.lenDir(bullet.speed * deltatime, bullet.direction - 90));
	ctx.save();
	ctx.globalAlpha = Math.min(1, bullet.__LIFETIME / 30);
	ctx.translate(bullet.position.x, bullet.position.y);
	ctx.rotate(bullet.direction * radToDeg);
	ctx.drawImage(bulletSprite, 0, 0)
	ctx.restore();
	bullet.__LIFETIME -= 1;
	if (bullet.__LIFETIME < 0) bullet.dead = true;
}

void function tick (game) {
	const deltaTime = game.deltaTime();
	const player = game.get("player");
	const room = game.get("room");
	if (player) {
		player.position = Vector2.from(player.position);
		if (lft) player.direction -= deltaTime * 350;
		if (rgt) player.direction += deltaTime * 350;
		if (bwd && spd > 0) spd -= game.get("acceleration") * deltaTime;
		if (fwd && spd < game.get("max speed")) spd += game.get("acceleration") * deltaTime;
		else if (spd > 0) spd -= frc;
		else if (spd < 0) spd = 0;
		player.position.add(Vector2.lenDir(spd, player.direction - 90));
		player.speed = spd;
		if (player.position.x + sprites[player.sprite].width/2 < 0) player.position.x = room.width + sprites[player.sprite].width/2;
		if (player.position.x - sprites[player.sprite].width/2 > room.width) player.position.x = -sprites[player.sprite].width/2;
		if (player.position.y + sprites[player.sprite].height/2 < 0) player.position.y = room.height + sprites[player.sprite].height/2;
		if (player.position.y - sprites[player.sprite].height/2 > room.height) player.position.y = -sprites[player.sprite].height/2;
	}
	game
		.enter("viewport")
			.fillRect()
			.exit()
		.enter("others")
			.forEach(player => draw(player));
			game
			.enter("bullets")
			.forEach(bullet => {
				updateBullet(bullet, deltaTime);
				if (bullet.dead) {
					const bullets = game.get("bullets");
					const index = bullets.find(b => b.id === bullet.id);
					bullets.splice(index, 1);
				}
			});
	draw(player, true);
	game
		.enter("viewport")
			.text(fpsFromDeltatime(deltaTime), 12, 18, "stroke");
	if (player) game
		.enter("viewport")
			.text("Speed: " + String(Math.round(spd * 10)).replace(/^(\d)$/, "0$1"), 46, 40, "stroke");
	return requestAnimationFrame(timestamp => {
		game.update(timestamp);
		tick(game)});
}(game);

const registerWall = document.querySelector("#register");
const nameInput = registerWall.querySelector("input");
registerWall.addEventListener("transitionend", registerWall.remove);
nameInput.addEventListener("keypress", event => {
	if (event.key.toLowerCase() !== "enter") return;
	socket.emit("try register", new Player(
		nameInput.value,
		Math.floor(Math.random() * game.get("room").width),
		Math.floor(Math.random() * game.get("room").height),
		Math.floor(Math.random() * 359),
		Math.floor(Math.random() * sprites.length)
	));
});

socket.on("announce joined", name => {
	console.log(`${name} joined the game!`);
});

socket.on("announce left", name => {
	console.log(`${name} left the game!`);
});

socket.on("invalid name", name => {
	console.error(`Username '${name}' already exists!`);
	registerWall.classList.add("invalid");
});

socket.on("download bullets", bullets => {
	game.set("bullets", bullets);
});

const netTickRate = .25;
socket.on("registered", player => {
	game
		.set("player", player);
	registerWall.classList.remove("invalid");
	registerWall.classList.add("fadeout");
	nameInput.disabled = true;
	setInterval(() => {
		socket.emit("upload player", game.get("player"));
	}, netTickRate);
});

setInterval(() => {
	socket.emit("request others", game.get("player"));
}, netTickRate);

socket.on("update others", others => {
	game.set("others", others);
});

window.kick = function (name) {
	game.set("others", new Array());
	socket.emit("kick", name);
}