"use strict";

import Vector2 from "./Vector2.js";

const radToDeg = Math.PI / 180;

export default class Bullet {
	constructor (owner, sprites, ctx) {
		this.id = (Math.random() * 1000).toString(16).replace(/\./, "");
		this.__CTX = ctx;
		this.__LIFETIME = 30; //60 = 1sec
		this.dead = false;
		this.owner = owner;
		this.direction = owner.direction;
		this.speed = 1000 + owner.speed * 60;
		this.sprite = sprites.find(sprite => sprite.classList.contains("bullet"));
		this.position = Vector2.from(owner.position).add(Vector2.lenDir(Math.max(this.sprite.width, this.sprite.height), this.direction - 90));
	}

	draw () {
		const ctx = this.__CTX;
		ctx.save();
		ctx.globalAlpha = Math.min(1, this.__LIFETIME / 30);
		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(this.direction * radToDeg);
		ctx.drawImage(this.sprite, 0, 0)
		ctx.restore();
	}

	update (deltatime) {
		this.position.add(Vector2.lenDir(this.speed * deltatime, this.direction - 90));
		this.draw();
		this.__LIFETIME -= 1;
		if (this.__LIFETIME < 0) this.dead = true;
	}
}