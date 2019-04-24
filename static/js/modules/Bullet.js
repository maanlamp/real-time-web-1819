"use strict";

import Vector2 from "./Vector2.js";

const radToDeg = Math.PI / 180;

export default class Bullet {
	constructor (owner, bulletSprite) {
		this.id = (Math.random() * 1000).toString(16).replace(/\./, "");
		this.__LIFETIME = 30; //60 = 1sec
		this.dead = false;
		this.owner = owner;
		this.direction = owner.direction;
		this.speed = 1000 + owner.speed * 60;
		this.position = Vector2.from(owner.position).add(Vector2.lenDir(Math.max(bulletSprite.width, bulletSprite.height), this.direction - 90));
	}
}