"use strict";
import Canvas from "./Canvas.js";
import assert from "./Assert.js";

export default class Spritesheet {
	constructor () {
		this.__width = 128;
		this.__height = 128;
		this.canvas = new Canvas({width: this.__width, height: this.__height});
		this.canvas.style("fill: red");
		this.canvas.fillRect();
	}

	get width () {return this.__width;}
	get height () {return this.__height;}

	resize (w, h = w) {
		if (typeof w !== "number") return this.resizeTo(w);

		this.__width = w;
		this.__height = h;

		return this;
	}

	resizeTo (target) {
		assert(typeof target.width === "number")
			.or(typeof target.height === "number")
			.error(`Expected property width/height of type 'number', but got [${typeof target} ${(target.constructor||{}).name||"null"}].`);

		const {width, height = width} = target;

		return this.resize(width, height);
	}
}