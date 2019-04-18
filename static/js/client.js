"use strict";

import { loadImage, loadJSON } from "./modules/Load.js";
import { fpsFromDeltatime } from "./modules/Frames.js";
import ResetableTimeout from "./modules/ResetableTimeout.js";
import Canvas from "./modules/Canvas.js";
import Game from "./modules/Game.js";
import keybinds from "/data/keybinds.js";
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

	document.body.appendChild(canvas.element);
	window.addEventListener("resize", () => resizeTimeout.reset());

	game
		.bindkeys(keybinds)
		.set("viewport", canvas)
		.set("views", new Array())
		.set("players", new Array())
		.add("views", game.get("viewport"))
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
		window.GLOBALSPRITETEST = await loadImage("images/test.png");
}();

function draw (player) {
	if (!player) return;
	const ctx = game.get("viewport").__CTX;
	player.direction += 1;
	ctx.save();
	ctx.translate(player.position.x, player.position.y);
	ctx.strokeText(player.name, 0, window.GLOBALSPRITETEST.height/2 + 16);
	ctx.rotate(player.direction * Math.PI / 180);
	ctx.drawImage(window.GLOBALSPRITETEST, -window.GLOBALSPRITETEST.width/2, -window.GLOBALSPRITETEST.height/2)
	ctx.restore();
}

void function tick (game) {
	const deltaTime = game.deltaTime();

	game
		.enter("viewport")
			.fillRect()
			.exit()
		.enter("players")
			.forEach(player => draw(player));

	game
		.enter("viewport")
			.text(fpsFromDeltatime(deltaTime), 6, 18, "stroke");
		
	const player = game.get("player");
	if (player) socket.emit("update", player);

	return requestAnimationFrame(timestamp => {
		game.update(timestamp);
		tick(game)});
}(game);

const registerWall = document.querySelector("#register");
const register = registerWall.querySelector("input");
registerWall.addEventListener("transitionend", () => {
	registerWall.remove();
});
register.addEventListener("keypress", event => {
	if (event.key.toLowerCase() !== "enter") return;
	socket.emit("register", register.value);
});

socket.on("registered", name => {
	console.log(`${name} joined the game!`);
	game.set("player", {
		name,
		position: Vector2.random(window.innerWidth, window.innerHeight),
		direction: Math.floor(Math.random()*359),
		sprite: window.GLOBALSPRITETEST
	});
	registerWall.classList.add("fadeout");
	register.disabled = true;
}).on("invalid", name => {
	console.error(`Username '${name}' already exists!`);
	registerWall.classList.add("invalid");
}).on("update", users => {
	game.set("players", users);
});