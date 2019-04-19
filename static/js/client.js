"use strict";

import { fpsFromDeltatime } from "./modules/Frames.js";
import ResetableTimeout from "./modules/ResetableTimeout.js";
import Canvas from "./modules/Canvas.js";
import Game from "./modules/Game.js";
import keybinds from "/data/keybinds.js";
import Player from "./modules/Player.js";
import Vector2 from "./modules/Vector2.js";

const socket = io();
const game = new Game();
console.log(game);
window.game = game;

void async function createMainView () {
	const canvas = new Canvas(window);
	const resizeTimeout = new ResetableTimeout({
		timeout: 200,
		handler () {canvas.resize(window)}
	});
	document.body.prepend(canvas.element);
	window.addEventListener("resize", () => resizeTimeout.reset());
	game
		.bindkeys(keybinds)
		.set("viewport", canvas)
		.set("room", {width: 100, height: 100})
		.set("others", new Array())
		.set("sprites", Array.from(document.querySelectorAll("img.sprite")))
		.enter("viewport")
			.clear()
			.style(`
				font: 13px "Fira Code";
				fill: black;
				image-smoothing: true high;
				text-align: center`)
			.exit();

		//DEBUG
		game.get("viewport").__CTX.strokeStyle = "lime";
		game.get("viewport").__CTX.textAlign = "center";
}();

const radToDeg = Math.PI / 180;
const sprites = game.get("sprites");
const ctx = game.get("viewport").__CTX;
function draw (player) {
	if (!player) return;
	ctx.save();
	ctx.translate(player.position.x, player.position.y);
	ctx.strokeText(player.name, 0, sprites[player.sprite].height/2 + 16);
	ctx.rotate(player.direction * radToDeg);
	ctx.drawImage(sprites[player.sprite], -sprites[player.sprite].width/2, -sprites[player.sprite].height/2)
	ctx.restore();
}


let fwd = false;
let bwd = false;
let lft = false;
let rgt = false;
let spd = 0;
const acc = 10;
const frc = 0; //SET TO HIGHER FOR FRICTION, BUT THERES NO FRICTION IN SPACE!!
const maxSpeed = 10;
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
void function tick (game) {
	const deltaTime = game.deltaTime();
	const player = game.get("player");
	if (player) {
		player.position = Vector2.from(player.position);
		if (lft) player.direction -= deltaTime * 350;
		if (rgt) player.direction += deltaTime * 350;
		if (bwd && spd > 0) spd -= acc * deltaTime;
		if (fwd && spd < maxSpeed) spd += acc * deltaTime;
		else if (spd > 0) spd -= frc;
		else if (spd < 0) spd = 0;
		player.position.add(Vector2.lenDir(spd, player.direction - 90));
	}
	game
		.enter("viewport")
			.fillRect()
			.exit()
		.enter("others")
			.forEach(player => draw(player));
	draw(game.get("player"));
	game
		.enter("viewport")
			.text(fpsFromDeltatime(deltaTime), 6, 18, "stroke");
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

const second = 1000;
const netTickRate = 1 / 30 * second;
socket.on("registered", player => {
	game.set("player", player);
	registerWall.classList.remove("invalid");
	registerWall.classList.add("fadeout");
	nameInput.disabled = true;
	setInterval(() => {
		socket.emit("upload player", game.get("player"));
	}, netTickRate);
});

socket.on("update others", others => {
	game.set("others", others);
});