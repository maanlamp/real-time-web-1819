"use strict";

import { fpsFromDeltatime } from "./modules/Frames.js";
import Canvas from "./modules/Canvas.js";
import Game from "./modules/Game.js";
import keybinds from "/data/keybinds.js";
import Player from "./modules/Player.js";
import Vector2 from "./modules/Vector2.js";
import Bullet from "./modules/Bullet.js";
import { loadImage } from "./modules/Load.js";

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
		.set("speed", 0)
		.set("turnspeed", 350)
		.set("sprites", Array.from(document.querySelectorAll("#sprites img")))
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
	fetch("https://cors-anywhere.herokuapp.com/http://hubblesite.org/api/v3/images?page=all")
		.then(res => res.json())
		.then(arr => arr.filter(item => item.name.match(/nebula/i)))
		.then(arr => arr[Math.floor(Math.random()*arr.length)].id)
		.then(id => fetch(`https://cors-anywhere.herokuapp.com/http://hubblesite.org/api/v3/image/${id}`))
		.then(res => res.json())
		.then(json => json.image_files[0])
		.then(img => game.set("background", img))
		.then(() => loadImage(game.get("background").file_url))
		.then(img => game.get("background").img = img)
		.catch(err => console.error("Gaat helemaal mis!\n" + err));
}();

const radToDeg = Math.PI / 180;
const sprites = game.get("sprites");
const ctx = game.get("viewport").__CTX;
function draw (player, outline = false) {
	if (!player) return;
	ctx.save();
	ctx.globalAlpha = player.dead ? .33 : 1;
	ctx.translate(player.position.x, player.position.y);
	ctx.scale(player.scale, player.scale);
	if (outline) {
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(0, 0, Math.max(sprites[player.sprite].width, sprites[player.sprite].height) / 2, 0, Math.PI * 2);
		ctx.stroke();
		ctx.lineWidth = 1;
	}
	ctx.fillStyle = "lime";
	ctx.fillText(player.name + ": " + player.score, 0, sprites[player.sprite].height/2 + 24);
	ctx.rotate(player.direction * radToDeg);
	ctx.drawImage(sprites[player.sprite], -sprites[player.sprite].width/2, -sprites[player.sprite].height/2);
	ctx.rotate(-player.direction * radToDeg);
	ctx.translate(0, sprites[player.sprite].height/2 + 40);
	ctx.fillStyle = "red";
	ctx.fillRect(-50, 0, 100, 5);
	ctx.fillStyle = "lime";
	ctx.fillRect(-50, 0, 100 * player.health / 1000, 5);
	ctx.restore();
}

let fwd = false;
let bwd = false;
let lft = false;
let rgt = false;
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
	if ((!player) || event.key !== " " || player.dead) return;
	game.add("bullets", new Bullet(player, bulletSprite));
	socket.emit("upload bullets", game.get("bullets"));
});

const bulletSprite = sprites.splice(sprites.findIndex(sprite => sprite.classList.contains("bullet")), 1)[0];
function updateBullet (bullet, deltatime) {
	bullet.position = Vector2
		.from(bullet.position)
		.add(Vector2.lenDir(bullet.speed * deltatime, bullet.direction - 90));
	ctx.save();
	ctx.globalAlpha = Math.min(1, bullet.__LIFETIME / 30);
	ctx.translate(bullet.position.x, bullet.position.y);
	ctx.rotate(bullet.direction * radToDeg);
	ctx.drawImage(bulletSprite, 0, 0)
	ctx.restore();
	bullet.__LIFETIME -= 1;
	if (bullet.__LIFETIME < 0) bullet.dead = true;
	game.get("others").forEach(other => {
		if (bullet.position.distance(other.position) > 50) return;
		bullet.dead = true;
		socket.emit("broadcast hit", game.get("player"), other);
	});
}

void function tick (game) {
	const deltaTime = game.deltaTime();
	const player = game.get("player");
	const room = game.get("room");
	if (player && !player.dead) {
		const turnspeed = Math.min(350, game.get("turnspeed") / player.speed * 2);
		player.position = Vector2.from(player.position);
		if (lft) player.direction -= deltaTime * turnspeed;
		if (rgt) player.direction += deltaTime * turnspeed;
		if (bwd && player.speed > 0) player.speed -= game.get("acceleration") * deltaTime;
		if (fwd && player.speed < game.get("max speed")) player.speed += game.get("acceleration") * deltaTime;
		else if (player.speed > 0) player.speed -= frc;
		else if (player.speed < 0) player.speed = 0;
		player.position.add(Vector2.lenDir(player.speed, player.direction - 90));
		if (player.position.x + sprites[player.sprite].width/2 < 0) player.position.x = room.width + sprites[player.sprite].width/2;
		if (player.position.x - sprites[player.sprite].width/2 > room.width) player.position.x = -sprites[player.sprite].width/2;
		if (player.position.y + sprites[player.sprite].height/2 < 0) player.position.y = room.height + sprites[player.sprite].height/2;
		if (player.position.y - sprites[player.sprite].height/2 > room.height) player.position.y = -sprites[player.sprite].height/2;
	}
	const bg = game.get("background");
	if (bg && bg.img) {
		game
		.enter("viewport")
			.drawImage(bg.img, 0, 0, bg.width, bg.height, 0, 0, room.width, room.height);
	} else {
		game
		.enter("viewport")
			.fillRect();
	}
	game.enter("others")
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
			.text("Speed: " + String(Math.round(player.speed * 10)).replace(/^(\d)$/, "0$1"), 46, 40, "stroke");
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
	announce(`${name} joined the game!`);
});

socket.on("announce left", name => {
	announce(`${name} left the game!`);
});

socket.on("invalid name", name => {
	registerWall.classList.add("invalid");
});

socket.on("download bullets", bullets => {
	game.set("bullets", bullets);
});

const netTickRate = 1000 * .033;
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

socket.on("hit", (shooter, reciever) => {
	const player = game.get("player");
	if (reciever.name !== player.name) return;
	if (player.dead) return;
	if (shooter.name === player.name) return;
	player.health -= 100;
	if (player.health <= 0) die(shooter, player);
});

function die (shooter, player) {
	player.dead = true;
	socket.emit("broadcast kill", shooter, player);
	setTimeout(() => {
		player.dead = false;
		player.position.x = Math.floor(Math.random() * game.get("room").width);
		player.position.y = Math.floor(Math.random() * game.get("room").height);
		player.direction = Math.floor(Math.random() * 359);
		player.sprite = Math.floor(Math.random() * sprites.length);
		player.health = 1000;
		player.speed = 0;
	}, 5000);
}

socket.on("got kill", (shooter, reciever) => {
	const player = game.get("player");
	announce(`${shooter.name} killed ${reciever.name}`);
	if (shooter.name !== player.name) return;
	player.score += 100;
});

window.kick = function (name) {
	game.set("others", new Array());
	socket.emit("kick", name);
}

const messages = document.querySelector("#messages");
function announce (msg) {
	const element = document.createElement("DIV");
	element.innerText = msg;
	element.addEventListener("animationend", () => element.remove());
	while (messages.childElementCount > 10) messages.firstElementChild.remove();
	messages.append(element);
}