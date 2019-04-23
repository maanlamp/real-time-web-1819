"use strict";

import Vector2 from "./Vector2.js";

export default class Camera {
	constructor () {
		this.position = new Vector2();
		this.__TARGET = null;
		this.__INTERVAL = null;
	}

	follow (obj) {
		this.__TARGET = obj;
		this.__INTERVAL = setInterval(() => {
			this.position.set(this.__TARGET.position);
		}, 16.66);
		return this;
	}

	unfollow () {
		clearInterval(this.__INTERVAL);
		this.__INTERVAL = null;
		this.__TARGET = null;
		return this;
	}
}